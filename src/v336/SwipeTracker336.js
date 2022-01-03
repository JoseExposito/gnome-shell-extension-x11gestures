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
/* eslint-disable no-underscore-dangle */
const { GObject, Gdk, Gio } = imports.gi;
const { SwipeTracker } = imports.ui.swipeTracker;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { toucheggClient } = SRC.touchegg.ToucheggClient;
const { GestureDirection } = SRC.touchegg.ToucheggTypes;
const { AllowedGesture } = SRC.utils.AllowedGesture;
const { logger } = SRC.utils.Logger;

/**
 * Touchégg percentage multiplier to get a good UX on GNOME Shell.
 */
const PERCENTAGE_MULTIPLIER = 0.01;

/**
 * SwipeTracker clone that receives multi-touch events from ToucheggClient.
 * Https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/3.38.3/js/ui/swipeTracker.js.
 */
class SwipeTracker336Class extends SwipeTracker {
  /**
   * Default constructor.
   *
   * @param {object} actor @see SwipeTracker.
   * @param {number} allowedModes @see SwipeTracker.
   * @param {object} params @see SwipeTracker.
   * @param {AllowedGesture} allowedGesture @see AllowedGesture.
   */
  _init(actor, allowedModes, params, allowedGesture) {
    super._init(actor, allowedModes, params);
    logger.log('Creating a new SwipeTracker336');

    this.allowedGesture = allowedGesture;
    this.touchpadSettings = new Gio.Settings({
      schema_id: 'org.gnome.desktop.peripherals.touchpad',
    });

    this.onToucheggGestureBegin = this.onToucheggGestureBegin.bind(this);
    this.onToucheggGestureUpdate = this.onToucheggGestureUpdate.bind(this);
    this.onToucheggGestureEnd = this.onToucheggGestureEnd.bind(this);

    // Connect the Touchégg client to the swipe tracker to start receiving events
    logger.log('Connecting Touchégg client signals');
    toucheggClient.connect('begin', this.onToucheggGestureBegin);
    toucheggClient.connect('update', this.onToucheggGestureUpdate);
    toucheggClient.connect('end', this.onToucheggGestureEnd);
  }

  onToucheggGestureBegin(gesture, type, direction, percentage, fingers, device, time) {
    this.previosPercentage = 0;

    if (this.allowedGesture.isAllowed(type, fingers, direction, device)) {
      const { x, y } = SwipeTracker336Class.getMousePosition();
      this._beginGesture(gesture, time, x, y);
    }
  }

  onToucheggGestureUpdate(gesture, type, direction, percentage, fingers, device, time) {
    if (this.allowedGesture.isAllowed(type, fingers, direction, device)) {
      const percentageDelta = (direction === GestureDirection.RIGHT
        || direction === GestureDirection.DOWN)
        ? (percentage - this.previosPercentage)
        : (this.previosPercentage - percentage);
      const naturalScroll = this.touchpadSettings.get_boolean('natural-scroll') ? -1 : 1;
      const delta = percentageDelta * naturalScroll * PERCENTAGE_MULTIPLIER;
      this.previosPercentage = percentage;

      this._updateGesture(gesture, time, delta);
    }
  }

  onToucheggGestureEnd(gesture, type, direction, percentage, fingers, device, time) {
    if (this.allowedGesture.isAllowed(type, fingers, direction, device)) {
      this._endGesture(gesture, time);
    }
  }

  static getMousePosition() {
    const display = Gdk.Display.get_default();
    const seat = display.get_default_seat();
    const pointer = seat.get_pointer();
    const [, x, y] = pointer.get_position();
    return { x, y };
  }
}

var SwipeTracker336 = // eslint-disable-line
  GObject.registerClass(SwipeTracker336Class);
