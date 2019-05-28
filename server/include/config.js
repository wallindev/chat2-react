'use strict';
const path = require('path');

/*
 * Globals
 *
 */
// Stack property
Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

// Line property
Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});

// File property
Object.defineProperty(global, '__file', {
  get: function(){
    return __stack[1].getFileName().split('/').slice(-1)[0];
  }
});

module.exports = {
  DEVMODE: true,
  PRODMODE: true, //!DEVMODE

  // App title
  appTitle: "Chat App now in React! =D",

  // Directories
  publicDir: path.join(__dirname, '/../../client'),

  // OpenShift node.js port and IP address
  httpPort: process.env.PORT  || 3000,
  ipAddress: process.env.IP  || "127.0.0.1",

  // Database constants
  DBSERVER: process.env.DB_HOST || "127.0.0.1",
  DBPORT: process.env.DB_PORT || 27017,
  DBNAME: 'chat',
  DBUSER: 'chatUser',
  DBPASS: 'chatPassword'
  //DBNAME: process.env.DB_NAME || 'chat',
  //DBUSER: process.env.DB_USERNAME || 'chatUser',
  //DBPASS: process.env.DB_PASSWORD || "chatPassword"
};
