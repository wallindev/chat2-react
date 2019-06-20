import path from 'path';
import shelljs from 'shelljs'

/*
 * Config
 *
 */
const NODE_ENV = process.env.NODE_ENV;
const MODE = NODE_ENV === 'development' ? 'dev' : 'prod';

const publicDir = path.resolve(__dirname, './../../../dist');
const publicPath = `/${path.basename(publicDir)}`;

export const printModes = {
  ALL: 0,
  DEV: 1,
  PROD: 2,
};

export default {
  NODE_ENV,
  MODE,

  DEVMODE: MODE === 'dev',
  PRODMODE: MODE === 'prod',

  // App title
  appTitle: "Chat App now in React! =D",

  // Directories
  publicDir,
  publicPath,

  // OpenShift node.js port and IP address
  httpPort: process.env.PORT  || 8080,
  ipAddress: process.env.IP  || "127.0.0.1",

  // Database constants
  DBSERVER: process.env.DB_HOST || "127.0.0.1",
  DBPORT: process.env.DB_PORT || 27017,
  DBNAME: 'chat',
  DBUSER: 'chatUser',
  DBPASS: 'chatPassword',
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