# Debugging

GNOME Shell extensions can be installed in `~/.local/share/gnome-shell/extensions`. The easiest way
to start testing your changes is to create a symbolic link:

```bash
$ mkdir -p ~/.local/share/gnome-shell/extensions
$ ln -s `pwd` ~/.local/share/gnome-shell/extensions/x11gestures@joseexposito.github.io
```

And restart GNOME Shell by pressing `Alt+F2` to open the Run Dialog and enter `restart` or `r`.

Now, in a terminal, you'll be able to see the extension logs:

```bash
$ journalctl -f -o cat /usr/bin/gnome-shell
```

# Documentation

This guide is a good resource to get started with GNOME Shell extensions:

https://wiki.gnome.org/Projects/GnomeShell/Extensions/Writing

This extensions modifies the `SwipeTracker` class, so it is recommended to familiarize yourself with
the Shell code in the different stable versions:

https://gitlab.gnome.org/GNOME/gnome-shell/-/blob/master/js/ui/swipeTracker.js
