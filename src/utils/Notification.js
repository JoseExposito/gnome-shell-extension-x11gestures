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
import Gdk from 'gi://Gdk';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

class NotificationClass extends GObject.Object {
  static send(title, text, url) {
    const source = new MessageTray.Source('X11Gestures', 'dialog-information-symbolic');
    Main.messageTray.add(source);

    const notification = new MessageTray.Notification(source, title, text);
    notification.setTransient(false);
    notification.addAction('Download', () => {
      Gtk.show_uri_on_window(null, url, Gdk.CURRENT_TIME);
    });

    source.showNotification(notification);
  }
}

const Notification = GObject.registerClass(NotificationClass);
export default Notification;
