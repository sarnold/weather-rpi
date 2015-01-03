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
var defaults = [
["time_format", "local", "form-time"],
["temperature_units", "celsius", "form-temperature_units"],
["refresh_interval", "60", "form-refresh_interval"]
];

// Set to true to enable debugging output
var DEBUG = false;

// debug logging
function LOG(msg)
{
  if (DEBUG)  {
    console.log(msg);
  }
}

// Main function, runs automatically at document-ready (i.e. when the page is finished loading)
$(document).ready(function(){
  // set up default options if not present
  setup_defaults();

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
  $( "#tab-historical" ).html("<p>We get signal!</p>");
  $( "#tab-windfield" ).html("<p>Main screen turn on!</p>");
  
  // populate screen with initial data
  update_current_display();
});

// Set up UI elements (tabs, buttons, etc.)
function setup_ui_elements()
{
  LOG("setup_ui_elements()");
  // set title
  document.title = "WeatherPi @ " + window.location.hostname;
  $( "#header" ).html("<h1>WeatherPi @ " + window.location.hostname + "</h1>");

  // set up tabs
  $( "#tabs" ).tabs({
    create: function(event, ui) {
      var theTab = ui.tab.index();
      LOG("INIT tab created " + theTab);
      set_up_tab(theTab);
    },
    activate: function(event, ui) {
      var theTab = ui.newTab.index();
      LOG("INIT tab selected " + theTab);
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
  LOG("setup_button_handlers()");
    // handle time set button
    $("#button-save_settings").click(function (evt) {
      update_settings();
    });
    $("#button-update").click(function(evt) {
      force_update();
    });
  }

  function setup_defaults()
  {
    LOG("setup_defaults()");
    for (var i = 0; i < defaults.length; i++) {
      var default_pair = defaults[i];
      var setting_name = default_pair[0];
      var setting_value = default_pair[1];
      var current_value = get_saved_setting(setting_name);
      LOG("current value for " + setting_name + " is: " + current_value);
      if (typeof current_value === "undefined")  {
        LOG("setting default = " + setting_value);
        set_setting(setting_name, setting_value);
      }
    }
  }

  function update_settings_ui()
  {
    LOG("update_settings_ui()");
  // time_format
  // temperature_units
  // refresh_interval
  for (var i = 0; i < defaults.length; i++)  {
    var setting_name = defaults[i][0];
    var form = defaults[i][2];
    var setting_value = get_saved_setting(setting_name);
    LOG("name = " + setting_name + " value = " + setting_value);
    $("input[name=" + setting_name + "][value=" + setting_value + "]").attr('checked', 'checked');
  }
}

function update_settings()
{
  LOG("update_settings()");
  for (var i = 0; i < defaults.length; i++)  {
    var setting_name = defaults[i][0];
    LOG(setting_name);
    var setting_value = get_current_setting(setting_name);
    LOG(setting_value);
    LOG("setting name = " + setting_name + " value = " + setting_value);
    set_setting(setting_name, setting_value);
  }
  var update_process = window.update_current_display_process;
  LOG("update process pid = " + update_process);
  if (typeof update_process != "undefined")  {
    LOG("stopping it");
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
}

function current_tab_selected()
{
  LOG("CURRENT TAB SELECTED");
}

function previous_tab_selected()
{
  LOG("PREV TAB SELECTED");
}

function wind_tab_selected()
{
  LOG("WIND TAB SELECTED");
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
  LOG("convert " + return_value.toFixed(2) + " to " + units);
  if (units === "fahrenheit")  {
    return_value = return_value * 1.8000 + 32.00;
  } else {
    // units are in celsius so if that is the selected unit then no conversion is necessary
    LOG("no conversion necessary");
  }
  LOG("returning " + return_value.toFixed(2));
  return return_value;
}

function force_update(completion_handler)
{
  LOG("UPDATING");
  
  // disable the refresh button and replace it with a spinner
  toggleButton("#button-update");
  
  var jqxhr = $.ajax( "cgi-bin/get_current_readings.py" )
  .done(function(data) {
    LOG("SUCCESS, received data: " + JSON.stringify(data, null, 4));
    $("#field_temperature").text(convert_to_current_temperature_unit(data.temperature).toFixed(2));
    $("#field_pressure").text(data.pressure);
    $("#field_humidity").text(data.humidity.toFixed(2));
    $("#field_dewpoint").text(data.dewpoint.toFixed(2));
    
    switch(data.temperature_trend)  {
      case -1: $("#trend_temperature").html("&#8595;"); break;
      case 0: $("#trend_temperature").html("&#8213;"); break;
      case 1: $("#trend_temperature").html("&#8593;"); break;
    }

    switch(data.pressure_trend)  {
      case -1: $("#trend_pressure").html("&#8595;"); break;
      case 0: $("#trend_pressure").html("&#8213;"); break;
      case 1: $("#trend_pressure").html("&#8593;"); break;
    }

    switch(data.humidity_trend)  {
      case -1: $("#trend_humidity").html("&#8595;"); break;
      case 0: $("#trend_humidity").html("&#8213;"); break;
      case 1: $("#trend_humidity").html("&#8593;"); break;
    }

    switch(data.dewpoint_trend)  {
      case -1: $("#trend_dewpoint").html("&#8595;"); break;
      case 0: $("#trend_dewpoint").html("&#8213;"); break;
      case 1: $("#trend_dewpoint").html("&#8593;"); break;
    }
    
    var update_date = new Date(data.timestamp);
    $("#field_last_updated").html(get_date_string(update_date));
  })
.fail(function(error) {
  LOG("FAILED, error details: " + JSON.stringify(error, null, 4));
  // window.alert("Error loading data: " + error.status + " " + error.statusText);
  $("#error-text").text("Error loading data: " + error.status + " " + error.statusText);
  $("#error-dialog").dialog("open");
})
.always(function() {
  // restore the update button
  toggleButton("#button-update");
  if (typeof completion_handler === "function") {
    LOG("calling completion handler");
    completion_handler();
  }
});
}

function toggleButton ( el ) {
 
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