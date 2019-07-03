import path from 'path';
import shelljs from 'shelljs';

/*
 * Config
 *
 */
let NODE_ENV = process.env.NODE_ENV || 'development';
if (NODE_ENV !== 'development' && NODE_ENV !== 'production') {
  console.warn("NODE_ENV environment variable wasn't set correctly, must be either 'development' or 'production'");
  NODE_ENV = 'development';
  console.warn("Setting NODE_ENV to 'development' and continuing...");
}
const MODE = NODE_ENV === 'development' ? 'dev' : 'prod';

const publicDir = path.resolve(__dirname, './../../../dist');
const publicPath = `/${path.basename(publicDir)}`;

export const printModes = {
  ALL: 0,
  DEV: 1,
  PROD: 2,
};

// If on Heroku, IS_LOCAL = false
const IS_LOCAL = false;

export default {
  IS_LOCAL,
  NODE_ENV,
  MODE,

  DEVMODE: MODE === 'dev',
  PRODMODE: MODE === 'prod',

  // App title
  appTitle: "Chat App now in React! =D",

  // Directories
  publicDir,
  publicPath,

  // App host and port
  APP_HOST: "localhost",
  APP_PORT: process.env.PORT || 8080,

  // Database constants
  DB_PROTOCOL: IS_LOCAL ? "mongodb" : 'mongodb+srv',
  DB_HOST: IS_LOCAL ? "127.0.0.1" : 'cluster-m0-1qe5b.mongodb.net',
  DB_PORT: 27017,
  DB_NAME: 'chat',
  DB_USER: 'chatUser',
  DB_PASS: 'chatPassword',
};

// Exit handling, cleanup, etc.
['exit', 'SIGINT', 'uncaughtException'].forEach(signal => process.on(signal, msg => {
  if (shelljs.test('-e', 'APP_OPENED_IN_BROWSER'))
    shelljs.rm('APP_OPENED_IN_BROWSER');

  if (signal === 'uncaughtException')
    console.error(signal, msg);
  process.exit();
}));

/* 
const exitHandler = exitCode => {
  // Perform cleanup
  console.log(exitCode);
  if (exitCode === 'exit' || exitCode === 'SIGINT') {
    if (shelljs.test('-e', 'APP_OPENED_IN_BROWSER'))
    shelljs.rm('APP_OPENED_IN_BROWSER');
  }
  process.exit(exitCode);
}

//do something when app is closing
process.on('exit', exitHandler);

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
 */
/* 
const exitHandler = (options, exitCode) => {
  // Perform cleanup
  if (options.type === 'exit') {
    if (shelljs.test('-e', 'APP_OPENED_IN_BROWSER'))
      shelljs.rm('APP_OPENED_IN_BROWSER');

    if (MODE === 'dev') console.log('goodbye');
  }

  if (options.type === 'sigusr1' || options.type === 'sigusr2')
  if (MODE === 'dev') console.log('restart');

  if (options.type === 'exception') if (MODE === 'dev') console.log('uncaught exception');

  if (exitCode || exitCode === 0) if (MODE === 'dev') console.log("\nexitCode:", exitCode);

  if (options.exit) process.exit();

  process.exit(exitCode);
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { type: 'exit', exit: true }));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { type: 'sigint', exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { type: 'sigusr1', exit: false }));
process.on('SIGUSR2', exitHandler.bind(null, { type: 'sigusr2', exit: false }));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { type: 'exception', exit: false }));
 */