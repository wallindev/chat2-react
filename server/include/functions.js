'use strict';
// Dependency modules
const conf  = require('./config');
const colors = require('./colors');

/*
 * Functions
 *
 */
// Local
const colorPrint = (color, ...out) => {
  if (out.length === 2)
    console.log(`${colors[color]}${out[0]}${colors.Reset}`, out[1]);
  else
    console.log(`${colors[color]}%s${colors.Reset}`, out);
};

// Global
module.exports = {
  // Send status messages to all sockets (connected clients)
  sendStatusAll: data => sockets.emit('status', data),

  // Send status messages to specific socket (connected client)
  sendStatus: (data, s) => s.emit('status', data),

  // Send status messages to all (connected clients) except for the one sending
  sendStatusOthers: (data, s) => s.broadcast.emit('status', data),

  getTimestamp: () => {
    var dt = new Date();
    dt.setHours(dt.getHours()-24);
    var stamp = dt.getTime();
    return stamp;
  },

  handleError: (error, file, line, stack) => {
    colorPrint('FgRed', "error: %s", error);
    if (!stack)
      stack = error.stack;

    // console.error(new Date() + ":\nException of type '" + error.name + "' thrown:\n", error.message + "\n", "Stack:\n" + error.stack);
    //console.error(new Date() + ":\nError of type '" + error.name + "' in file '" + file + "' on line " + line + ":\n", error.message + "\n", "Stack:\n" + stack);
    //process.exit(1);
  },

  // Console.log in development mode
  devLog: (...args) => {
    if (conf.DEVMODE) {
      if (args.length === 2)
        colorPrint('FgCyan', args[0], args[1]);
      else
        colorPrint('FgCyan', args[0]);
    }
  },

  // Console.log in production mode
  prodLog: (...args) => {
    if (conf.PRODMODE) {
      if (args.length === 2)
        colorPrint('FgGreen', args[0], args[1]);
      else
        colorPrint('FgGreen', args[0]);
    }
  }
};
