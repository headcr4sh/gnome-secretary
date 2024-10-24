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


import { SecretaryApplication } from './application.js';

/**
 * Main loop entry point.
 * @param {string[] | undefined} argv
 * @returns {Promise<number>}
 */
export function main(argv=undefined) {
  const application = SecretaryApplication.newWithDefaults();

  // @ts-expect-error gi.ts can't generate this, but it exists.
  return application.runAsync(argv);
}
