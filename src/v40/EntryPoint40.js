/*
 * Copyright 2021 José Expósito <jose.exposito89@gmail.com>
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
const { GObject, Shell, Clutter } = imports.gi;
const { wm, overview } = imports.ui.main;
const Main = imports.ui.main;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { SwipeTracker40 } = SRC.v40.SwipeTracker40;
const { GestureType, GestureDirection, DeviceType } = SRC.touchegg.ToucheggTypes;
const { ToucheggConfig } = SRC.touchegg.ToucheggConfig;
const { AllowedGesture } = SRC.utils.AllowedGesture;
const { logger } = SRC.utils.Logger;

/**
 * Entry point for GNOME Shell 40.
 */
class EntryPoint40Class extends GObject.Object {
  static start() {
    const allowedGestures = [
      EntryPoint40Class.hookGlobalSwitchDesktop(),
      EntryPoint40Class.hookGlobalOverview(),
      EntryPoint40Class.hookActivitiesSwitchDesktop(),
    ];

    ToucheggConfig.update(allowedGestures);
  }

  static hookGlobalSwitchDesktop() {
    logger.log('Hooking global switch desktop gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      3,
      [GestureDirection.LEFT, GestureDirection.RIGHT],
      [DeviceType.TOUCHPAD, DeviceType.TOUCHSCREEN],
    );

    const tracker = new SwipeTracker40(
      global.stage,
      Clutter.Orientation.HORIZONTAL,
      Shell.ActionMode.NORMAL,
      { allowDrag: false, allowScroll: false },
      allowedGesture,
    );

    /* eslint-disable no-underscore-dangle */
    const workspaceAnimation = wm._workspaceAnimation;
    tracker.connect('begin', workspaceAnimation._switchWorkspaceBegin.bind(workspaceAnimation));
    tracker.connect('update', workspaceAnimation._switchWorkspaceUpdate.bind(workspaceAnimation));
    tracker.connect('end', workspaceAnimation._switchWorkspaceEnd.bind(workspaceAnimation));
    workspaceAnimation._toucheggTracker = tracker;
    /* eslint-enable no-underscore-dangle */

    return allowedGesture;
  }

  static hookGlobalOverview() {
    logger.log('Hooking global activities/overview gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      3,
      [GestureDirection.UP, GestureDirection.DOWN],
      [DeviceType.TOUCHPAD, DeviceType.TOUCHSCREEN],
    );

    const tracker = new SwipeTracker40(
      global.stage,
      Clutter.Orientation.VERTICAL,
      Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW, // eslint-disable-line no-bitwise
      { allowDrag: false, allowScroll: false },
      allowedGesture,
    );

    /* eslint-disable no-underscore-dangle */
    tracker.connect('begin', overview._gestureBegin.bind(overview));
    tracker.connect('update', overview._gestureUpdate.bind(overview));
    tracker.connect('end', overview._gestureEnd.bind(overview));
    overview._toucheggTracker = tracker;
    /* eslint-enable no-underscore-dangle */

    return allowedGesture;
  }

  static hookActivitiesSwitchDesktop() {
    logger.log('Hooking activities view switch desktop gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      3,
      [GestureDirection.LEFT, GestureDirection.RIGHT],
      [DeviceType.TOUCHPAD, DeviceType.TOUCHSCREEN],
    );

    const tracker = new SwipeTracker40(
      Main.layoutManager.overviewGroup,
      Clutter.Orientation.HORIZONTAL,
      Shell.ActionMode.OVERVIEW,
      { allowDrag: false, allowScroll: false },
      allowedGesture,
    );
    tracker.allowLongSwipes = true;

    /* eslint-disable no-underscore-dangle */
    const workspacesDisplay = overview._overview._controls._workspacesDisplay;
    tracker.connect('begin', workspacesDisplay._switchWorkspaceBegin.bind(workspacesDisplay));
    tracker.connect('update', workspacesDisplay._switchWorkspaceUpdate.bind(workspacesDisplay));
    tracker.connect('end', workspacesDisplay._switchWorkspaceEnd.bind(workspacesDisplay));
    workspacesDisplay._toucheggTracker = tracker;
    /* eslint-enable no-underscore-dangle */

    return allowedGesture;
  }
}

var EntryPoint40 = // eslint-disable-line
  GObject.registerClass(EntryPoint40Class);
