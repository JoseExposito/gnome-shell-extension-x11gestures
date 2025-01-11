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
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import { GestureDirection } from '../touchegg/ToucheggTypes.js';

/**
 * Utility class used to obtain the invert modifier for swipe actions.
 */
class InvertGestureClass extends GObject.Object {
  /**
   * Default constructor.
   * @param {invertVertical} bool Invert vertical swipes.
   * @param {invertHorizontal} bool Invert horizontal swipes.
   * @param invertVertical
   * @param invertHorizontal
   */
  _init(invertVertical, invertHorizontal) {
    this.invertVertical = invertVertical;
    this.invertHorizontal = invertHorizontal;

    this.touchpadSettings = new Gio.Settings({
      schema_id: 'org.gnome.desktop.peripherals.touchpad',
    });
  }

  /**
   * Get the modifier for gestures.
   * @param {GestureDirection} direction
   * @returns {-1|1}
   */
  getModifier(direction) {
    if (direction === GestureDirection.UP || direction === GestureDirection.DOWN) {
      return (
        this.touchpadSettings.get_boolean('natural-scroll') ? -1 : 1
      ) * (
        this.invertVertical ? -1 : 1
      );
    } if (direction === GestureDirection.LEFT || direction === GestureDirection.RIGHT) {
      return this.invertHorizontal ? -1 : 1;
    }

    return 1;
  }
}

const InvertGesture = GObject.registerClass(InvertGestureClass);
export default InvertGesture;
