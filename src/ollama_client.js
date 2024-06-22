/* ollama_client.js
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
import GObject from 'gi://GObject';
import Soup from 'gi://Soup?version=3.0';

import * as settings from './settings.js';

import {sendAsync} from './http_utils.js';

const OLLAMA_FORMAT_TEXT = undefined;
const OLLAMA_FORMAT_JSON = 'json';

const OLLAMA_ROLE_SYSTEM = 'system';
const OLLAMA_ROLE_USER = 'user';
const OLLAMA_ROLE_ASSISTANT = 'assistant';

export const USER_AGENT = 'Secretary/v1'

/**
 * @typedef {string} OllamaModel
 * @typedef {OLLAMA_FORMAT_TEXT | OLLAMA_FORMAT_JSON}  OllamaFormat
 * @typedef {{
 *   seed?: number,
 *   temperature?: number
 * }} OllamaOptions
 * @typedef {OLLAMA_ROLE_SYSTEM | OLLAMA_ROLE_USER | OLLAMA_ROLE_ASSISTANT} OllamaRole
 * @typedef {any} OllamaImage
 * @typedef {{role: OllamaRole, content: string, images?: string[]}}  OllamaMessage
 * @typedef {{
 *  model: OllamaModel
 *  messages: OllamaMessage[]
 *  format?: OllamaFormat
 *  options?: OllamaOptions
 *  stream?: boolean
 *  keep_alive?: string
 * }} OllamaChatCompletionRequest
 * @typedef {{
 *   model: OllamaModel
 *   create_at: string
 *   message: OllamaMessage
 *   done_reason?: string
 *   done: boolean
 *   total_duration?: number
 *   load_duration?: number
 *   prompt_eval_duration?: number
 *   eval_count?: number
 *   eval_duration?: number
 * }} OllamaChatCompletionResponse
 */

/**
 * An Ollama chat session.
 */
// TODO Make this a GObject
export class OllamaChatSession extends GObject.Object {

  static {
    GObject.registerClass(
      {
        GTypeName: 'OllamaChatSession',
      },
      OllamaChatSession,
    );
  }

  /**
   * Transport / underlying HTTP session.
   * @type {Soup.Session}
   */
  #httpSession

  /** @type {string} */
  #base_url;

  /** @type {OllamaModel} */
  #model;

  get model() {
    return this.#model;
  }

  /** @type {OllamaOptions} */
  #options

  get options() { return this.#options; }

  /** @type {OllamaMessage[]} */
  #messages

  /** @type {OllamaFormat|undefined} */
  #format

  get format() { return this.#format }

  /** @type {string} */
  #keep_alive

  get keep_alive() { return this.#keep_alive; }

  /**
   * Creates a new session to be used to interact with a running Ollama server instance.
   *
   * @param {string} base_url
   *   Base URL of the Ollama instance to query.
   * @param {OllamaModel} model
   *   Language model to be used for all queries.
   * @param {OllamaMessage[]} messages
   *   Initial messages, e.g. system messages to pre-tune the behavior
   *   of the language model.
   * @param {OllamaOptions} options
   *   Optional options to be used when sending queries.
   * @param {OllamaFormat} [format]
   *   Desired output format.
   * @param {string} keep_alive
   */
  constructor(base_url, model, messages=[], options={}, format=undefined, keep_alive='5m') {
    super();
    this.#httpSession = new Soup.Session({ userAgent: USER_AGENT, maxConns: 1 });
    this.#base_url = base_url;
    this.#model = model;
    this.#messages = messages ?? [];
    this.#options = options ?? {};
    this.#format = format;
    this.#keep_alive = keep_alive ?? '5m';
    console.log(`Initial chat session created (model: ${this.#model}, URL: ${this.#base_url}).`);
  }

  /**
   * Sends a chat message.
   *
   * See https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion
   *
   * @param {string} content
   *   Text message to be send.
   * @param {OllamaImage[]|undefined} images
   *   Optional base64-encoded images to send along with the text message.
   * @returns {{
   *   uri: string
   *   cancellable: Gio.Cancellable
   *   request: OllamaChatCompletionRequest
   *   response: () => Promise<OllamaChatCompletionResponse>
   * }}
   */
  chat(content, images=undefined) {

    /** @type {OllamaMessage} */
    const requestMessage = {
      role: 'user',
      content: content,
      images: images
    }
    const cancellable = new Gio.Cancellable();

    const messages2 = [...this.#messages];
    messages2.push(requestMessage);

    /** @type {OllamaChatCompletionRequest} */
    const chatCompletionRequest = {
      model: this.#model,
      messages: messages2,
      format: this.#format,
      stream: this.#format === undefined,
      options: this.#options,
      keep_alive: this.#keep_alive,
    };

    /** @type {OllamaChatCompletionResponse} */
    const chatCompletionResponse = {
      model: '<unknown>',
      message: {
        role: 'assistant',
        content: '',
        images: undefined,
      },
      done_reason: '<unknown>',
      create_at: '<unknown>',
      done: false,
    };
    const response = sendAsync(this.#httpSession, `${this.#base_url}/api/chat`, chatCompletionRequest, chatCompletionResponse, (input, output, /** @type {OllamaChatCompletionResponse} */ chunk) => {
      output.message.content += chunk.message.content;
      // Last chunk of data has been received, as it seems.
      if (chunk.done) {
        delete chunk.message;
        Object.assign(output, chunk);
        this.#messages.push(requestMessage); // append request to conversation history
        this.#messages.push(output.message); // append response to conversation history
      }
    });

    return response;
  }

}

export class OllamaClient extends GObject.Object {

  static {
    GObject.registerClass(
      {
        GTypeName: 'OllamaClient',
        Properties: {
          'settings': GObject.param_spec_object(
            'settings',
            'settings',
            'Ollama-specific settings',
            Gio.Settings.$gtype,
            GObject.ParamFlags.READWRITE,
          ),
          'ollama_client': GObject.param_spec_object(
            'session',
            'session',
            'Ollama chat session',
            OllamaChatSession.$gtype,
            GObject.ParamFlags.READABLE,
          ),
        },
        Signals: {
          "reset": {
            flags: GObject.SignalFlags.ACTION,
            param_types: [
              // TODO send new session, once it's a GObject.
            ]
          },
        }
      },
      OllamaClient,
    );
  }

  /** @type {OllamaChatSession} */
  #session;
  get session() { return this.#session; }

  /** @type {OllamaMessage[]} */
  #behavior;

  /**
   *
   * @param {Partial<GObject.ObjectConstructParam> & {
   *   settings: Gio.Settings
   * }} params
   */
  constructor(params) {
    super(params);
    this.#behavior = [
      {
        'role': 'system',
        'content': 'Your name is Secretary. You shall introduce yourself as a personal assistant, if asked.'
      },
    ];
    this.#session = this.#resetChatSession();
  }

  #resetChatSession() {
    const seed = this.settings.get_int(settings.SETTINGS_KEY_OLLAMA_OPTION_SEED);
    const temperature = this.settings.get_double(settings.SETTINGS_KEY_OLLAMA_OPTION_TEMPERATURE);
    const session = new OllamaChatSession(
      this.settings.get_string(settings.SETTINGS_KEY_OLLAMA_URL),
      this.settings.get_string(settings.SETTINGS_KEY_OLLAMA_MODEL), this.#behavior, {
      seed: seed ?? undefined,
      temperature: temperature ?? undefined,
    });
    //this.emit('reset'); // TODO add session as param once it's a gobject.
    return session;
  }

  reset() {
    this.#session = this.#resetChatSession();
  }

}
