/*
 * Copyright 2021 - 2023 José Expósito <jose.exposito89@gmail.com>
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
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

class Preferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    // eslint-disable-next-line no-underscore-dangle, no-param-reassign
    window._settings = this.getSettings('org.gnome.shell.extensions.x11gestures');

    const page = new Adw.PreferencesPage();

    const group = new Adw.PreferencesGroup({
      title: 'X11 Gestures Preferences',
      description: 'Restart extension to apply changes',
    });

    // Create a parent widget that we'll return from this function
    const prefsWidget = new Gtk.Grid({
      column_spacing: 12,
      row_spacing: 12,
      visible: true,
    });

    // Create a label & switch for `show-indicator`
    const swipeFingerLabel = new Gtk.Label({
      label: 'Number of fingers for Swipe action',
      halign: Gtk.Align.START,
      visible: true,
    });
    prefsWidget.attach(swipeFingerLabel, 0, 0, 1, 1);

    this.swipeFinger = new Gtk.SpinButton({
      halign: Gtk.Align.END,
      visible: true,
      adjustment: new Gtk.Adjustment({
        lower: 3,
        upper: 4,
        step_increment: 1,
      }),
    });
    prefsWidget.attach(this.swipeFinger, 1, 0, 1, 1);

    // Bind the switch to the `swipe-fingers` key
    // eslint-disable-next-line no-underscore-dangle
    window._settings.bind(
      'swipe-fingers',
      this.swipeFinger,
      'value',
      Gio.SettingsBindFlags.DEFAULT,
    );

    group.add(prefsWidget);
    page.add(group);
    window.add(page);
  }
}

export default Preferences;
