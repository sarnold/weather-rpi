// WeatherPi main script of doom
// Donald Burr, VCT Labs

/*
 * cookie stuff: http://plugins.jquery.com/cookie/
 *
 * Set a cookie
 *
 * Simple cookie with no options
 * $.cookie("example", "foo");
 *
 * Cookie that expires after 7 days
 * $.cookie("example", "foo", { expires: 7 });
 *
 * Cookie that expires after 7 days and is only valid for site paths under /admin
 * $.cookie("example", "foo", { path: '/admin', expires: 7 }); // Sample 3
 *
 * Get a cookie
 *
 * alert( $.cookie("example") );
 *
 * Get all cookies
 *
 * $.cookie();
 *
 * Delete the cookie.
 * Returns true if delete was successful, otherwise false
 * NOTE: for deletion to work you must use same attributes (path, expires, etc.) as when the cookie was created
 *
 * $.removeCookie("example");
 */

// Message pane: http://stackoverflow.com/questions/5267569/display-messages-with-jquery-ui

// up arrow = &#8593; &#x2191;
// down arrow = &#8595; &#x2193;
// bar = &#8213; &#x2015;

// Default configuration options
var defaults = [["time_format", "local", "form-time"], ["temperature_units", "celsius", "form-temperature_units"], ["refresh_interval", "60", "form-refresh_interval"]];

// keep track of stuff
var current_temperature = 0;
var last_temperature;
var highest_temperature;
var lowest_temperature;
var highest_temperature_timestamp;
var lowest_temperature_timestamp;

// keep track of stuff
var current_pressure = 0;
var last_pressure;
var highest_pressure;
var lowest_pressure;
var highest_pressure_timestamp;
var lowest_pressure_timestamp;

// keep track of stuff
var current_humidity = 0;
var last_humidity;
var highest_humidity;
var lowest_humidity;
var highest_humidity_timestamp;
var lowest_humidity_timestamp;

// keep track of stuff
var current_dewpoint = 0;
var last_dewpoint;
var highest_dewpoint;
var lowest_dewpoint;
var highest_dewpoint_timestamp;
var lowest_dewpoint_timestamp;

// Set to 0 to disable debugging, 1+ to enable debugging (higher = more verbose)
var DEBUG_LEVEL = 1;

// debug logging
function LOG(level, msg)
{
  if (DEBUG_LEVEL > 0 && DEBUG_LEVEL >= level)  {
    console.log(msg);
  }
}

// Main function, runs automatically at document-ready (i.e. when the page is finished loading)
$(document).ready(function(){
  // set up default options if not present
  setup_defaults();

  // load historical data (if available)
  load_historical_data();

  // set up clock to update every second
  setInterval('update_clock()', 1000);

  // set up UI (buttons, etc.)
  setup_ui_elements();
  set_unit_labels();

  // set up button handlers
  setup_button_handlers();

  // update settings ui
  update_settings_ui();

  // set some default content
  $( "#tab-historical" ).html("<p>Placeholder - not yet implemented</p>");
  $( "#tab-windfield" ).html("<p>Placeholder - not yet implemented</p>");

  // populate screen with initial data
  update_current_display();
});

// Set up UI elements (tabs, buttons, etc.)
function setup_ui_elements()
{
  LOG(1, "setup_ui_elements()");
  // set title
  document.title = "WeatherPi @ " + window.location.hostname;
  $( "#header" ).html("<h1>WeatherPi @ " + window.location.hostname + "</h1>");

  // set up tabs
  $( "#tabs" ).tabs({
    create: function(event, ui) {
      var theTab = ui.tab.index();
      LOG(1, "INIT tab created " + theTab);
      set_up_tab(theTab);
    },
    activate: function(event, ui) {
      var theTab = ui.newTab.index();
      LOG(1, "INIT tab selected " + theTab);
      set_up_tab(theTab);
    }
  });

  // set up dialogs
  $('#error-dialog').dialog({
    autoOpen: false,
    height: 140,
    modal: true,
    open: function(event, ui){
      setTimeout("$('#error-dialog').dialog('close')",3000);
    }
  });
  // set up settings accordion
  $('#settings_accordion').accordion({heightStyle: 'panel'});

  // set up buttons
  $( "#button-update" ).button();
  $( "#button-save_settings" ).button();
}

