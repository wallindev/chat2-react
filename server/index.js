'use strict';
// Includes
const conf = require('./include/config');
const func = require('./include/functions');

// Dependency modules
const io = require('socket.io');
// import io from 'socket.io';
const MongoClient = require('mongodb').MongoClient;
// import { MongoClient } from 'mongodb';
const util = require('util');
// import util from 'util';

const cors = require('cors');
const colors = require('colors');
const _ = require('lodash');
const express = require('express');
const app = express();

const w = m => process.stdout.write(m);
const l = m => console.log(m);

// Inital HTML
const HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<!-- CSS -->
<link rel="stylesheet" type="text/css" media="screen" href="https://stackpath.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
<link rel="stylesheet" type="text/css" media="screen" href="/css/styles.css">
<link rel="icon" type="image/x-icon" href="/img/favicon-prompt.gif">

<title>${conf.appTitle}</title>

<!-- JS -->
<script src="https://code.jquery.com/jquery-2.1.1.min.js" defer></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js" defer></script>
<script src="/socket.io/socket.io.js" defer></script>
<!--<script src="/js/bundle.[hash].js" defer></script>-->
<script src="/js/script.js" defer></script>
<script>window.__INITIAL_DATA__ = undefined</script>
</head>
<body>

<!-- New React -->
<div id="chatApp"></div>

<!-- Old Angular -->
<!--<div id="mainContainer" class="container" ng-controller="ChatCtrl">
  <div class="row">
    <div id="chat-wrap" class="col-sm-9">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h1 class="panel-title">Chat2</h1>
        </div>
        <div class="panel-body">
          <div id="instructions" class="small">
            <p>1. First choose a name. It may contain letters, numbers, the characters '_' and '-', must be at least three characters long and also not be the same as an already active user.</p>
            <p>2. When you've chosen a valid name, write your message in the textbox below.</p>
          </div>
          <div id="chat">
            <input type="text" id="chat-name" placeholder="Write your name"> <span id="chat-name-msg"></span>
            <div id="chat-messages" tabindex="-1">
              <div class="chat-message" ng-repeat="message in messages">
                <span id="message_date_{{ $index }}" ng-bind="message.created | date:'short'" class="small"></span> <br>
                <span id="message_name_{{ $index }}" ng-bind="message.name"></span>: <span id="message_message_{{ $index }}" ng-bind-html="message.message | html"></span>
              </div>
            </div>
            <textarea id="chat-textarea" placeholder="Write your message"></textarea>
            <div id="chat-status">
              Status: <span id="chat-status-text" class="text-warning"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div id="user-wrap" class="col-sm-3">
      <div class="panel panel-default">
        <div class="panel-heading">Active users</div>
        <div class="panel-body">
          <div id="chat-users">
            <div ng-show="!users.length">
              No users
            </div>
            <div class="chat-user text-primary strong" ng-repeat="user in users">
              <strong>{{ user.name }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>-->

</body>
</html>
`
/*
  * App configuration
  *
  */
// Cross-origin resource sharing
app.use(cors());

// Static content
app.use(express.static(conf.publicDir));

// Routes
app.use('/', (req, res) => {
  res.send(HTML)
});

// Spin upp server and sockets
const server = app.listen(conf.httpPort, conf.ipAddress);
const sockets = io.listen(server).sockets;
 
// app.listen(PORT, HOST, () => {
//   console.log(`\nWeb server up and running @ ${HOST}, listening on port ${PORT}` .rainbow);
// });
