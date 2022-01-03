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
const { Meta } = imports.gi;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { EntryPointFactory } = SRC.EntryPointFactory;
const { toucheggClient } = SRC.touchegg.ToucheggClient;
const { ToucheggConfig } = SRC.touchegg.ToucheggConfig;
const { Notification } = SRC.utils.Notification;
const { logger } = SRC.utils.Logger;

class Extension {
  static enable() {
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
        'https://github.com/JoseExposito/touchegg#readme',
      );
    }

    toucheggClient.stablishConnection();
    entryPoint.start();
  }

  static disable() {
    logger.log('Extension disabled');

    toucheggClient.closeConnection();

    const entryPoint = EntryPointFactory.buildEntryPoint();
    if (entryPoint) {
      entryPoint.stop();
    }
  }
}

// eslint-disable-next-line
function init() {
  return Extension;
}
