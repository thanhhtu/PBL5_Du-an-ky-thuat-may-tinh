import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import weatherContentSocket from '../socket/weatherContent.socket';

let io: Server;
const connectedSockets = new Set<Socket>();

const socketConfig = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', async (socket) => {
    console.log(`New client connected: ${socket.id}`);
    connectedSockets.add(socket);

    //emit weather
    await weatherContentSocket.emitLocationChange();
    await weatherContentSocket.emitDateChange();
    await weatherContentSocket.emitTimeOfDateChange();

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
      connectedSockets.delete(socket);
    });
  });

  return io;
};

const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
};

export { socketConfig, getIO };
