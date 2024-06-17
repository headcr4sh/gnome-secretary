/* window.js
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

import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';

import { OllamaClient } from './ollama_client.js';

export class SecretaryWindow extends Adw.ApplicationWindow {

  static {
    GObject.registerClass({
      GTypeName: 'SecretaryWindow',
      Template: 'resource:///com/cathive/Secretary/window.ui',
      InternalChildren: [
        'messages_list_box',
        'input_entry',
      ],
      Properties: {
        'ollama_client': GObject.ParamSpec.object(
          'ollama-client',
          'Ollama client',
          'Ollama API wrapper that takes care of calling the REST API.',
          GObject.ParamFlags.READWRITE,
          OllamaClient.$gtype,
        ),
      },
      Signals: {
        // TODO Add signals for state change of the underlying Ollama session once we receive these signals.
      },
    }, SecretaryWindow);
  }

    /**
     * @param {Adw.ApplicationWindow.ConstructorProperties & {
     *   ollama_client: OllamaClient
     * }|undefined} params
     */
    constructor(params) {
        super(params);

        this._input_entry.connect('activate', (/** @type {Gtk.Entry} */ target) => {
          const buffer = target.get_buffer();
          const content = buffer.get_text().trim();
          buffer.delete_text(0, buffer.get_length());
          if (content != null && content !== '') {
            // TODO Send message.
            // TODO REMOVE ME BEGIN
            console.log('Sending message: ' + content);
            (async () => {
              const session = this.ollama_client.session;
              let req = session.chat(content);
              console.log((await (req.response())).message.content);
            })();
            // TODO REMOVE ME END
          }
        });

    }
}

