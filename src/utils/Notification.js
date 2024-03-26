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
import GObject from 'gi://GObject';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

class NotificationClass extends GObject.Object {
  static send(title, text) {
    const ShellVersion = Config.PACKAGE_VERSION;

    if (ShellVersion.startsWith('40') || ShellVersion.startsWith('41')
        || ShellVersion.startsWith('42') || ShellVersion.startsWith('43')
        || ShellVersion.startsWith('44') || ShellVersion.startsWith('45')) {
      NotificationClass.send40to45(title, text);
    } else {
      NotificationClass.send46(title, text);
    }
  }

  static send40to45(title, text) {
    const source = new MessageTray.Source('X11Gestures', 'dialog-information-symbolic');
    Main.messageTray.add(source);

    const notification = new MessageTray.Notification(source, title, text);
    notification.setTransient(false);

    source.showNotification(notification);
  }

  static send46(title, body) {
    const source = new MessageTray.Source({
      title: 'X11Gestures',
      iconName: 'dialog-information-symbolic',
    });

    const notification = new MessageTray.Notification({
      source,
      title,
      body,
      isTransient: false,
    });

    Main.messageTray.add(source);
    source.addNotification(notification);
  }
}

const Notification = GObject.registerClass(NotificationClass);
export default Notification;
