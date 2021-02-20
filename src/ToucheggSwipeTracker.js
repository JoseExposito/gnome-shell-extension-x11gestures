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
/* eslint-disable no-underscore-dangle */
const { GObject } = imports.gi;
const { SwipeTracker } = imports.ui.swipeTracker;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { toucheggClient } = SRC.ToucheggClient;
const { logger } = SRC.utils.Logger;

/**
 * SwipeTracker clone that receives multi-touch events from ToucheggClient.
 */
class ToucheggSwipeTrackerClass extends SwipeTracker {
  /**
   * Default constructor.
   *
   * @param {object} actor @see SwipeTracker.
   * @param {number} allowedModes @see SwipeTracker.
   * @param {object} params @see SwipeTracker.
   * @param {object} toucheggSettings Touchégg settings. Shape:
   *   {
   *     types: <Array of allowed GestureType>,
   *     fingers: <Array of allowed number of fingers>,
   *     directions: <Array of allowed GestureDirection>,
   *     devices: <Array of allowed device types>,
   *   }.
   */
  _init(actor, allowedModes, params, toucheggSettings) {
    super._init(actor, allowedModes, params);
    logger.log('Creating a new ToucheggSwipeTracker');

    this.toucheggSettings = toucheggSettings;
    this.onToucheggGestureBegin = this.onToucheggGestureBegin.bind(this);
    this.onToucheggGestureUpdate = this.onToucheggGestureUpdate.bind(this);
    this.onToucheggGestureEnd = this.onToucheggGestureEnd.bind(this);

    // SwipeTracker creates its own class to handle touchpad gestures
    // As we are going to replace it with our custom implementation, delete it to avoid possible
    // duplicated events
    logger.log('Removing this._touchpadGesture');
    if (this._touchpadGesture) {
      this._touchpadGesture.destroy();
      delete this._touchpadGesture;
    }

    // Connect the Touchégg client to the swipe tracker to start receiving events
    logger.log('Connecting Touchégg client signals');
    toucheggClient.connect('begin', this.onToucheggGestureBegin);
    toucheggClient.connect('update', this.onToucheggGestureUpdate);
    toucheggClient.connect('end', this.onToucheggGestureEnd);
    this.bind_property('enabled', toucheggClient, 'enabled', 0);
    this.bind_property('orientation', toucheggClient, 'orientation', 0);
  }

  onToucheggGestureBegin(gesture, type, fingers, direction, device, time, x, y) {
    logger.log('onToucheggGestureBegin');
    if (this.gestureMatchesSettings(type, fingers, direction, device)) {
      this._beginGesture(gesture, time, x, y);
    }
  }

  onToucheggGestureUpdate(gesture, type, fingers, direction, device, time, delta) {
    if (this.gestureMatchesSettings(type, fingers, direction, device)) {
      this._updateGesture(gesture, time, delta);
    }
  }

  onToucheggGestureEnd(gesture, type, fingers, direction, device, time) {
    if (this.gestureMatchesSettings(type, fingers, direction, device)) {
      this._endGesture(gesture, time);
    }
  }

  gestureMatchesSettings(type, fingers, direction, device) {
    if (!this.toucheggSettings.types.includes(type)) {
      return false;
    }

    if (!this.toucheggSettings.fingers.includes(fingers)) {
      return false;
    }

    if (!this.toucheggSettings.directions.includes(direction)) {
      return false;
    }

    if (!this.toucheggSettings.devices.includes(device)) {
      return false;
    }

    return true;
  }
}

var ToucheggSwipeTracker = // eslint-disable-line
  GObject.registerClass(ToucheggSwipeTrackerClass);