function set_up_tab(tab)
{
  switch(tab) {
    case 0: current_tab_selected(); break;
    case 1: previous_tab_selected(); break;
    case 2: wind_tab_selected(); break;
  }
}

function setup_button_handlers()
{
  // handle time set button
  $("#button-save_settings").click(function (evt) {
    update_settings();
  });
  $("#button-update").click(function(evt) {
    force_update();
  });
}

function load_historical_data()
{
  last_temperature = $.cookie("last_temperature");
  highest_temperature = $.cookie("highest_temperature");
  lowest_temperature = $.cookie("lowest_temperature");
  highest_temperature_timestamp = $.cookie("highest_temperature_timestamp");
  LOG(1, "date cookie load " + highest_temperature_timestamp + " type " + typeof highest_temperature_timestamp);
  lowest_temperature_timestamp = $.cookie("lowest_temperature_timestamp");
  if (typeof last_temperature === "undefined")  {
    last_temperature = 0;
  } else {
    last_temperature = parseFloat(last_temperature);
  }
  if (typeof highest_temperature === "undefined")  {
    LOG(1, "no highest temp, initializing to Number.MIN_VALUE");
    //highest_temperature = Number.MIN_SAFE_INTEGER;
    highest_temperature = Number.MIN_VALUE;
  } else {
    LOG(1, "parsing highest temp of " + highest_temperature);
    highest_temperature = parseFloat(highest_temperature);
    LOG(1, "after parse = " + highest_temperature);
  }
  if (typeof lowest_temperature === "undefined")  {
    LOG(1, "no lowest temp, initializing to Number.MAX_VALUE");
    //lowest_temperature = Number.MAX_SAFE_INTEGER;
    lowest_temperature = Number.MAX_VALUE;
  } else {
    LOG(1, "parsing lowest temp of " + lowest_temperature);
    lowest_temperature = parseFloat(lowest_temperature);
    LOG(1, "after parse = " + lowest_temperature);
  }
  if (typeof highest_temperature_timestamp === "undefined")  {
    LOG(1, "DATE UNDEFINED");
    highest_temperature_timestamp = new Date();
  } else {
    LOG(1, "NEED TO PARSE " + highest_temperature_timestamp);
    highest_temperature_timestamp = new Date(highest_temperature_timestamp);
    LOG(1, "AFTER PARSE " + highest_temperature_timestamp);
  }
  if (typeof lowest_temperature_timestamp === "undefined")  {
    lowest_temperature_timestamp = new Date();
  } else {
    lowest_temperature_timestamp =  new Date(lowest_temperature_timestamp);
  }

  last_pressure = $.cookie("last_pressure");
  highest_pressure = $.cookie("highest_pressure");
  lowest_pressure = $.cookie("lowest_pressure");
  highest_pressure_timestamp = $.cookie("highest_pressure_timestamp");
  lowest_pressure_timestamp = $.cookie("lowest_pressure_timestamp");
  if (typeof last_pressure === "undefined")  {
    last_pressure = 0;
  } else {
    last_pressure = parseInt(last_pressure);
  }
  if (typeof highest_pressure === "undefined")  {
    LOG(1, "no highest pressure, initializing to Number.MIN_VALUE");
    //highest_pressure = Number.MIN_SAFE_INTEGER;
    highest_pressure = Number.MIN_VALUE;
  } else {
    LOG(1, "parsing highest pressure of " + highest_pressure);
    highest_pressure = parseInt(highest_pressure);
    LOG(1, "after parse = " + highest_pressure);
  }
  if (typeof lowest_pressure === "undefined")  {
    LOG(1, "no lowest pressure, initializing to Number.MAX_VALUE");
    //lowest_pressure = Number.MAX_SAFE_INTEGER;
    lowest_pressure = Number.MAX_VALUE;
  } else {
    LOG(1, "parsing lowest pressure of " + lowest_pressure);
    lowest_pressure = parseInt(lowest_pressure);
    LOG(1, "after parse = " + lowest_pressure);
  }
  if (typeof highest_pressure_timestamp === "undefined")  {
    highest_pressure_timestamp = new Date();
  } else {
    highest_pressure_timestamp = new Date(highest_pressure_timestamp);
  }
  if (typeof lowest_pressure_timestamp === "undefined")  {
    lowest_pressure_timestamp = new Date();
  } else {
    lowest_pressure_timestamp = new Date(lowest_pressure_timestamp);
  }

  last_humidity = $.cookie("last_humidity");
  highest_humidity = $.cookie("highest_humidity");
  lowest_humidity = $.cookie("lowest_humidity");
  highest_humidity_timestamp = $.cookie("highest_humidity_timestamp");
  lowest_humidity_timestamp = $.cookie("lowest_humidity_timestamp");
  if (typeof last_humidity === "undefined")  {
    last_humidity = 0;
  } else {
    last_humidity = parseFloat(last_humidity);
  }
  if (typeof highest_humidity === "undefined")  {
    LOG(1, "no highest humidity, initializing to Number.MIN_VALUE");
    //highest_humidity = Number.MIN_SAFE_INTEGER;
    highest_humidity = Number.MIN_VALUE;
  } else {
    LOG(1, "parsing highest humidity of " + highest_humidity);
    highest_humidity = parseFloat(highest_humidity);
    LOG(1, "after parse = " + highest_humidity);
  }
  if (typeof lowest_humidity === "undefined")  {
    LOG(1, "no lowest humidity, initializing to Number.MAX_VALUE");
    //lowest_humidity = Number.MAX_SAFE_INTEGER;
    lowest_humidity = Number.MAX_VALUE;
  } else {
    LOG(1, "parsing lowest humidity of " + lowest_humidity);
    lowest_humidity = parseFloat(lowest_humidity);
    LOG(1, "after parse = " + lowest_humidity);
  }
  if (typeof highest_humidity_timestamp === "undefined")  {
    highest_humidity_timestamp = new Date();
  } else {
    highest_humidity_timestamp = new Date(highest_humidity_timestamp);
  }
  if (typeof lowest_humidity_timestamp === "undefined")  {
    lowest_humidity_timestamp = new Date();
  } else {
    lowest_humidity_timestamp = new Date(lowest_humidity_timestamp);
  }

  last_dewpoint = $.cookie("last_dewpoint");
  highest_dewpoint = $.cookie("highest_dewpoint");
  lowest_dewpoint = $.cookie("lowest_dewpoint");
  highest_dewpoint_timestamp = $.cookie("highest_dewpoint_timestamp");
  lowest_dewpoint_timestamp = $.cookie("lowest_dewpoint_timestamp");
  if (typeof last_dewpoint === "undefined")  {
    last_dewpoint = 0;
  } else {
    last_dewpoint = parseFloat(last_dewpoint);
  }
  if (typeof highest_dewpoint === "undefined")  {
    LOG(1, "no highest dewpoint, initializing to Number.MIN_VALUE");
    //highest_dewpoint = Number.MIN_SAFE_INTEGER;
    highest_dewpoint = Number.MIN_VALUE;
  } else {
    LOG(1, "parsing highest dewpoint of " + highest_dewpoint);
    highest_dewpoint = parseFloat(highest_dewpoint);
    LOG(1, "after parse = " + highest_dewpoint);
  }
  if (typeof lowest_dewpoint === "undefined")  {
    LOG(1, "no lowest dewpoint, initializing to Number.MAX_VALUE");
    //lowest_dewpoint = Number.MAX_SAFE_INTEGER;
    lowest_dewpoint = Number.MAX_VALUE;
  } else {
    LOG(1, "parsing lowest dewpoint of " + lowest_dewpoint);
    lowest_dewpoint = parseFloat(lowest_dewpoint);
    LOG(1, "after parse = " + lowest_dewpoint);
  }
  if (typeof highest_dewpoint_timestamp === "undefined")  {
    highest_dewpoint_timestamp = new Date();
  } else {
    highest_dewpoint_timestamp = new Date(highest_dewpoint_timestamp);
  }
  if (typeof lowest_dewpoint_timestamp === "undefined")  {
    lowest_dewpoint_timestamp = new Date();
  } else {
    lowest_dewpoint_timestamp = new Date(lowest_dewpoint_timestamp);
  }

  LOG(1, "t highesst " + highest_temperature + " type " + typeof highest_temperature);
  LOG(1, "p highesst " + highest_pressure + " type " + typeof highest_pressure);
  LOG(1, "date " + highest_temperature_timestamp + " type " + typeof highest_temperature_timestamp);
}

