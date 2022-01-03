/*
 * Copyright 2021 - 2022 José Expósito <jose.exposito89@gmail.com>
 *
 * This file is part of gnome-shell-extension-x11gestures.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation,  either version 2 of the License,  or (at your option)  any later
 * version.
 *
 * This program is distributed in the hope that it will be useful,  but  WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the  GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 */
const { GObject } = imports.gi;

/**
 * Utility class to print information to the log prefixing it with the extension name.
 */
const Logger = GObject.registerClass(
  class Logger extends GObject.Object {
    _init() {
      this.extensionName = imports.misc.extensionUtils.getCurrentExtension().uuid;
    }

    /**
     * Log an informative message.
     *
     * @param {string} text Text to log.
     */
    log(text) {
      log(`[${this.extensionName}] ${text}`);
    }

    /**
     * Log a error message.
     *
     * @param {string} text Text to log.
     * @param {Error} error JS Error object.
     */
    error(text, error) {
      logError(error, `[${this.extensionName}] ${text}`);
    }
  },
);

var logger = // eslint-disable-line
  new Logger();
