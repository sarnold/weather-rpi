#!/usr/bin/python

import os, sys
from cgi import escape
from random import randint
import cgitb; cgitb.enable()
import json

GRID_SIZE = 50

def r(max):
  return randint(0, max)

weather_data = []

for i in range(0, GRID_SIZE*GRID_SIZE):
  temp = []
  temp.append( r(25) )
  temp.append( r(360) )
  weather_data.append(temp)

print "Content-Type: application/json"
print
print(json.JSONEncoder().encode(weather_data))