function setup_defaults()
{
  LOG(1, "setup_defaults()");
  for (var i = 0; i < defaults.length; i++) {
    var default_pair = defaults[i];
    var setting_name = default_pair[0];
    var setting_value = default_pair[1];
    var current_value = get_saved_setting(setting_name);
    LOG(1, "current value for " + setting_name + " is: " + current_value);
    if (typeof current_value === "undefined")  {
      LOG(1, "setting default = " + setting_value);
      set_setting(setting_name, setting_value);
    }
  }
}

function update_settings_ui()
{
  LOG(1, "update_settings_ui()");
  // time_format
  // temperature_units
  // refresh_interval
  for (var i = 0; i < defaults.length; i++)  {
    var setting_name = defaults[i][0];
    var form = defaults[i][2];
    var setting_value = get_saved_setting(setting_name);
    LOG(1, "name = " + setting_name + " value = " + setting_value);
    $("input[name=" + setting_name + "][value=" + setting_value + "]").attr('checked', 'checked');
  }
}

function update_settings()
{
  LOG(1, "update_settings()");
  for (var i = 0; i < defaults.length; i++)  {
    var setting_name = defaults[i][0];
    LOG(1, setting_name);
    var setting_value = get_current_setting(setting_name);
    LOG(1, setting_value);
    LOG(1, "setting name = " + setting_name + " value = " + setting_value);
    set_setting(setting_name, setting_value);
  }
  var update_process = window.update_current_display_process;
  LOG(1, "update process pid = " + update_process);
  if (typeof update_process != "undefined")  {
    LOG(1, "stopping it");
    clearTimeout(update_process);
  }
  var update_interval = get_saved_setting("refresh_interval");
  if (update_interval > 0)  {
    window.update_current_display_process = setTimeout(update_current_display, update_interval * 1000);
  }

  $('#save_success').show().delay(1000).fadeOut('slow');
  set_unit_labels();
}

