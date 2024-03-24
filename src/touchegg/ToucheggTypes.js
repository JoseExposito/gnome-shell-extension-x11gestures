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
export const GestureType = {
  NOT_SUPPORTED: 0,
  SWIPE: 1,
  PINCH: 2,
};

export const GestureDirection = {
  UNKNOWN: 0,

  // GestureType.SWIPE
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,

  // GestureType.PINCH
  IN: 5,
  OUT: 6,
};

export const DeviceType = {
  UNKNOWN: 0,
  TOUCHPAD: 1,
  TOUCHSCREEN: 2,
};
