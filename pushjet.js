/**
 * Copyright 2018 mttronc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
  var request = require("request");
  var liburl = require("url");
  var mustache = require("mustache");

  function PushjetServiceNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;
    this.server = n.server;
    this.secret = n.secret;
  }

  RED.nodes.registerType("pushjet-service",PushjetServiceNode);

  function PushjetMessageNode(n) {
    RED.nodes.createNode(this,n);
    var node = this;

    var service = RED.nodes.getNode(n.service);
    var server = service.server;
    var secret = service.secret;
    var message = n.message;
    var title = n.title;
    var level = n.level;
    var link = n.link;
    node.log(JSON.stringify(n));

    // TODO: error if protocol in server url
    /*if (server.indexOf("://") !== -1) {
    }*/

    this.on("input",function(msg) {
      // replace mustache in message
      var isMustacheMsg = (message||"").indexOf("{{") != -1;
      if (isMustacheMsg) {
          message = mustache.render(message,msg);
      }
      var formData = {
        'secret' : secret,
        'message': message,
        'title': title,
        'level': level,
        'link': link
      };
      node.log(JSON.stringify(formData));
      // TODO: error handling
      request.post('https://' + server + '/message').form(formData)
        .on('response', function(res) {
          node.log('statusCode: ' + res.statusCode);
          node.log('headers: ' + JSON.stringify(res.headers));
        });
      node.send(msg);
    });

  RED.nodes.registerType("pushjet-message",PushjetMessageNode);
}
