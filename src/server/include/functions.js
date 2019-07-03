import shell from 'shelljs';
const { exec } = require('child_process');

import conf, { printModes } from './config';
import colors from './colors';

/*
 * Functions
 *
 */
// Local
const w = process.stdout.write;
const l = console.log;

const colorPrint = (color, ...out) => l(`${colors[color]}%s${colors.Reset}`, out.length > 1 ? out.join(' ') : out);

// Global
export default {
  w,
  l,
  colorPrint,

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

  handleError: error => {
    const msg = `${new Date()}
Exception of type '${error.name}' thrown:
${error.message}
Stack:
${error.stack}`;

    colorPrint('BgRed', msg);
  },

  // Console.log in production and/or development mode
  log: (printMode = printModes.ALL, ...args) => {
    if (printMode === printModes.DEV && conf.PRODMODE ||
        printMode === printModes.PROD && conf.DEVMODE)
        return;

    const color = conf.PRODMODE ? 'FgCyan' : 'FgMagenta';
    args.length > 1 ? colorPrint(color, ...args) : colorPrint(color, args[0]);
  },
  getBundleFileName: (config) => {
    // In DEV mode, simply return output filename in webpack config file
    if (conf.DEVMODE)
      return config.output.filename;

    // In PROD mode, read name of physical compiled file (because of hash)
    const curDir = process.cwd();
    shell.cd(config.output.path);
    const output = shell.exec('ls -t client.*.js', { silent: true });
    const bundleFiles = output.trim().split("\n");
    const bundleFile = bundleFiles[0];
    shell.cd(curDir);

    if (bundleFile.code > 0) {
      colorPrint("FgRed", "\nCouldn\'t find client bundle file:");
      colorPrint("FgRed", bundleFile.stderr);
      console.error("\nDid you run build script (\'npm run build\')?\n");
      process.exit();
      // throw new Error(bundleFile.stderr);
    }

    return bundleFile;
  }
};
