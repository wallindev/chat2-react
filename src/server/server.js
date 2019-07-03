// Includes
import conf, { printModes } from './include/config';
import func from './include/functions';

// Dependency modules
import io from 'socket.io';
import { MongoClient } from 'mongodb';
import util from 'util';

import webpack from 'webpack';
import webpackConfig from '../../webpack.config.babel';

const compiler = webpack(webpackConfig);

const compilerClient = compiler.compilers.find(compiler => compiler.name === `client-${conf.NODE_ENV}`);
// const compilerServer = compiler.compilers.find(compiler => compiler.name === `server-${conf.NODE_ENV}`);

import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';

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

// Spin upp server and sockets
const server = app.listen(conf.APP_PORT, conf.APP_HOST);
func.log(printModes.ALL, `ExpressJS: Web server started @ ${conf.APP_HOST} on port ${conf.APP_PORT}`);

// For dev purpose, so that browser is only opened
// on start, not on every restart
if (!shelljs.test('-e', 'APP_OPENED_IN_BROWSER')) {
  // shelljs.exec(`xdg-open ${conf.APP_HOST}:${conf.APP_PORT}`);
  open(`${conf.APP_HOST}:${conf.APP_PORT}`); // OS/Platform independent
  if (conf.DEVMODE) shelljs.touch('APP_OPENED_IN_BROWSER');
}
const sockets = io.listen(server).sockets;

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
    coll.find({}, {_id: 0}).limit(100).sort({created: -1}).toArray()
      .then(messages => func.log(printModes.DEV, "Messages retrieved (on start):", JSON.stringify(messages)))
      .catch(err => func.handleError(err));

    // Run the "save loop" every minute:
    setInterval(() => {
      if (newMessages.length) {
        if (conf.DEVMODE) console.time('save loop');

        // Insert the new documents
        coll.insertMany(newMessages)
          .then(messagesInserted => {
            func.log(printModes.PROD, 'Messages saved to database');
            func.log(printModes.DEV, "Messages inserted:", JSON.stringify(messagesInserted));

            // Empty newMessages array
            newMessages = [];

            if (conf.DEVMODE) console.timeEnd('save loop');
          })
          .catch(err => func.handleError(err));
      }
    }, 60000);

    // Fires when there's a http connection to the server
    sockets.on('connection', socket => {
      func.log(printModes.ALL, 'Client connected to chat');

      // Since db connections are done synchronously, there may be a connection to the web server before
      // the db object is propagated (i.e. when the server is restarted)
      // We then tell the user to please reload the browser
      if (!db.serverConfig.isConnected()) {
        func.sendStatus({
          message: 'Database temporarily unavailable, please reload your browser',
          type: 'primary',
          which: 'status',
          clear: false,
          restore: false
        }, socket);
        return 1;
      }

      // Welcome user
      const welcomeMsg = 'Welcome to the chat! =)';
      func.sendStatus({
        message: welcomeMsg,
        type: 'primary',
        which: 'status',
        clear: false
      }, socket);

      // Start time logging
      if (conf.DEVMODE) console.time('client connection');

      // Retrieve 100 last messages, omit _id field
      coll.find({}).limit(100).sort({created: -1}).toArray()
        .then(messages => {
          func.log(printModes.ALL, 'Messages retrieved from database');
          func.log(printModes.DEV, "Messages retrieved (on client connection):", JSON.stringify(messages));

          // If there are new messages that are not yet saved to db, we have to include them here
          func.log(printModes.DEV, "new messages:", JSON.stringify(newMessages));
          func.log(printModes.DEV, "old messages:", JSON.stringify(messages));
          let allMessages = [];
          if (newMessages.length) {
            allMessages = newMessages.concat(messages);
          } else {
            allMessages = messages;
          }
          func.log(printModes.DEV, "all messages:", JSON.stringify(messages));

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
        // Add date on server instead of client
        // in the form of a timestamp
        message.created = (new Date()).getTime();

        // Checking for empty values
        const regex1 = /^\s*$/;
        // Letters a-ö, A-Ö, numbers 0-9, special characters _ and -, and atleast 3 of them
        const regex2 = /^([a-öA-Ö0-9_\.-]{3,})(\s?)([a-öA-Ö0-9_\.-]*)(\s?)([a-öA-Ö0-9_\.-]*)$/;
        let msg = '';
        if (regex1.test(message.name) || regex1.test(message.message)) {
          msg = 'Name or message can\'t be empty.';
          console.error(msg);
          func.sendStatus({
            message: msg,
            type: 'danger',
            which: 'status',
            clear: false
          }, socket);
          return 1;
        } else if (!regex2.test(message.name)) {
          msg = 'Name must be at least three characters long and contain valid characters.';
          console.error(msg);
          func.sendStatus({
            message: msg,
            type: 'danger',
            which: 'status',
            clear: false
          }, socket);
          return 1;
        } else {
          // Insert to messages array and send to client
          newMessages.unshift(message);
          func.log(printModes.DEV, "Inserted message:", JSON.stringify(message));

          // Send message to all clients
          sockets.emit('listMessages', [message]);

          func.sendStatus({
            message: 'Message sent',
            type: 'success',
            which: 'status',
            clear: true
          }, socket);

          const user = {
            socket: socket.id,
            name: message.name,
            created: (new Date()).getTime() // Timestamp
          };

          // If user array is empty, insert user object
          // If not iterate through and search for duplicates
          // If no duplicates found, insert user object
          // Unshift puts user as first object in array instead of last
          let userExists = false;
          if (users.length === 0) {
            userExists = false;
          } else {
            for (let i = 0; i < users.length; i++) {
              if (users[i].name === user.name) {
                userExists = true;
                break;
              }
            }
          }

          if(!userExists) {
            users.unshift(user);

            // Send status message to everyone else
            func.sendStatusOthers({
              message: '<em>' + user.name + '</em> has joined the chat',
              type: 'primary',
              which: 'status',
              clear: false
            }, socket);
          }

          // Add user on all clients user lists
          sockets.emit('listUsers', [user]);
        }
      });

      socket.on('removeUser', name => {
        for (let i = 0; i < users.length; i++) {
          if (users[i].name === name) {
            users.splice(i, 1);
            // Remove user from clients user lists
            sockets.emit('removeUser', name);
            break;
          }
        }
      });

      // Listen for client disconnect
      socket.on('disconnect', () => {
        // Remove user from user array
        let name = '';
        if (users.length > 0) {
          name = '';

          for (let i = 0; i < users.length; i++) {
            if (users[i].id === socket.id) {
              name = users[i].name;
              users.splice(i, 1);
              break;
            }
          }

          // If user has sent messages and thus is registrered with name
          if (name !== '') {
            // Remove user from clients user lists
            sockets.emit('removeUser', name);

            // Send status message to everyone else
            func.sendStatusOthers({
              message: '<em>' + name + '</em> has left the chat',
              type: 'info',
              which: 'status',
              clear: false
            }, socket);
          }
        }
      });
    });

    db.on('close', () => func.log(printModes.ALL, 'Connection closed unexpectedly'));

    // TODO: Force close? db.close(true)
    // db.close().then((err, res) => {
      // if (err) throw new Error(err);
    // });

    // End time logging
    if (conf.DEVMODE) console.timeEnd('start');
  })
  .catch(err => func.handleError(err));
