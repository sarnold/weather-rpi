web-visualization
=================

What the heck is this?
----------------------

Here are some simple scripts demonstrating visualizing weather data
on a web page.  Currently, since no sensors and interface software exist
yet, these scripts use randomly generated test data.  Since it's random,
it won't make a whole lot of sense from a weather standpoint, but it'll
have to do for now.

`dumb_test_server.js` is a very simple web server written in Node.js.
(Just install node.js, it doesn't need any plugins or anything)  Run it
with `node dumb_test_server.js` and it will listen on `localhost:8080`
for HTTP requests.  It will serve up any `.html,` `.css` and `.js`
files stored locally, and if it detects a "special" url, it will serve
up internally-generated dummy data in JSON format.  Currently the only
"special" url is `wind_data.json` which will cause the script to return
a wind data grid in the following JSON format:

```
[
  [
    wind_speed,
    wind_direction
  ], 
  [
    wind_speed,
    wind_direction
  ],
  ...
]
```

(basically an array of arrays, each sub-array has 2 elements, the first
being wind speed (0-25) and the second being wind direction (0-360,
degrees)

What's with the Vagrant stuff?
------------------------------

You could just as easily run this on your local machine,
but if you want to be fancy about it, you can use the included
`Vagrantfile` and `bootstrap.sh` to run this in a Vagrant environment.
It creates a basic Ubuntu 12.04 32-bit environment and installs all
the goodies you'll need (mostly `node` and `screen`) and forwards
`localhost:8080` to `virtual_machine:8080.`  (I'm not really sure why
I did it this way, guess I was just having fun experimenting with Vagrant...)
