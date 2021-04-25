'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {
    this.settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.x11gestures');

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
        margin_top: 10,
        margin_bottom: 10,
        margin_start: 10,
        margin_end: 10,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });

    // Add a simple title and add it to the prefsWidget
    let title = new Gtk.Label({
        label: `<b>${Me.metadata.name} Preferences</b>`,
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(title, 0, 0, 2, 1);

    // Create a label & switch for `show-indicator`
    let swipeFingerLabel = new Gtk.Label({
        label: 'Number of fingers for Swipe action binding (Extension restart needed):',
        halign: Gtk.Align.START,
        visible: true
    });
    prefsWidget.attach(swipeFingerLabel, 0, 1, 1, 1);

    this.swipeFinger = new Gtk.SpinButton({
        halign: Gtk.Align.END,
        visible: true,
        adjustment: new Gtk.Adjustment({
            lower: 3,
            upper: 4,
            step_increment: 1
        })
    });
    prefsWidget.attach(swipeFinger, 1, 1, 1, 1);

    // Bind the switch to the `swipe-fingers` key
    this.settings.bind(
        'swipe-fingers',
        swipeFinger,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Return our widget which will be added to the window
    return prefsWidget;
}

