/* settings.js
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

import { APPLICATION_ID } from './constants.js';

export const SETTINGS_SCHEMA_ID = APPLICATION_ID;

export const SETTINGS_KEY_SAFE_SEARCH = 'safe-search';
export const SETTINGS_KEY_OLLAMA_URL = 'url';
export const SETTINGS_KEY_OLLAMA_MODEL = 'model';
export const SETTINGS_KEY_OLLAMA_OPTION_SEED = 'option-seed';
export const SETTINGS_KEY_OLLAMA_OPTION_TEMPERATURE = 'option-temperature';

export function common_settings() {
  return new Gio.Settings({ schema_id: SETTINGS_SCHEMA_ID });
}

export function ollama_settings() {
  return new Gio.Settings({ schema_id: `${SETTINGS_SCHEMA_ID}.ollama` });
}
