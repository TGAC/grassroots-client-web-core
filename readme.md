# Grassroots Infrastructure Dynamic Web-UI

This is to work with Grassroots Infrastructure's backend to produce a web UI, all


## Install

This web UI has to be installed on the same server or using a proxy to overcome the **cross domain problem** (a javascript's **Same-Origin Policy** for security).

1. Place the whole package under apache web folder.
2. Change the URL to your URL in the index.html

## One service only

You can change the web UI to serve one service only by calling populateService('serviceName') in the $(document).ready().