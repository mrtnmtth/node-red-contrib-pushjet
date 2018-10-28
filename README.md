node-red-contrib-pushjet
========================

A <a href="http://nodered.org" target="_new">Node-RED</a> node to send notifications via <a href="https://pushjet.io/" target="_new">Pushjet</a>.

Install
-------

Run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install mrtnmtth/node-red-contrib-pushjet


Usage
-----

Uses mustache syntax like `{{{payload.message}}}` to set Pushjet message attributes.

Returns Pushjet server response or error message (usually only needed for debugging purposes).


Features
--------

- Support for custom servers.
- Indicator for status of last sent message.

On how to create Pushjet services and more information see the <a href="http://docs.pushjet.io/" target="_new">Pushjet documentation</a>.
