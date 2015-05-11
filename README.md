weather-rpi
===========

Raspberry Pi weather software (work-in-progress).

Uses one SensorStick and optically-encoded anemometer output (untested).  The cup-and-vane anemometer must be printed from the STL files on Thingiverse.  Also provides simple monitoring code for the AS3935 Franklin Lightning Sensor IC and associated components on the MOD-1016 v6 breakout board.

http://embeddedday.com/projects/sensor-stick/

http://www.thingiverse.com/thing:42858

http://www.thingiverse.com/thing:41367

http://www.embeddedadventures.com/as3935_lightning_sensor_module_mod-1016.html

See the README in the data-acquisition/python directory for more info on the sensor code.

Quick Start
-----------

Assumes default Raspbian image and user "pi" (tested with lighttpd).  Adjust to taste.

Clone this repository under ~/src (use --recursive to pull in the sensor code).

```
 $ mkdir -p ~/src && cd ~/src
 $ git clone --recursive https://github.com/VCTLabs/weather-rpi.git
```

Enable mod_user_dir in your web server (apache, lighttpd, etc) and restart it.

Copy the contents of web-visualization to ~/public_html.

```
 $ mkdir -p ~/public_html
 $ cp -aRv ~/src/weather-rpi/web-visualization/* ~/public_html/
```

Change to ~/src/weather-rpi/data-acquisition/python directory and run the monitor script.

```
 $ cd ~/src/weather-rpi/data-acquisition/python
 $ sudo python -u SensorStick-monitor.py > output.log
```

Point your web browser at your RPi's hostname or IP address:

```
 $ epiphany http://localhost/~pi/weather.html  - or -
 $ firefox http://weatherpi-1.domain.org/~pi/weather.html
```

Edit SensorStick-monitor.py to enable verbose console outout.
