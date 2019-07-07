// Includes
import conf, { printModes } from './include/config';
import func from './include/functions';

// Dependency modules
import io from 'socket.io';
import { MongoClient } from 'mongodb';
import util from 'util';

import webpack from 'webpack';
import webpackConfig from '../../webpack.config.babel';

import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

let compiler;
let compilerClient;
// let compilerServer;
// Only in dev mode
if (conf.DEVMODE) {
  compiler = webpack(webpackConfig);
  compilerClient = compiler.compilers.find(compiler => compiler.name === `client-${conf.NODE_ENV}`);
  // compilerServer = compiler.compilers.find(compiler => compiler.name === `server-${conf.NODE_ENV}`);
}

import cors from 'cors';
import open from 'open';
import shelljs from 'shelljs';
import express from 'express';
const app = express();

const bundleFileName = func.getBundleFileName(webpackConfig[0]);

// Inital HTML
const HTML = `<!DOCTYPE html>
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
<script src="/js/${bundleFileName}" async defer></script>
</head>
<body>

<!-- New React -->
<div id="chatApp"></div>

</body>
</html>`;

/*
  * App configuration
  *
  */
// Cross-origin resource sharing
app.use(cors());

// Static content
app.use(express.static(conf.publicDir));

// Webpack devServer & hotReloading
if (conf.DEVMODE) {
  app.use(
    devMiddleware(
      compilerClient,
      webpackConfig[0].devServer
    )
  );
  app.use(
    hotMiddleware(
      compilerClient,
      {
        path: "/__webpack_hmr"
      }
    )
  );
}

// Routes
app.get("/", (req, res) => {
  res.send(HTML);
});

// Spin upp web and socket server
const server = app.listen(conf.APP_PORT);
func.log(printModes.ALL, `ExpressJS: Web server started @ ${conf.APP_HOST} on port ${conf.APP_PORT}`);
const socketServer = io.listen(server).sockets;

// Database collection object
let coll = {}

// Messages and users arrays
let newMessages = [];
let users = [];

/*
  * Core database functionality
  *
  */
let connString;
// Local or Remote (MongoDB Atlas cluster)
if (conf.IS_LOCAL)
  connString = `${conf.DB_PROTOCOL}://${conf.DB_HOST}/${conf.DB_NAME}`;
else
  connString = `${conf.DB_PROTOCOL}://${conf.DB_USER}:${conf.DB_PASS}@${conf.DB_HOST}/${conf.DB_NAME}`;

func.log(printModes.DEV, "connString:", connString);

// Log time
if (conf.DEVMODE) console.time('start');

