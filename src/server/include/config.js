import path from 'path';
import fs from 'fs';

/*
 * Config
 *
 */
let NODE_ENV = process.env.NODE_ENV || 'development';
// TODO: Not optimal to set NODE_ENV here, best if we could get cross-env to work..
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

const LOCK_FILE = './APP_OPENED_IN_BROWSER';

// If on Heroku, IS_LOCAL = false
const IS_LOCAL = false;

export default {
  LOCK_FILE,
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
  // Only if on local
  if (IS_LOCAL && fs.existsSync(LOCK_FILE))
    fs.unlinkSync(LOCK_FILE);

  if (signal === 'uncaughtException')
    console.error(signal, msg);

  process.exit();
}));
