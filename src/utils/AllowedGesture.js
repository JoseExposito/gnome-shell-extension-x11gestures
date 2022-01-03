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
const { GObject } = imports.gi;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { GestureType, GestureDirection, DeviceType } = SRC.touchegg.ToucheggTypes;

/**
 * Utility class used to pass extra settings to our custom SwipeTracker and know if a certain
 * gesture must be executed or not.
 */
class AllowedGestureClass extends GObject.Object {
  /**
   * Default constructor.
   *
   * @param {GestureType} type Array of allowed GestureType.
   * @param {number} fingers Array of allowed number of fingers.
   * @param {GestureDirection[]} directions Array of allowed GestureDirection.
   * @param {DeviceType[]} devices Array of allowed device types.
   */
  _init(type, fingers, directions, devices) {
    this.type = type;
    this.fingers = fingers;
    this.directions = directions;
    this.devices = devices;
  }

  isAllowed(type, fingers, direction, device) {
    if (this.type !== type) {
      return false;
    }

    if (this.fingers !== fingers) {
      return false;
    }

    if (!this.directions.includes(direction)) {
      return false;
    }

    // TODO Should we handle touchscreen gestures?
    if (!this.devices.includes(device)) {
      return false;
    }

    return true;
  }
}

var AllowedGesture = // eslint-disable-line
  GObject.registerClass(AllowedGestureClass);
