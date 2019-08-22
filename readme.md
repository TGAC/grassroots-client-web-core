# Grassroots Infrastructure Dynamic Web-UI

This is to work with the Grassroots Infrastructure's backend to produce a web UI, all services of the backend server are listed with each of the parameters added as a form object dynamically.


## Install

This web UI has to be installed on the same server or using a proxy to overcome the **cross domain problem** (a javascript's **Same-Origin Policy** for security).

1. Place the whole package under apache web folder.
2. In the dynamic/config/ directory, copy config.js.example to config.js and change the server_url to point to your grassroots server URL.
3. In apache.conf add the content from config/htaccess file between the \<directory\>\</directory\> tag.

## Use
Go to: http(s)://server/service/ to list all services.


