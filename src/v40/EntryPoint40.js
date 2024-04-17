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
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import SwipeTracker40 from './SwipeTracker40.js';
import { GestureType, GestureDirection, DeviceType } from '../touchegg/ToucheggTypes.js';
import ToucheggConfig from '../touchegg/ToucheggConfig.js';
import AllowedGesture from '../utils/AllowedGesture.js';
import logger from '../utils/Logger.js';

const { wm, overview } = Main;

/**
 * Entry point for GNOME Shell 40.
 */
class EntryPoint40Class extends GObject.Object {
  static start(settings) {
    const fingers = settings.get_int('swipe-fingers');
    const cfg = { fingers };

    const allowedGestures = [
      EntryPoint40Class.hookGlobalSwitchDesktop(cfg),
      EntryPoint40Class.hookGlobalOverview(cfg),
      EntryPoint40Class.hookActivitiesSwitchDesktop(cfg),
    ];

    ToucheggConfig.update(allowedGestures);
  }

  static hookGlobalSwitchDesktop({ fingers }) {
    logger.log('Hooking global switch desktop gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      fingers,
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
    EntryPoint40Class.hook(
      workspaceAnimation,
      workspaceAnimation._switchWorkspaceBegin,
      workspaceAnimation._switchWorkspaceUpdate,
      workspaceAnimation._switchWorkspaceEnd,
      tracker,
    );
    /* eslint-enable no-underscore-dangle */

    return allowedGesture;
  }

  static hookGlobalOverview({ fingers }) {
    logger.log('Hooking global activities/overview gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      fingers,
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
    EntryPoint40Class.hook(
      overview,
      overview._gestureBegin,
      overview._gestureUpdate,
      overview._gestureEnd,
      tracker,
    );
    /* eslint-enable no-underscore-dangle */

    return allowedGesture;
  }

  static hookActivitiesSwitchDesktop({ fingers }) {
    logger.log('Hooking activities view switch desktop gestures');

    const allowedGesture = new AllowedGesture(
      GestureType.SWIPE,
      fingers,
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
    EntryPoint40Class.hook(
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
    const workspaceAnimation = wm._workspaceAnimation;
    EntryPoint40Class.unhook(workspaceAnimation);

    EntryPoint40Class.unhook(overview);

    const workspacesDisplay = overview._overview._controls._workspacesDisplay;
    EntryPoint40Class.unhook(workspacesDisplay);
    /* eslint-enable no-underscore-dangle */
  }

  static unhook(obj) {
    /* eslint-disable no-underscore-dangle, no-param-reassign */
    if (!obj._toucheggTracker)
      return;
    obj._toucheggTracker.disconnect(obj._toucheggBegin);
    obj._toucheggTracker.disconnect(obj._toucheggUpdate);
    obj._toucheggTracker.disconnect(obj._toucheggEnd);
    obj._toucheggTracker = null;
    /* eslint-enable no-underscore-dangle, no-param-reassign */
  }
}

const EntryPoint40 = GObject.registerClass(EntryPoint40Class);
export default EntryPoint40;
