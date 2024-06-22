/* message.js
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

export class Message extends Gtk.ListBoxRow {

  static {
    GObject.registerClass({
      GTypeName: 'Message',
      Template: 'resource:///com/cathive/Secretary/message.ui',
      InternalChildren: [
        'content',
      ],
    }, Message);
  }

    /**
     * @param {Partial<Gtk.ListBoxRow.ConstructorProperties> & {
     * }|undefined} params
     */
    constructor(params) {
        super(params);
    }
}

