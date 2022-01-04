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
/* eslint-disable jsdoc/require-jsdoc */
const { Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

// eslint-disable-next-line no-unused-vars
function init() {}

// eslint-disable-next-line no-unused-vars
function buildPrefsWidget() {
  this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.x11gestures');

  // Create a parent widget that we'll return from this function
  const prefsWidget = new Gtk.Grid({
    margin_top: 10,
    margin_bottom: 10,
    margin_start: 10,
    margin_end: 10,
    column_spacing: 12,
    row_spacing: 12,
    visible: true,
  });

  // Add a simple title and add it to the prefsWidget
  const title = new Gtk.Label({
    label: `<b>${Me.metadata.name} Preferences</b>`,
    halign: Gtk.Align.START,
    use_markup: true,
    visible: true,
  });
  prefsWidget.attach(title, 0, 0, 2, 1);

  // Create a label & switch for `show-indicator`
  const swipeFingerLabel = new Gtk.Label({
    label: 'Number of fingers for Swipe action binding (Extension restart needed):',
    halign: Gtk.Align.START,
    visible: true,
  });
  prefsWidget.attach(swipeFingerLabel, 0, 1, 1, 1);

  this.swipeFinger = new Gtk.SpinButton({
    halign: Gtk.Align.END,
    visible: true,
    adjustment: new Gtk.Adjustment({
      lower: 3,
      upper: 4,
      step_increment: 1,
    }),
  });
  prefsWidget.attach(this.swipeFinger, 1, 1, 1, 1);

  // Bind the switch to the `swipe-fingers` key
  this.settings.bind(
    'swipe-fingers',
    this.swipeFinger,
    'value',
    Gio.SettingsBindFlags.DEFAULT,
  );

  // Return our widget which will be added to the window
  return prefsWidget;
}
