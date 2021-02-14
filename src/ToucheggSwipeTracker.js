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
const { toucheggClient } = imports['x11gestures@joseexposito.github.io'].src.ToucheggClient;

class ToucheggSwipeTrackerClass extends SwipeTracker {
  _init(actor, allowedModes, params) {
    super._init(actor, allowedModes, params);
    log('Creating a new ToucheggSwipeTracker');

    // SwipeTracker creates its own class to handle touchpad gestures
    // As we are going to replace it with our custom implementation, delete it to avoid possible
    // duplicated events
    log('Removing this._touchpadGesture');
    if (this._touchpadGesture) {
      this._touchpadGesture.destroy();
      delete this._touchpadGesture;
    }

    // Connect the Touchégg client to the swipe tracker to start receiving events
    log('Connecting Touchégg client signals');
    toucheggClient.connect('begin', this._beginGesture.bind(this));
    toucheggClient.connect('update', this._updateGesture.bind(this));
    toucheggClient.connect('end', this._endGesture.bind(this));
    this.bind_property('enabled', toucheggClient, 'enabled', 0);
    this.bind_property('orientation', toucheggClient, 'orientation', 0);
  }
}

var ToucheggSwipeTracker = // eslint-disable-line
  GObject.registerClass(ToucheggSwipeTrackerClass);