function get_current_setting(setting)
{
  return $('input:radio[name=' + setting + ']:checked').val();
}

function get_saved_setting(setting)
{
  return $.cookie(setting);
}

function set_setting(name, value)
{
  $.cookie(name, value);
}

function get_date_string(d)
{
  LOG(2, "get_date_string called with type=" + typeof d + ": " + d);
  var time_format = $.cookie("time_format");

  if (time_format === "utc")  {
    s = d.toUTCString();
  } else if (time_format === "local")  {
    var weekdays = new Array(7);
    weekdays[0] = "Sunday";
    weekdays[1] = "Monday";
    weekdays[2] = "Tuesday";
    weekdays[3] = "Wednesday";
    weekdays[4] = "Thursday";
    weekdays[5] = "Friday";
    weekdays[6] = "Saturday";
    w = d.getDay();
    s = weekdays[w] + ", " + d.toLocaleString();
  }

  return s;
}

function update_clock()
{
  d = new Date();  
  $("#clock").text(get_date_string(d));
}

function set_unit_labels()
{
  var units = get_saved_setting("temperature_units");
  if (units === "fahrenheit")  {
    unit_label = "F";
  } else if (units === "celsius")  {
    unit_label = "C";
  } else {
    unit_label = "?";
  }
  $("#field_temperature_unit").text(unit_label);
  $("#field_dewpoint_unit").text(unit_label);
  $("#field_temperature_high_unit").text(unit_label);
  $("#field_temperature_low_unit").text(unit_label);
  $("#field_dewpoint_high_unit").text(unit_label);
  $("#field_dewpoint_low_unit").text(unit_label);
}

