/*
 * Copyright 2021 - 2023 José Expósito <jose.exposito89@gmail.com>
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
/* eslint-disable class-methods-use-this */
import Meta from 'gi://Meta';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import EntryPointFactory from './src/EntryPointFactory.js';
import ToucheggClient from './src/touchegg/ToucheggClient.js';
import ToucheggConfig from './src/touchegg/ToucheggConfig.js';
import Notification from './src/utils/Notification.js';
import logger from './src/utils/Logger.js';

class X11GesturesExtension extends Extension {
  enable() {
    logger.log('Extension enabled');

    if (Meta.is_wayland_compositor()) {
      logger.log('This extension is only for X11');
      return;
    }

    const entryPoint = EntryPointFactory.buildEntryPoint();
    if (!entryPoint) {
      logger.log('This version of GNOME Shell is not supported');
      return;
    }

    if (!ToucheggConfig.isToucheggInstalled()) {
      logger.log('Touchégg is NOT installed');
      Notification.send(
        'Touchégg is not installed',
        'Please install Touchégg to enable multi-touch gestures',
      );
    }

    const toucheggClient = ToucheggClient.getInstance();
    toucheggClient.stablishConnection();

    const settings = this.getSettings('org.gnome.shell.extensions.x11gestures');
    entryPoint.start(settings);
  }

  disable() {
    logger.log('Extension disabled');

    const toucheggClient = ToucheggClient.getInstance();
    toucheggClient.closeConnection();

    const entryPoint = EntryPointFactory.buildEntryPoint();
    if (entryPoint) {
      entryPoint.stop();
    }
  }
}

export default X11GesturesExtension;
