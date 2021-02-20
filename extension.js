/*
 * Copyright 2021 José Expósito <jose.exposito89@gmail.com>
 *
 * This file is part of gnome-shell-extension-x11gestures.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation,  either version 3 of the License,  or (at your option)  any later
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
const { Shell } = imports.gi;
const { wm } = imports.ui.main;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { ToucheggSwipeTracker } = SRC.ToucheggSwipeTracker;
const { toucheggClient } = SRC.ToucheggClient;
const { logger } = SRC.utils.Logger;

class Extension {
  static enable() {
    logger.log('Extension enabled');

    toucheggClient.stablishConnection();

    if (wm) {
      logger.log('Connect ToucheggSwipeTracker to wm');

      const tracker = new ToucheggSwipeTracker(
        global.stage,
        Shell.ActionMode.NORMAL,
        { allowDrag: false, allowScroll: false },
      );

      /* eslint-disable no-underscore-dangle */
      tracker.connect('begin', wm._switchWorkspaceBegin.bind(wm));
      tracker.connect('update', wm._switchWorkspaceUpdate.bind(wm));
      tracker.connect('end', wm._switchWorkspaceEnd.bind(wm));
      wm._toucheggTracker = tracker;
      /* eslint-enable no-underscore-dangle */
    }
  }

  static disable() {
    logger.log('Extension disabled');
    toucheggClient.closeConnection();
  }
}

// eslint-disable-next-line
function init() {
  return Extension;
}
