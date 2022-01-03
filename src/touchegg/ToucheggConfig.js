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
const { GObject, Gio, GLib } = imports.gi;
const ByteArray = imports.byteArray;

const SRC = imports.misc.extensionUtils.getCurrentExtension().imports.src;
const { GestureType, GestureDirection } = SRC.touchegg.ToucheggTypes;
const { AllowedGesture } = SRC.utils.AllowedGesture;
const { logger } = SRC.utils.Logger;

class ToucheggConfigClass extends GObject.Object {
  /**
   * @returns {boolean} If Touchégg is installed or not.
   */
  static isToucheggInstalled() {
    return this.fileExists(this.getSystemConfigFilePath());
  }

  /**
   * Update Touchégg config to disable the gestures used by this extension.
   * GJS doesn't have a proper XML parser, so this is a hack.
   *
   * @param {AllowedGesture[]} allowedGestures Array of gestures used by the extension.
   */
  static async update(allowedGestures) {
    try {
      const configFilePath = this.fileExists(this.getUserConfigFilePath())
        ? this.getUserConfigFilePath()
        : this.getSystemConfigFilePath();
      const xml = await this.readFile(configFilePath);

      // Find the closing tag of <application name="All">
      const appOpenTagIndex = xml.indexOf('<application name="All">');
      const appCloseTagIndex = xml.indexOf('</application>', appOpenTagIndex);

      // Write the config for each allowed gesture
      let changes = '';
      allowedGestures.forEach((allowedGesture) => {
        allowedGesture.directions.forEach((direction) => {
          const typeStr = Object.entries(GestureType)
            .find(([, val]) => val === allowedGesture.type)[0];
          const directionStr = Object.entries(GestureDirection)
            .find(([, val]) => val === direction)[0];

          // TODO Use a regex, Touché changes the format and this tags keep being added

          const gestureTag = `<gesture type="${typeStr}" fingers="${allowedGesture.fingers}" direction="${directionStr}"><action type="GNOME_SHELL"></action></gesture>\n`;
          const gestureTagIndex = xml.indexOf(gestureTag);

          if (gestureTagIndex === -1
            || gestureTagIndex < appOpenTagIndex || gestureTagIndex > appCloseTagIndex) {
            changes += gestureTag;
          }
        });
      });

      // Write the changes
      if (changes !== '') {
        logger.log('Updating Touchégg configuration');
        const newXml = `${xml.substring(0, appCloseTagIndex)}\n${changes}${xml.substring(appCloseTagIndex)}`;
        this.createDir(this.getUserConfigDirPath());
        await this.writeFile(this.getUserConfigFilePath(), newXml);
      }
    } catch (error) {
      logger.error('Error updating Touchégg config', error);
    }
  }

  /**
   * @param {string} path File path.
   * @returns {Promise<string>} The file contents.
   */
  static readFile(path) {
    return new Promise((resolve, reject) => {
      const file = Gio.File.new_for_path(path);
      file.load_contents_async(null, (self, res) => {
        const [success, contents] = file.load_contents_finish(res);

        if (!success) {
          GLib.free(contents);
          reject(new Error('Error loading config file'));
        } else {
          const str = ByteArray.toString(contents, 'UTF-8');
          GLib.free(contents);
          resolve(str);
        }
      });
    });
  }

  /**
   * Create a directory if doesn't exists yet.
   *
   * @param {string} path Directory path.
   */
  static createDir(path) {
    const file = Gio.File.new_for_path(path);
    if (!file.query_exists(null)) {
      file.make_directory(null);
    }
  }

  /**
   * @param {string} path File path.
   * @param {string} contents File contents to store.
   */
  static writeFile(path, contents) {
    return new Promise((resolve, reject) => {
      const file = Gio.File.new_for_path(path);
      // replace_contents_async doesn't work:
      // https://gitlab.gnome.org/GNOME/gjs/-/issues/192
      file.replace_contents_bytes_async(ByteArray.toGBytes(ByteArray.fromString(contents, 'UTF-8')),
        null, true, Gio.FileCreateFlags.NONE, null,
        (self, res) => {
          const [success, etag] = file.replace_contents_finish(res);
          GLib.free(etag);

          if (!success) {
            reject(new Error('Error saving config file'));
          } else {
            resolve();
          }
        });
    });
  }

  /**
   * @returns {string} User's home directory path (~/.config/touchegg).
   */
  static getUserConfigDirPath() {
    // If $XDG_CONFIG_HOME is set, use it. Otherwise fallback to $HOME/.config:
    // https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
    const xdgConfigHomeEnvVar = GLib.getenv('XDG_CONFIG_HOME');
    const configPath = xdgConfigHomeEnvVar
        || GLib.build_filenamev([GLib.get_home_dir(), '.config']);
    return GLib.build_filenamev([configPath, 'touchegg']);
  }

  /**
   * @returns {string} User's config file path (~/.config/touchegg/touchegg.conf).
   */
  static getUserConfigFilePath() {
    return GLib.build_filenamev([ToucheggConfigClass.getUserConfigDirPath(), 'touchegg.conf']);
  }

  /**
   * @returns {string} System config file path (/usr/share/touchegg/touchegg.conf).
   */
  static getSystemConfigFilePath() {
    // If $XDG_CONFIG_DIRS is set, check if the config is present in one of those
    // directories. Otherwise, fallback to /etc/xdg, as in the spec:
    // https://specifications.freedesktop.org/basedir-spec/basedir-spec-latest.html
    // Finally, fallback to /usr/share/touchegg for backwards compatibility.
    let configFilePath = GLib.build_filenamev([GLib.DIR_SEPARATOR_S, 'usr', 'share', 'touchegg', 'touchegg.conf']);

    const xdgConfigDirsEnvVar = GLib.getenv('XDG_CONFIG_DIRS');
    const xdgPaths = xdgConfigDirsEnvVar ? xdgConfigDirsEnvVar.split(':') : [];
    xdgPaths.push('/etc/xdg');

    xdgPaths.forEach((path) => {
      const confPath = GLib.build_filenamev([path, 'touchegg', 'touchegg.conf']);
      if (this.fileExists(confPath)) {
        configFilePath = confPath;
      }
    });

    return configFilePath;
  }

  /**
   * @param {string} path File path.
   * @returns {boolean} If the file exists.
   */
  static fileExists(path) {
    const file = Gio.File.new_for_path(path);
    return file.query_exists(null);
  }
}

var ToucheggConfig = // eslint-disable-line
  GObject.registerClass(ToucheggConfigClass);
