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
  var mustache = require("mustache");

  function replaceMustache(str, data) {
    var isMustacheMsg = (str||"").indexOf("{{") != -1;
    if (isMustacheMsg) {
      str = mustache.render(str,data);
    }
    return str;
  }

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
    var server  = service.server;
    var secret  = service.secret;
    var message = n.message;
    var title   = n.title;
    var level   = n.level;
    var link    = n.link;

    // remove protocol from server url, fail if not https
    if (server.indexOf("://") !== -1) {
      if (server.match(/^https/)) {
        server = server.slice(server.indexOf("://")+3);
      }
      else {
        node.error("Unsupported protocol " +
          server.slice(0,server.indexOf(":")));
        node.status({fill:"grey",shape:"dot",text:"disabled"});
        return;
      }
    }

    this.on("input",function(msg) {
      // replace mustache templates in message, title, link
      message = replaceMustache(message, msg);
      title = replaceMustache(title, msg);
      link = replaceMustache(link, msg);
      var formData = {
        'secret' : secret,
        'message': message,
        'title'  : title,
        'level'  : level,
        'link'   : link
      };
      request.post('https://' + server + '/message').form(formData)
        .on('response', function(res) {
          var status = res.statusCode;
          if (status == 200) {
            node.status({fill:"green",shape:"dot",text:"Status: OK"});
          }
          else {
            node.status({fill:"yellow",shape:"dot",text:"Status: "+status});
          }
          msg.statusCode = res.statusCode;
          msg.headers = res.headers;
          node.send(msg);
        })
        .on('error', function(err) {
          node.status({fill:"red",shape:"ring",text:"Connection failed"});
          node.error("Connection failed [" + err + "]");
        });
    });
  }

  RED.nodes.registerType("pushjet",PushjetMessageNode);
};
