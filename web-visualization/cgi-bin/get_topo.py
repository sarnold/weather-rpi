#!/usr/bin/python
import os, sys
from cgi import escape
import cgitb; cgitb.enable()
from random import randint
import json

ret = {}

with open('LOCLTOPO') as f:
  array = []
  for line in f:
    array.append([int(x) for x in line.split()])

#print "rows = %d" % len(array)
#print "columns = %d" % len(array[0])

ret["rows"] = len(array)
ret["columns"] = len(array[0])
ret["data"] = array

print "Content-Type: application/json"
print
print(json.JSONEncoder().encode(ret))
