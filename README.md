# chat2-react

Second version and almost complete rewrite of the Node.js Real-time Chat app (formerly 'nodejs-chat').

Chat application with Express.js backend. Uses web sockets (Socket.io) to send messages between clients and server in real-time. Messages are saved in bulk every sixty seconds (configurable) - instead of connecting to db every time a message is sent - to MongoDB which minimizes the server load. With a new frontend in React.js, bundled with Webpack, this is almost a complete rewrite from the original 'nodejs-chat' app

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

Clone repository and install npm modules
```sh
git clone https://github.com/wallindev/chat2-react.git
cd chat2-react
npm install
```

For running production mode
```sh
npm run build
npm start
```

For running development mode and live code
```sh
npm run start:dev
```
*`Note: This uses the Express middleware version ("webpack-dev-middleware") of Webpack's dev server that runs in, and writes bundles to, memory (configurable) and not webpack-dev-server`*

## Dependencies

- [@babel/core](https://ghub.io/@babel/core): Babel compiler core.
- [@babel/preset-env](https://ghub.io/@babel/preset-env): A Babel preset for each environment.
- [@babel/preset-react](https://ghub.io/@babel/preset-react): Babel preset for all React plugins.
- [@babel/register](https://ghub.io/@babel/register): babel require hook
- [babel-loader](https://ghub.io/babel-loader): babel module loader for webpack
- [colors](https://ghub.io/colors): get colors in your node.js console
- [cors](https://ghub.io/cors): Node.js CORS middleware
- [cross-env](https://ghub.io/cross-env): Run scripts that set and use environment variables across platforms
- [css-loader](https://ghub.io/css-loader): css loader module for webpack
- [express](https://ghub.io/express): Fast, unopinionated, minimalist web framework
- [mongodb](https://ghub.io/mongodb): The official MongoDB driver for Node.js
- [open](https://ghub.io/open): Open stuff like URLs, files, executables. Cross-platform.
- [react](https://ghub.io/react): React is a JavaScript library for building user interfaces.
- [react-dom](https://ghub.io/react-dom): React package for working with the DOM.
- [socket.io](https://ghub.io/socket.io): node.js realtime framework server
- [style-loader](https://ghub.io/style-loader): style loader module for webpack
- [webpack](https://ghub.io/webpack): Packs CommonJs/AMD modules for the browser. Allows to split your codebase into multiple bundles, which can be loaded on demand. Support loaders to preprocess files, i.e. json, jsx, es7, css, less, ... and your custom stuff.
- [webpack-cli](https://ghub.io/webpack-cli): CLI for webpack &amp; friends
- [webpack-dev-middleware](https://ghub.io/webpack-dev-middleware): A development middleware for webpack
- [webpack-hot-middleware](https://ghub.io/webpack-hot-middleware): Webpack hot reloading you can attach to your own server
- [webpack-node-externals](https://ghub.io/webpack-node-externals): Easily exclude node_modules in Webpack bundle

## Dev Dependencies

- [nodemon](https://ghub.io/nodemon): Simple monitor script for use during development of a node.js app.

## Prerequisites

MongoDB Database installed with default settings (host: localhost, port=27017, dbpath=/data/db) or access to an online cluster. Mongod engine/service version 3.2.

## Issues

Webpack has a default setting to mock certain Node.js globals when compiling the server bundle, for example '__dirname' and '__filename'. For this to work correctly the following option needs to be set in the webpack config file.

```js
  node: {
    __dirname: true,
    __filename: true
  }
```

More info in the [webpack documentation](https://webpack.js.org/configuration/node#node__filename).

NODE_ENV: The installation should work as-is on all Linux-based and Mac environments, however in Windows it works differently. The NODE_ENV environment variable needs to be set to either 'development' or 'production' in the start and build scripts. For some reason, the "cross-env" module doesn't work, which is what I always use to set env variables for cross compatibility between different OS/platforms. Be sure to check this before running the app (Powershell: $env:NODE_ENV="development|production", CMD: set NODE_ENV=development|production).

## License

ISC
