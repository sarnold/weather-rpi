#!/usr/bin/python
# 1 2014-12-28 06:58:39.599004 101629 14.3 55.358172338 4.89756118958

import os, sys
from cgi import escape
import cgitb; cgitb.enable()
from random import uniform, randint
import json
import datetime

data_format_version = 1

def r(max):
  return randint(0, max)

ret = {}

ret["version"] = data_format_version
ret["timestamp"] = datetime.datetime.now().isoformat()
ret["pressure"] = randint(8000, 20000);
ret["pressure_trend"] = randint(-1, 1);
ret["temperature"] = uniform(-100, 100);
ret["temperature_trend"] = randint(-1, 1);
ret["humidity"] = uniform(0, 100);
ret["humidity_trend"] = randint(-1, 1);
ret["dewpoint"] = uniform(-100, 100);
ret["dewpoint_trend"] = randint(-1, 1);

print "Content-Type: application/json"
print
print(json.JSONEncoder().encode(ret))
