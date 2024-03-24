/*
 * Copyright 2021 - 2024 José Expósito <jose.exposito89@gmail.com>
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
import GObject from 'gi://GObject';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';
import EntryPoint40 from './v40/EntryPoint40.js';
import logger from './utils/Logger.js';

/**
 * Factory to build an entry point based on the current GNOME Shell version.
 */
class EntryPointFactoryClass extends GObject.Object {
  static buildEntryPoint() {
    const ShellVersion = Config.PACKAGE_VERSION;
    logger.log(`Building entry point for GNOME Shell ${ShellVersion}`);

    if (ShellVersion.startsWith('4')) {
      return EntryPoint40;
    }

    return null;
  }
}

const EntryPointFactory = GObject.registerClass(EntryPointFactoryClass);
export default EntryPointFactory;