function current_tab_selected()
{
  LOG(1, "CURRENT TAB SELECTED");
}

function previous_tab_selected()
{
  LOG(1, "PREV TAB SELECTED");
}

function wind_tab_selected()
{
  LOG(1, "WIND TAB SELECTED");
}

function update_current_display()
{
  force_update(function() {
    // Schedule the next request when the current one's complete
    var update_interval = get_saved_setting("refresh_interval");
    if (update_interval > 0)  {
      window.update_current_display_process = setTimeout(update_current_display, update_interval * 1000);
    }
  });
}

function convert_to_current_temperature_unit(deg_celsius)
{
  var return_value = deg_celsius;
  var units = get_saved_setting("temperature_units");
  LOG(1, "convert " + return_value + " to " + units);
  if (units === "fahrenheit")  {
    return_value = return_value * 1.8000 + 32.00;
  } else {
    // units are in celsius so if that is the selected unit then no conversion is necessary
    LOG(1, "no conversion necessary");
  }
  LOG(1, "returning " + return_value);
  return return_value;
}

function force_update(completion_handler)
{
  LOG(1, "UPDATING (new-style)");

  // disable the refresh button and replace it with a spinner
  toggleButton("#button-update");

  var jqxhr = $.getJSON( "wxdata.json", function(data) {
    LOG(1,  "success" );
    LOG(1, "SUCCESS, received data: " + JSON.stringify(data, null, 4));
    process_observations(data);
  })
  .fail(function(error) {
    LOG(1, "FAILED, error details: " + JSON.stringify(error, null, 4));
    // window.alert("Error loading data: " + error.status + " " + error.statusText);
    $("#error-text").text("Error loading data: " + error.status + " " + error.statusText);
    $("#error-dialog").dialog("open");
  })
  .always(function() {
    // restore the update button
    toggleButton("#button-update");
    if (typeof completion_handler === "function") {
      LOG(1, "calling completion handler");
      completion_handler();
    }
  });
}

