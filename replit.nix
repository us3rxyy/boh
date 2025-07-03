
{ pkgs }: {
  deps = [
    pkgs.nodejs-22_x
    pkgs.glib
    pkgs.glibc
    pkgs.nss
    pkgs.nspr
    pkgs.atk
    pkgs.at-spi2-atk
    pkgs.cups
    pkgs.drm
    pkgs.gtk3
    pkgs.gdk-pixbuf
    pkgs.libsoup
    pkgs.libsecret
    pkgs.libuuid
    pkgs.libappindicator-gtk3
    pkgs.pango
    pkgs.cairo
    pkgs.freetype
    pkgs.fontconfig
    pkgs.dbus
    pkgs.expat
    pkgs.libxcb
    pkgs.libXi
    pkgs.libXext
    pkgs.libX11
    pkgs.libXrandr
    pkgs.libXss
    pkgs.libXtst
    pkgs.libxshmfence
    pkgs.libXdamage
    pkgs.libXfixes
    pkgs.libXcomposite
    pkgs.alsa-lib
  ];
}
