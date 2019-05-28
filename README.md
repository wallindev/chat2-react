# chat2-react

Second overhaul and almost complete rewrite of the Node.js Real-time Chat app (formerly 'nodejs-chat').

Chat application with a Express.js and SSR (Server-Side React) backend. Uses web sockets (Socket.io) to send messages between clients and server in real-time. Messages are saved in bulk every sixty seconds (configurable) - instead of connecting to db every time a message is sent - to MongoDB which minimizes the server load. With a new frontend in React.js, bundled with Webpack, this is almost a complete rewrite from my 'nodejs-chat' app

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

```sh
git clone https://github.com/wallindev/chat2-react.git
cd chat2-react
npm install
npm start
```

## Dependencies

- [express](https://github.com/strongloop/express): Fast, unopinionated, minimalist web framework
- [hjs](https://github.com/nullfirm/hjs): Hogan.js NPM package for express 3.x
- [mongodb](https://github.com/mongodb/node-mongodb-native): A node.js driver for MongoDB
- [socket.io](https://github.com/Automattic/socket.io): node.js realtime framework server

## Dev Dependencies

- [bower](https://github.com/bower/bower): A package manager for the web

## License

ISC
