/* preferences.js
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
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
import Adw from 'gi://Adw';

import * as settings from './settings.js';

export const SecretaryPreferencesDialog = GObject.registerClass({
    GTypeName: 'SecretaryPreferencesDialog',
    Template: 'resource:///com/cathive/Secretary/preferences.ui',
    InternalChildren: [
      'safe_search_switch',
      'ollama_url_entry',
      'ollama_model_entry',
      'ollama_option_seed_entry',
      'ollama_option_temperature_entry',
    ],
    Properties: {
      "settingsBackendCommon": GObject.ParamSpec.object(
        "settings-backend-common",
        "GSettings Backend",
        "Storage backend stored in GSettings",
        GObject.ParamFlags.READWRITE,
        Gio.Settings.$gtype,
      ),
      "settingsBackendOllama": GObject.ParamSpec.object(
        "settings-backend-ollama",
        "Ollama configuration",
        "Storage backend stored in GSettings",
        GObject.ParamFlags.READWRITE,
        Gio.Settings.$gtype,
      ),
    }
}, class SecretaryPreferencesDialog extends Adw.PreferencesDialog {

    /** @type {Gio.Settings} */
    //get settingsBackendCommon() { return this.settings_backend_common; }

    /** @type {Adw.SwitchRow} */
    //get safeSearchSwitch() { return this._safe_search_switch; }


    /**
     * @param {Partial<Adw.PreferencesDialog.ConstructorProperties> & {
     *   settings_backend_common?: Gio.Settings
     *   settings_backend_ollama?: Gio.Settings
     * }} params
     */
    constructor(params) {
        super(params);
        this.settings_backend_common.bind(settings.SETTINGS_KEY_SAFE_SEARCH, this._safe_search_switch, 'active', Gio.SettingsBindFlags.DEFAULT);
        this.settings_backend_ollama.bind(settings.SETTINGS_KEY_OLLAMA_URL, this._ollama_url_entry, 'text', Gio.SettingsBindFlags.DEFAULT);
        this.settings_backend_ollama.bind(settings.SETTINGS_KEY_OLLAMA_MODEL, this._ollama_model_entry, 'text', Gio.SettingsBindFlags.DEFAULT);
        this.settings_backend_ollama.bind(settings.SETTINGS_KEY_OLLAMA_OPTION_SEED, this._ollama_option_seed_entry, 'value', Gio.SettingsBindFlags.DEFAULT);
        this.settings_backend_ollama.bind(settings.SETTINGS_KEY_OLLAMA_OPTION_TEMPERATURE, this._ollama_option_temperature_entry, 'value', Gio.SettingsBindFlags.DEFAULT);
    }
});

