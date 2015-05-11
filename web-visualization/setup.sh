#!/bin/bash
#
# Raspberry Pi Setup Script
# Donald Burr <dburr@vctlabs.com>

# set to YES for debugging
DEBUG="NO"
# use older motion-mmal with its own built-in raspi camera driver
USE_MMAL_MOTION="NO"
# use newer (third party) version of node.js
USE_THIRD_PARTY_NODE_JS="YES"
# install newer (third party) ffmpeg in /usr?
INSTALL_FFMPEG_IN_USR="NO"
# disable the red LED that turns on when the camera module is active?
DISABLE_CAMERA_LED="YES"
# also install PHP when installing lighttpd?
INSTALL_PHP="NO"

# store location that this script is in
D="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# convenience function, install a package but only if it isn't already present
function install_package
{
  local PACKAGE=$1
  if dpkg -s $PACKAGE >/dev/null 2>&1; then
    echo "skipping install of $PACKAGE, it is already present"
  else
    echo "installing $PACKAGE"
    sudo aptitude -q=2 -y install $PACKAGE
  fi
}

# ffmpeg setup code is broken out into its own function because it
# is used in 2 spots in this script
function install_ffmpeg
{
  if [ "$DEBUG" = "YES" ]; then
    echo "skipping install of ffmpeg, we are in DEBUG Mode"
    echo "NOTE: this may break other apps that depend on it."
  elif hash ffserver 2>/dev/null; then
    echo "skipping install of ffmpeg, it is already present"
  else
    echo "*** building current ffmpeg from source ***"
    mkdir $HOME/src
    cd $HOME/src
    git clone git://source.ffmpeg.org/ffmpeg.git
    cd ffmpeg
    if [ "$INSTALL_FFMPEG_IN_USR" = "YES" ]; then
      ./configure --prefix=/usr
    else
      ./configure
    fi
    make
    sudo make install
    echo "*** setting up symlinks ***"
    if [ "$INSTALL_FFMPEG_IN_USR" != "YES" ]; then
      for COMMAND in ffmpeg ffprobe ffserver; do
        sudo rm -f /usr/bin/$COMMAND && sudo ln -sf ../local/bin/$COMMAND /usr/bin/$COMMAND
      done
    fi
  fi
}

# set up lighttpd+php
# http://www.instructables.com/id/Setup-a-Raspberry-Pi-PHP-web-server/?ALLSTEPS
echo -n "Ready to Install Pi webserver environment (lighttpd+php)? [yn] "
read INSTALL_LIGHTTPD
if [ "$INSTALL_LIGHTTPD" = "y" ]; then
  echo "*** installing lighttpd and php packages ***"
  install_package lighttpd
  if [ "$INSTALL_PHP" = "YES" ]; then
    echo "*** installing php ***"
    for PKG in php5-common php5-cgi php5; do
      install_package $PKG
    done
  fi
  echo "*** enabling lighttpd modules ***"
  MODULES="cgi fastcgi userdir"
  if [ "$INSTALL_PHP" = "YES" ]; then
    MODULES="$MODULES fastcgi-php"
  fi
  for MODULE in $MODULES; do
    echo "...$MODULE"
    sudo lighty-enable-mod $MODULE
  done
  echo "*** enabling cgi-bin directories ***"
  sudo sed -i.bak -e 's/^\($HTTP\["url"\] =~ "\)[^"]*\(".*$\)/\1\/cgi-bin\/\2/' /etc/lighttpd/conf-available/10-cgi.conf
  echo "*** enabling directory listings for directories that lack index.html ***"
  sudo sed -i.bak -e '$adir-listing.activate = "enable"' /etc/lighttpd/lighttpd.conf
  echo "*** setting permissions for /var/www directory ***"
  sudo chown www-data:www-data /var/www
  sudo chmod 775 /var/www
  sudo usermod -a -G www-data pi
  echo "*** installing default www files ***"
  sudo cp -a $D/configs/lighttpd/* /var/www
  sudo chmod -R g+w /var/www
  if [ -f $HOME/public_html/index.html.home ]; then
    cp $HOME/public_html/index.html.home $HOME/public_html/index.html
  fi
  echo "*** restarting lighttpd ***"
  sudo service lighttpd force-reload
  echo "*** installing content ***"
fi

echo ""
echo "*** all done ***"
echo ""
echo "here is this machine's network info:"
echo ""

if ip a | grep -Eq ': eth0:.*state UP'; then
  eth_ip=$(ip addr | awk '/inet/ && /eth0/{sub(/\/.*$/,"",$2); print $2}')
  eth_mac=`ifconfig eth0 | grep -o -E '([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}'`
  echo "ethernet: IP=$eth_ip  MAC=$eth_mac"
fi
if ip a | grep -Eq ': wlan0:.*state UP'; then
  wifi_ip=$(ip addr | awk '/inet/ && /wlan0/{sub(/\/.*$/,"",$2); print $2}')
  wifi_mac=`ifconfig wlan0 | grep -o -E '([[:xdigit:]]{1,2}:){5}[[:xdigit:]]{1,2}'`
  echo "    wifi: IP=$wifi_ip  MAC=$wifi_mac"
fi
echo ""

exit 0
