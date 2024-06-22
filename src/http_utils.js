/* http_utils.js
 *
 * Copyright 2024 Benjamin P. Jung
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Soup from 'gi://Soup?version=3.0';

const CHUNK_BUFFER_SIZE = 128;

/**
 * Sends an asynchronous HTTP(S) request.
 *
 * This function can be used to interact with APIs that emit JSONL
 * (one JSON document per line) in it's response body.
 *
 * @template {Object|any[]} I
 *   Input payload
 * @template {Object} C
 *   Chunks of the response that will be proceseed on the way.
 *   Basically, this is JSONL (one JSON document per response line)
 * @template {Object} O
 * @param {Soup.Session} httpSession
 *   HTTP session to be used to spawn requests.
 * @param {string} uri
 *   Absolute URI to be requested.
 * @param {I} request
 * @param {O} response
 * @param {{(input: I, output: O, chunk: C): void}} processor
 *   Function to be used to process chunks of data to construct the final result.
 * @returns {{
*   uri: string
*   cancellable: Gio.Cancellable
*   request: I
*   statusCode: number
*   response: () => Promise<O>
* }}
*/
export function sendAsync(httpSession, uri, request, response, processor) {

  const cancellable = new Gio.Cancellable();
  const soupMessage = new Soup.Message({
    method: 'POST',
    uri: GLib.Uri.parse(uri, GLib.UriFlags.NONE),
  });
  soupMessage.set_request_body_from_bytes(
    'application/json',
    new GLib.Bytes(new TextEncoder().encode(JSON.stringify(request)))
  );

  /** @type {Promise<O>} */
  const responseP = new Promise((resolve, reject) => {

    httpSession.send_async(soupMessage, GLib.PRIORITY_DEFAULT, cancellable, (self, result) => {
      /** @type {Gio.InputStream} */
      let inputStream;
      try {
        inputStream = (self ?? httpSession).send_finish(result);
      } catch (err) {
        reject(err);
        return;
      }

      const statusCode = soupMessage.statusCode;
      const reasonPhrase = soupMessage.reasonPhrase;
      if (statusCode !== Soup.Status.OK) {
        reject(new Error(`${statusCode}-${reasonPhrase}`));
        return;
      }


      const decoder = new TextDecoder();

      // Poor man's implementation of a receiving buffer.
      let buf = '';

      /** @type {Gio.AsyncReadyCallback<Gio.InputStream>} */
      const processBytes = (source_object, res, data) => {
        const chunk = source_object?.read_bytes_finish(res) ?? new GLib.Bytes(null);
        buf += decoder.decode(chunk.toArray());
        let lfIdx = buf.indexOf('\n');
        // Check if rcv buffer contains any new line characters already.
        // If so, parse every line as JSON and process it.
        while (lfIdx !== -1) {
          const obj = JSON.parse(buf.substring(0, lfIdx));
          processor(request, response, obj);
          buf = buf.substring(lfIdx + 1);
          lfIdx = buf.indexOf('\n');
        }
        if (chunk.get_size() > 0) {
          source_object?.read_bytes_async(CHUNK_BUFFER_SIZE, GLib.PRIORITY_DEFAULT, cancellable, processBytes);
        } else {
          resolve(response);
          return;
        }
      };
      inputStream.read_bytes_async(CHUNK_BUFFER_SIZE, GLib.PRIORITY_DEFAULT, cancellable, processBytes);
    });
  });

  return {
    uri: uri,
    request: request,
    cancellable: cancellable,
    statusCode: soupMessage.statusCode,
    response: () => responseP,
  };

}
