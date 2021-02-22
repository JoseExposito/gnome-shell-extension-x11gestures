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
const { GObject, Shell } = imports.gi;
const { wm, overview } = imports.ui.main;
const Main = imports.ui.main;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { SwipeTracker336 } = SRC.v336.SwipeTracker336;
const { GestureType, GestureDirection, DeviceType } = SRC.touchegg.ToucheggTypes;
const { ToucheggSettings } = SRC.touchegg.ToucheggSettings;
const { logger } = SRC.utils.Logger;

/**
 * Entry point for GNOME Shell 3.36 and 3.38.
 */
class EntryPoint336Class extends GObject.Object {
  static start() {
    EntryPoint336Class.hookGlobalSwitchDesktop();
    EntryPoint336Class.hookActivitiesSwitchDesktop();
  }

  static hookGlobalSwitchDesktop() {
    logger.log('Hooking global switch desktop gestures');

    const tracker = new SwipeTracker336(
      global.stage,
      Shell.ActionMode.NORMAL,
      { allowDrag: false, allowScroll: false },
      new ToucheggSettings(
        [GestureType.SWIPE],
        [4],
        [GestureDirection.UP, GestureDirection.DOWN],
        [DeviceType.TOUCHPAD, DeviceType.TOUCHSCREEN],
      ),
    );

    /* eslint-disable no-underscore-dangle */
    tracker.connect('begin', wm._switchWorkspaceBegin.bind(wm));
    tracker.connect('update', wm._switchWorkspaceUpdate.bind(wm));
    tracker.connect('end', wm._switchWorkspaceEnd.bind(wm));
    wm._toucheggTracker = tracker;
    /* eslint-enable no-underscore-dangle */
  }

  static hookActivitiesSwitchDesktop() {
    logger.log('Hooking activities view switch desktop gestures');

    const tracker = new SwipeTracker336(
      Main.layoutManager.overviewGroup,
      Shell.ActionMode.OVERVIEW,
      undefined,
      new ToucheggSettings(
        [GestureType.SWIPE],
        [4],
        [GestureDirection.UP, GestureDirection.DOWN],
        [DeviceType.TOUCHPAD, DeviceType.TOUCHSCREEN],
      ),
    );

    /* eslint-disable no-underscore-dangle */
    const workspacesDisplay = overview.viewSelector._workspacesDisplay;
    tracker.connect('begin', workspacesDisplay._switchWorkspaceBegin.bind(workspacesDisplay));
    tracker.connect('update', workspacesDisplay._switchWorkspaceUpdate.bind(workspacesDisplay));
    tracker.connect('end', workspacesDisplay._switchWorkspaceEnd.bind(workspacesDisplay));
    workspacesDisplay._toucheggTracker = tracker;
    /* eslint-enable no-underscore-dangle */
  }
}

var EntryPoint336 = // eslint-disable-line
  GObject.registerClass(EntryPoint336Class);