function process_observations(data)
{
  LOG(1, data);

  // first decode all the things!!
  var version = data["ver-tag"];
  var temperature;
  var pressure;
  var humidity;
  var dewpoint;
  var datetime;
  var update_date;

  if (version == 1) {
    LOG(1, "version 1 data detected");
    datetime = data["time-tag"];
    temperature = parseFloat(data["bmp-temp"]);
    pressure = parseInt(data["bmp-pres"]);
    humidity = parseFloat(data["sht-hum"]);
    dewpoint = parseFloat(data["sht-dew"]);
  }
  // hack to turn this into an ISO 8601 format date string
  update_date = datetime.substring(0, datetime.indexOf('.')).replace(" ", "T") + "Z";
  LOG(1, "UPDATE DATE = " + update_date);
  //test_ts = Date.parseExact(update_date, "yyyy-MM-dd HH:mm:ss");
  //test_ts = new Date(update_date);
  update_date = moment(update_date).toDate();
  LOG(1, "(processed update_date) " + update_date);

  // now compute trends
  temperature_trend = (temperature > last_temperature ? 1 : (temperature < last_temperature ? -1 : 0));
  pressure_trend = (pressure > last_pressure ? 1 : (pressure < last_pressure ? -1 : 0));
  humidity_trend = (humidity > last_humidity ? 1 : (humidity < last_humidity ? -1 : 0));
  dewpoint_trend = (dewpoint > last_dewpoint ? 1 : (dewpoint < last_dewpoint ? -1 : 0));

  // now store the last-values
  last_temperature = temperature;
  last_pressure = pressure;
  last_dewpoint = dewpoint;
  last_humidity = humidity;

  $.cookie("last_temperature", last_temperature);
  $.cookie("last_pressure", last_pressure);
  $.cookie("last_humidity", last_humidity);
  $.cookie("last_dewpoint", last_dewpoint);

  // now handle min/max
  if (temperature < lowest_temperature)  {
    lowest_temperature = temperature;
    lowest_temperature_timestamp = update_date;
  }
  if (temperature > highest_temperature)  {
    highest_temperature = temperature;
    highest_temperature_timestamp = update_date;
  }

  if (pressure < lowest_pressure)  {
    lowest_pressure = pressure;
    lowest_pressure_timestamp = update_date;
  }
  if (pressure > highest_pressure)  {
    highest_pressure = pressure;
    highest_pressure_timestamp = update_date;
  }

  if (humidity < lowest_humidity)  {
    lowest_humidity = humidity;
    lowest_humidity_timestamp = update_date;
  }
  if (humidity > highest_humidity)  {
    highest_humidity = humidity;
    highest_humidity_timestamp = update_date;
  }

  if (dewpoint < lowest_dewpoint)  {
    lowest_dewpoint = dewpoint;
    lowest_dewpoint_timestamp = update_date;
  }
  if (dewpoint > highest_dewpoint)  {
    highest_dewpoint = dewpoint;
    highest_dewpoint_timestamp = update_date;
  }

  LOG(1, "update_date " + update_date + " " + typeof update_date);
  LOG(1, "temp hi " + highest_temperature_timestamp + " " + typeof highest_temperature_timestamp);

  // now save them out
  $.cookie("lowest_temperature", lowest_temperature);
  $.cookie("highest_temperature", highest_temperature);
  $.cookie("lowest_temperature_timestamp", lowest_temperature_timestamp);
  $.cookie("highest_temperature_timestamp", highest_temperature_timestamp);

  $.cookie("lowest_pressure", lowest_pressure);
  $.cookie("highest_pressure", highest_pressure);
  $.cookie("lowest_pressure_timestamp", lowest_pressure_timestamp);
  $.cookie("highest_pressure_timestamp", highest_pressure_timestamp);

  $.cookie("lowest_humidity", lowest_humidity);
  $.cookie("highest_humidity", highest_humidity);
  $.cookie("lowest_humidity_timestamp", lowest_humidity_timestamp);
  $.cookie("highest_humidity_timestamp", highest_humidity_timestamp);

  $.cookie("lowest_dewpoint", lowest_dewpoint);
  $.cookie("highest_dewpoint", highest_dewpoint);
  $.cookie("lowest_dewpoint_timestamp", lowest_dewpoint_timestamp);
  $.cookie("highest_dewpoint_timestamp", highest_dewpoint_timestamp);

  // lastly update the display
  $("#field_temperature").text(convert_to_current_temperature_unit(temperature).toFixed(2));
  $("#field_pressure").text(pressure);
  $("#field_humidity").text(humidity.toFixed(2));
  $("#field_dewpoint").text(dewpoint.toFixed(2));

  switch(temperature_trend)  {
    case -1: $("#trend_temperature").html("&#8595;"); break;
    case 0: $("#trend_temperature").html("&#8213;"); break;
    case 1: $("#trend_temperature").html("&#8593;"); break;
  }

  switch(pressure_trend)  {
    case -1: $("#trend_pressure").html("&#8595;"); break;
    case 0: $("#trend_pressure").html("&#8213;"); break;
    case 1: $("#trend_pressure").html("&#8593;"); break;
  }

  switch(humidity_trend)  {
    case -1: $("#trend_humidity").html("&#8595;"); break;
    case 0: $("#trend_humidity").html("&#8213;"); break;
    case 1: $("#trend_humidity").html("&#8593;"); break;
  }

  switch(dewpoint_trend)  {
    case -1: $("#trend_dewpoint").html("&#8595;"); break;
    case 0: $("#trend_dewpoint").html("&#8213;"); break;
    case 1: $("#trend_dewpoint").html("&#8593;"); break;
  }

  LOG(1, "temps: low = " + lowest_temperature + ", high = " + highest_temperature);

  $("#field_temperature_high").text(convert_to_current_temperature_unit(highest_temperature).toFixed(2));
  $("#field_pressure_high").text(highest_pressure);
  LOG(1, typeof highest_humidity);
  $("#field_humidity_high").text(highest_humidity.toFixed(2));
  $("#field_dewpoint_high").text(highest_dewpoint.toFixed(2));

  $("#field_temperature_low").text(convert_to_current_temperature_unit(lowest_temperature).toFixed(2));
  $("#field_pressure_low").text(lowest_pressure);
  $("#field_humidity_low").text(lowest_humidity.toFixed(2));
  $("#field_dewpoint_low").text(lowest_dewpoint.toFixed(2));

  // display update date
  // example: 2014-12-31 01:52:32.414871
  // docs: https://code.google.com/p/datejs/wiki/FormatSpecifiers
  // Date.parseExact doesn't like the millisecond part of python date, so just strip
  // it out.  Oh well, so much for millisecond-level accuracy. :-P
  LOG(1, "datetime before munge [" + datetime + "]");
  datetime = datetime.substring(0, datetime.indexOf('.'));
  //var update_date = Date.parseExact(datetime, "yyyy-MM-dd HH:mm:ss");
  //var update_date = new Date();
  LOG(1, "datetime type = " + typeof datetime);
  LOG(1, "datetime = [" + datetime + "]");
  LOG(1, "typeof update_date = " + typeof update_date);
  LOG(1, "update_date = " + update_date.toLocaleDateString());
  $("#field_last_updated").html(get_date_string(update_date));
  LOG(1, "highest temp timestamp " + highest_temperature_timestamp + " type " + typeof highest_temperature_timestamp);
  $("#field_temperature_high_timestamp").html(get_date_string(highest_temperature_timestamp));
  $("#field_pressure_high_timestamp").html(get_date_string(highest_pressure_timestamp));
  $("#field_humidity_high_timestamp").html(get_date_string(highest_humidity_timestamp));
  $("#field_dewpoint_high_timestamp").html(get_date_string(highest_dewpoint_timestamp));
  $("#field_temperature_low_timestamp").html(get_date_string(lowest_temperature_timestamp));
  $("#field_pressure_low_timestamp").html(get_date_string(lowest_pressure_timestamp));
  $("#field_humidity_low_timestamp").html(get_date_string(lowest_humidity_timestamp));
  $("#field_dewpoint_low_timestamp").html(get_date_string(lowest_dewpoint_timestamp));
}

function force_update_old(completion_handler)
{
  LOG(1, "UPDATING zzz");

  // disable the refresh button and replace it with a spinner
  toggleButton("#button-update");

  var jqxhr = $.ajax("wxdata.json" /*"cgi-bin/get_current_readings.py"*/ )
    .done(function(data) {
      LOG(1, "SUCCESS, received data: " + JSON.stringify(data, null, 4));
      process_observations(data);
    })
  .fail(function(error) {
    LOG(1, "FAILED, error details: " + JSON.stringify(error, null, 4));
    // window.alert("Error loading data: " + error.status + " " + error.statusText);
    $("#error-text").text("Error loading data: " + error.status + " " + error.statusText);
    $("#error-dialog").dialog("open");
  })
  .always(function() {
  });
}

function toggleButton ( el )
{
  if ( $(el).button( 'option', 'disabled' ) ) {
    $(el).button( 'enable' );
    $(el).button( 'option', 'label', 'Update' );
    $(el).button( 'option', 'icons', { primary: null } );
  } else {
    $(el).button( 'disable' );
    $(el).button( 'option', 'label', 'Updating..' );
    $(el).button( 'option', 'icons', { primary: 'ui-icon-waiting' } );
  }
}
