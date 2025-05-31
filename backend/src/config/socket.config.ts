import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import weatherContentSocket from '../socket/weatherContent.socket';
import weatherContentProvider from '../providers/weatherContent.provider';

class SocketManager {
  io: Server | null = null;
  connectedSockets = new Set<Socket>();
  globalIntervals = new Map<string, NodeJS.Timeout>();
  isInitialized = false;

  initialize(server: HttpServer): Server {
    if (this.io) {
      console.warn('Socket.IO already initialized');
      return this.io;
    }

    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      },
    });

    this.setupConnectionHandlers();
    this.setupGlobalIntervals();
    this.isInitialized = true;

    return this.io;
  }

  getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO has not been initialized. Call initialize() first.');
    }
    return this.io;
  }

  setupConnectionHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', async (socket) => {
      console.log(`New client connected: ${socket.id}`);
      await this.handleNewConnection(socket);
    });
  }

  async handleNewConnection(socket: Socket): Promise<void> {
    this.connectedSockets.add(socket);

    // Emit initial data only to the new socket
    try {
      await this.emitInitialWeatherDataToSocket();
    } catch (error) {
      console.error(`Error emitting initial weather data to ${socket.id}:`, error);
    }

    this.setupDisconnectHandler(socket);
    
    console.log(`Total connected sockets: ${this.connectedSockets.size}`);
  }

  async emitInitialWeatherDataToSocket(): Promise<void> {
    console.log('Emitting initial weather data to new socket');

    await weatherContentSocket.emitLocationChange();
    await weatherContentSocket.emitDateChange();
    await weatherContentSocket.emitTimeOfDateChange();
  }

  setupGlobalIntervals(): void {
    console.log('Interval weather data to new socket');

    // Only create intervals once, not per socket
    if (this.globalIntervals.size > 0) {
      return; // Already setup
    }

    // Location update interval
    const locationInterval = setInterval(async () => {
      if (this.connectedSockets.size === 0) return;
      
      try {
        await weatherContentSocket.emitLocationChange();
      } catch (error) {
        console.error('Error emitting location change:', error);
      }
    }, 600000); // 10 minutes

    // Date update interval
    const dateInterval = setInterval(async () => {
      if (this.connectedSockets.size === 0) return;
      
      try {
        await weatherContentSocket.emitDateChange();
      } catch (error) {
        console.error('Error emitting date change:', error);
      }
    }, 60000); // 1 minute

    // Time update interval
    const timeInterval = setInterval(async () => {
      if (this.connectedSockets.size === 0) return;
      
      try {
        await weatherContentSocket.emitTimeOfDateChange();
      } catch (error) {
        console.error('Error emitting time change:', error);
      }
    }, 60000); // 1 minute

    // Store global intervals
    this.globalIntervals.set('location', locationInterval);
    this.globalIntervals.set('date', dateInterval);
    this.globalIntervals.set('time', timeInterval);
  }

  setupDisconnectHandler(socket: Socket): void {
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
      this.handleDisconnection(socket);
    });
  }

  handleDisconnection(socket: Socket): void {
    this.connectedSockets.delete(socket);
    console.log(`Remaining connected sockets: ${this.connectedSockets.size}`);
  }

  clearGlobalIntervals(): void {
    this.globalIntervals.forEach((interval, key) => {
      clearInterval(interval);
      console.log(`Cleared ${key} interval`);
    });
    this.globalIntervals.clear();
  }

  async cleanup(): Promise<void> {
    console.log('Shutting down Socket Manager...');
    
    // Clear all intervals
    this.clearGlobalIntervals();

    // Disconnect all sockets gracefully
    const disconnectPromises = Array.from(this.connectedSockets).map(socket => {
      return new Promise<void>((resolve) => {
        socket.on('disconnect', () => resolve());
        socket.disconnect(true);
      });
    });

    await Promise.all(disconnectPromises);
    this.connectedSockets.clear();

    // Close the server
    if (this.io) {
      await new Promise<void>((resolve, reject) => {
        this.io!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      this.io = null;
    }

    this.isInitialized = false;
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export const socketConfig = (server: HttpServer): Server => {
  return socketManager.initialize(server);
};

export const getIO = (): Server => {
  return socketManager.getIO();
};

export const cleanupSockets = async (): Promise<void> => {
  await socketManager.cleanup();
};
