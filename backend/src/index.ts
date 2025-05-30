import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import 'dotenv/config';
import http from 'http';
import path from 'path';
import routers from './api'; 
import errorHandler from './middlewares/errorHandler.middleware';
import urlValidateMiddleware from './middlewares/urlValidate.middleware';
import { cleanupSockets, socketConfig } from './config/socket.config';
import { disconnectIoTSocket, initializeIoTSocket } from './iot/socket.iot';

const app = express();
const server = http.createServer(app);

const initializeApp = () => {
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public/images')));

  // API Routers
  app.use('/', routers); 

  app.use(errorHandler);
  app.use(urlValidateMiddleware.checkUrl); 
};

const initializeSocketServer = () => {
  socketConfig(server);
  console.log('Backend Socket.IO initialized for clients');
};

const initializeIoTSocketServer = async () => {
  await initializeIoTSocket();
  console.log('Backend Socket.IO initialized for IoT device.');
};

const port = process.env.PORT || 3000; 

server.listen(port, async () => {
  console.log(`Server is listening on port ${port}`);

  initializeApp();
  initializeSocketServer();
  await initializeIoTSocketServer();
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  try {
    await cleanupSockets();
    await disconnectIoTSocket();
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export { app, server };