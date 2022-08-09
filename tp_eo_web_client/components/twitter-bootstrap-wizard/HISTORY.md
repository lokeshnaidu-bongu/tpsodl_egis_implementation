1.1.1 /2015-1-16
================
Defect fixes

1.1.0 / 2014-6-20
==================
In integrating Bootstrap 3, we see that the namespacing has changed for "show" events to "show.bs.tab". As this is a really small change to
getting this working - I chose to make the change here rather than consume the latest. It was already forked here, most likely to offer AMD support.
This event was changed manually in both the minified version and the unminified version (we use the unminified version)
To be clear - this is forked 1.1.0, not the actual 1.1.0 you'll find on the original authors repo