/* main.js
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

import Notify from 'gi://Notify';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import { common_settings, ollama_settings } from './settings.js';
import * as constants from './constants.js';
import { SecretaryWindow } from './window.js';
import { SecretaryPreferencesDialog } from './preferences.js';

import { OllamaClient } from './ollama_client.js';

export class SecretaryApplication extends Adw.Application {

  static {
    GObject.registerClass({
      GTypeName: 'SecretaryApplication',
      Properties: {
        'settings': GObject.param_spec_object(
          'settings',
          'settings',
          'Settings backend',
          Gio.Settings.$gtype,
          GObject.ParamFlags.READWRITE,
        ),
        'ollama_client': GObject.param_spec_object(
          'ollama-client',
          'ollama-client',
          'Ollama client wrapper',
          OllamaClient.$gtype,
          GObject.ParamFlags.READWRITE,
        ),
      }
    }, SecretaryApplication);
  }

    static newWithDefaults() {
      return new SecretaryApplication({
        application_id: constants.APPLICATION_ID,
        flags: Gio.ApplicationFlags.DEFAULT_FLAGS,
        settings: common_settings(),
      });
    }

    /**
     *
     * @param {Partial<Adw.Application.ConstructorProperties> & {
     *    settings: Gio.Settings,
     * }} args
     */
    constructor(args) {
      super(args);

      this.ollama_client = new OllamaClient({
        settings: ollama_settings(),
      });

      const quit_action = new Gio.SimpleAction({ name: 'quit' });
      quit_action.connect('activate', (action) => {
        this.quit();
      });
      this.add_action(quit_action);
      this.set_accels_for_action('app.quit', ['<primary>q']);

      const show_about_action = new Gio.SimpleAction({ name: 'about' });
      show_about_action.connect('activate', (action) => {
        const aboutDialog = new Adw.AboutDialog({
          application_name: 'secretary',
          application_icon: this.application_id,
          developer_name: 'Benjamin P. Jung',
          version: constants.APPLICATION_VERSION,
          developers: [
            'Benjamin P. Jung'
          ],
          copyright: '© 2024 Benjamin P. Jung'
        });
        aboutDialog.present(this.active_window);
      });
      this.add_action(show_about_action);

      const show_preferences_action = new Gio.SimpleAction({ name: 'preferences' });
      show_preferences_action.connect('activate', (action) => {
        new SecretaryPreferencesDialog({
          settings_backend_common: common_settings(),
          settings_backend_ollama: ollama_settings(),
        })
        .present(this.active_window);
      });
      this.add_action(show_preferences_action);

    }

    /** @override */
    vfunc_startup() {
      if (!Notify.is_initted()) {
        const success = Notify.init(this.applicationId);
        if (!success) {
          console.error('Libnotify initialization failed.')
        } else {
          console.log(`Libnotify initialized successfully for application "${Notify.get_app_name()}".`);
        }
      }

      super.vfunc_startup();
    }

    /** @override */
    vfunc_activate() {
      super.vfunc_activate();
      let { activeWindow } = this;

      if (!activeWindow) {
        activeWindow = new SecretaryWindow({
          application: this,
          ollama_client: this.ollama_client,
        });
      }

      activeWindow.present();
    }

    /** @override */
    vfunc_shutdown() {
      if (Notify.is_initted()) {
        Notify.uninit();
      }
      super.vfunc_shutdown();
    }

  }
