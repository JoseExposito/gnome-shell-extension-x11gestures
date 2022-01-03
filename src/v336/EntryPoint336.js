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
const { GObject, Shell } = imports.gi;
const { wm, overview } = imports.ui.main;
const Main = imports.ui.main;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { SwipeTracker336 } = SRC.v336.SwipeTracker336;
const { GestureType, GestureDirection, DeviceType } = SRC.touchegg.ToucheggTypes;
const { ToucheggConfig } = SRC.touchegg.ToucheggConfig;
const { AllowedGesture } = SRC.utils.AllowedGesture;
const { logger } = SRC.utils.Logger;

/**
 * Entry point for GNOME Shell 3.36 and 3.38.
 */
class EntryPoint336Class extends GObject.Object {
  static start() {
    const allowedGestures = [
      EntryPoint336Class.hookGlobalSwitchDesktop(),
      EntryPoint336Class.hookActivitiesSwitchDesktop(),
    ];

    ToucheggConfig.update(allowedGestures);
  }

  static hookGlobalSwitchDesktop() {
    logger.log('Hooking global switch desktop gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      4,
      [GestureDirection.UP, GestureDirection.DOWN],
      [DeviceType.TOUCHPAD, DeviceType.TOUCHSCREEN],
    );

    const tracker = new SwipeTracker336(
      global.stage,
      Shell.ActionMode.NORMAL,
      { allowDrag: false, allowScroll: false },
      allowedGesture,
    );

    /* eslint-disable no-underscore-dangle */
    EntryPoint336Class.hook(
      wm,
      wm._switchWorkspaceBegin,
      wm._switchWorkspaceUpdate,
      wm._switchWorkspaceEnd,
      tracker,
    );
    /* eslint-enable no-underscore-dangle */

    return allowedGesture;
  }

  static hookActivitiesSwitchDesktop() {
    logger.log('Hooking activities view switch desktop gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      4,
      [GestureDirection.UP, GestureDirection.DOWN],
      [DeviceType.TOUCHPAD, DeviceType.TOUCHSCREEN],
    );

    const tracker = new SwipeTracker336(
      Main.layoutManager.overviewGroup,
      Shell.ActionMode.OVERVIEW,
      undefined,
      allowedGesture,
    );

    /* eslint-disable no-underscore-dangle */
    const workspacesDisplay = overview.viewSelector._workspacesDisplay;
    EntryPoint336Class.hook(
      workspacesDisplay,
      workspacesDisplay._switchWorkspaceBegin,
      workspacesDisplay._switchWorkspaceUpdate,
      workspacesDisplay._switchWorkspaceEnd,
      tracker,
    );
    /* eslint-enable no-underscore-dangle */

    return allowedGesture;
  }

  static hook(obj, begin, update, end, tracker) {
    /* eslint-disable no-underscore-dangle, no-param-reassign */
    obj._toucheggBegin = tracker.connect('begin', begin.bind(obj));
    obj._toucheggUpdate = tracker.connect('update', update.bind(obj));
    obj._toucheggEnd = tracker.connect('end', end.bind(obj));
    obj._toucheggTracker = tracker;
    /* eslint-enable no-underscore-dangle, no-param-reassign */
  }

  static stop() {
    /* eslint-disable no-underscore-dangle */
    EntryPoint336Class.unhook(wm);

    const workspacesDisplay = overview.viewSelector._workspacesDisplay;
    EntryPoint336Class.unhook(workspacesDisplay);
    /* eslint-enable no-underscore-dangle */
  }

  static unhook(obj) {
    /* eslint-disable no-underscore-dangle, no-param-reassign */
    obj._toucheggTracker.disconnect(obj._toucheggBegin);
    obj._toucheggTracker.disconnect(obj._toucheggUpdate);
    obj._toucheggTracker.disconnect(obj._toucheggEnd);
    obj._toucheggTracker = null;
    /* eslint-enable no-underscore-dangle, no-param-reassign */
  }
}

var EntryPoint336 = // eslint-disable-line
  GObject.registerClass(EntryPoint336Class);
