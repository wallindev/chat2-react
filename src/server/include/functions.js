import fs from 'fs';
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
    let bundleFile = null;
    try {
      const dir = `${config.output.path}/`;
      const bundleFiles = fs.readdirSync(dir);
      // Sort files in reverse chronological order (newest first)
      bundleFiles.sort((a, b) => fs.statSync(dir + b).mtime.getTime() - fs.statSync(dir + a).mtime.getTime());
      bundleFile = bundleFiles[0];
      if (!bundleFile) throw new Error("Bundle file undefined");
    } catch(e) {
      colorPrint("FgRed", "\nCouldn\'t get client bundle file\n");
      console.error(e);
      colorPrint("FgRed", "\nDid you run build script (\'npm run build\')?\n");
      process.exit();
    }
    return bundleFile;
  }
};
