#!/usr/bin/python
print "Content-type: text/html"
print
print "<h1>Stupid Test CGI</h1>"
print "<pre>"
import os, sys
from cgi import escape
import cgitb; cgitb.enable()
print "<strong>Python %s</strong>" % sys.version
keys = os.environ.keys()
keys.sort()
for k in keys:
    print "%s\t%s" % (escape(k), escape(os.environ[k]))
print "</pre>"
