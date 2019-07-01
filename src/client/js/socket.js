import socketClient from 'socket.io-client';

let socket = null;
export const getSocket = () => {
  const socketUrl = `${location.protocol}//${location.hostname}:${location.port}`;

  try {
    socket = socketClient(socketUrl);
  } catch (e) {
    console.error('Error: ', e.message);
  }
  
  if (socket === undefined) {
    console.error('Error: socket undefined');
    return 1;
  }
  
  return socket;
};