// Connect to and open db
MongoClient.connect(connString, { useNewUrlParser: true })
  .then(client => {
    func.log(printModes.ALL, "MongoDB: Connection to '" + conf.DB_NAME + "' on '" + conf.DB_HOST + "' opened.\n");

    // Db
    const db = client.db(conf.DBNAME);

    // Database collection
    coll = db.collection('messages');

    // Retrieve 100 last messages, omit _id field
    coll.find({}, {_id: 0}).sort({created: -1}).limit(100).toArray()
      .then(messages => {
        func.log(printModes.DEV, "Messages retrieved (on start):", util.inspect(messages, false, 3));
        // For local dev purpose, so that browser is only opened
        // on first start, not on every restart
        if (conf.IS_LOCAL && !shelljs.test('-e', 'APP_OPENED_IN_BROWSER')) {
          // Open browser (OS/Platform independent)
          open(`${conf.APP_HOST}:${conf.APP_PORT}`);
          // Set opened "flag"
          if (conf.DEVMODE) shelljs.touch('APP_OPENED_IN_BROWSER');
        }
      })
      .catch(err => func.handleError(err));

    // Run the "save loop" every minute:
    setInterval(() => {
      if (newMessages.length) {
        if (conf.DEVMODE) console.time('save loop');

        // Insert the new documents
        coll.insertMany(newMessages)
          .then(messagesInserted => {
            func.log(printModes.PROD, 'Messages saved to database');
            func.log(printModes.DEV, "Messages inserted:", util.inspect(messagesInserted, false, 3));

            // Empty newMessages array
            newMessages = [];

            if (conf.DEVMODE) console.timeEnd('save loop');
          })
          .catch(err => func.handleError(err));
      }
    }, 60000);

    // Fires when there's a http connection to the server
    socketServer.on('connection', socket => {
      func.log(printModes.ALL, 'Client connected to chat');

      // Since db connections are done synchronously, there may be a connection to the web server before
      // the db object is propagated (i.e. when the server is restarted)
      // We then tell the user to please reload the browser
      if (!db.serverConfig.isConnected()) {
        socket.emit('status', {
          message: 'Database temporarily unavailable, please reload your browser',
          type: 'primary'
        });
        return 1;
      }

      // Welcome user
      socket.emit('status', {
        message: 'Welcome to the chat! =)',
        type: 'primary'
      });

      // Start time logging
      if (conf.DEVMODE) console.time('client connection');

      // Retrieve 100 last messages, omit _id field
      coll.find({}).sort({created: -1}).limit(100).toArray()
        .then(messages => {
          func.log(printModes.ALL, 'Messages retrieved from database');
          func.log(printModes.DEV, "Messages retrieved (on client connection):", util.inspect(messages, false, 3));

          // If there are new messages that are not yet saved to db, we have to include them here
          func.log(printModes.DEV, "new messages:", util.inspect(newMessages, false, 3));
          func.log(printModes.DEV, "old messages:", util.inspect(messages, false, 3));
          let allMessages = [];
          if (newMessages.length) {
            allMessages = newMessages.concat(messages);
          } else {
            allMessages = messages;
          }
          func.log(printModes.DEV, "all messages:", util.inspect(messages, false, 3));

          // Send messages array to client
          socket.emit('listMessages', allMessages);

          // Get rid of temp allMessages array
          allMessages = undefined;

          // Send users array to client
          socket.emit('listUsers', users);

          // End time logging
          if (conf.DEVMODE) console.timeEnd('client connection');
        })
        .catch(err => func.handleError(err));

      // Check if nickname is taken
      socket.on('checkName', name => {
        // If user array is empty, cleared is true
        // If not, iterate through and search for duplicates
        // If no duplicates found, cleared is true
        // Unshift puts user as first object in array instead of last
        let cleared = true;
        if (users.length === 0) {
          cleared = true;
        } else {
          for (let i = 0; i < users.length; i++) {
            if (users[i].name === name) {
              cleared = false;
              break;
            }
          }
        }

        socket.emit('checkName', cleared);
      });

      // Listen for insert emission from client
      socket.on('insert', message => {
        // Checking for empty values
        const regex1 = /^\s*$/;
        // Letters a-ö, A-Ö, numbers 0-9, special characters _ and -, and atleast 3 of them
        const regex2 = /^([a-öA-Ö0-9_\.-]{3,})(\s?)([a-öA-Ö0-9_\.-]*)(\s?)([a-öA-Ö0-9_\.-]*)$/;

        let msg = '';
        if (regex1.test(message.name) || regex1.test(message.message))// {
          msg = 'Name or message can\'t be empty.';
        else if (!regex2.test(message.name))
          msg = 'Name must be at least three characters long and contain valid characters.';

        if (msg !== '') {
          console.error(msg);
          socket.emit('status', {
            message: msg,
            type: 'danger',
            clear: false
          });
          return 1;
        }

        let msg2 = '';
        // Check so no other user chose same name and sent message first
        users && users.forEach(user => {
          if (user.name === message.name)
            msg2 = 'Already an active user with this name';
        });

        if (msg2 !== '') {
          console.error(msg2);
          socket.emit('status', {
            message: msg2,
            type: 'danger',
            clear: false
          });
          return 1;
        }

        // If no duplicate users found, add user to users array
        // and message to message array

        // Add socket id and date timestamp on server instead of client
        message.socket = socket.id;
        message.created = (new Date()).getTime();

        // Insert to messages array and send to client (unshift injects first)
        newMessages.unshift(message);
        func.log(printModes.DEV, "Inserted message:", util.inspect(message, false, 3));

        // Send message to all clients
        socketServer.emit('listMessages', [message]);

        socket.emit('status', {
          message: 'Message sent',
          type: 'success'
        });

        // Add new user object first in user array
        users.unshift({
          socket: message.socket,
          name: message.name,
          created: message.created // Timestamp
        });

        // Add user on all clients user lists
        socketServer.emit('listUsers', [users[0]]);

        // Send status message to everyone else
        socket.broadcast.emit('status', {
          message: '<em>' + users[0].name + '</em> has joined the chat',
          type: 'primary'
        });
      });

      socket.on('removeUser', name => {
        for (let i = 0; i < users.length; i++) {
          if (users[i].name === name) {
            users.splice(i, 1);
            // Remove user from clients user lists
            socketServer.emit('removeUser', name);
            break;
          }
        }
      });

      // Listen for client disconnect
      socket.on('disconnect', () => {
        users && users.forEach((user, i) => {
          if (user.socket === socket.id) {
            // Remove user from user array
            users.splice(i, 1);

            // Remove user from clients user lists
            socketServer.emit('removeUser', user.name);

            // Send status message to everyone else
            socket.broadcast.emit('status', {
              message: '<em>' + user.name + '</em> has left the chat',
              type: 'info',
            });

            return;
          }
        });
      });
    });

    db.on('close', () => func.log(printModes.ALL, 'Database connection closed unexpectedly'));

    // TODO: Force close? db.close(true)
    // db.close().then((err, res) => {
      // if (err) throw new Error(err);
    // });

    // End time logging
    if (conf.DEVMODE) console.timeEnd('start');
  })
  .catch(err => func.handleError(err));
