const getSocket = () => {
  // const currentUrl = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');
  const socketProtocol = 'ws:';
  const socketHost = location.hostname;
  // Socket port must be same as http port (to avoid CORS - Cross-origin resource sharing - conflict)
  const socketPort = (location.port) ? location.port : 8000;
  const socketUrl = socketProtocol + '//' + socketHost + ':' + socketPort;

  let socket;
  try {
    socket = io.connect(socketUrl);
  } catch (e) {
    console.error('Error: ', e.message);
  }
  
  if (socket === undefined) {
    console.error('Error: socket undefined');
    return 1;
  }

  return socket;
}

export default getSocket;
