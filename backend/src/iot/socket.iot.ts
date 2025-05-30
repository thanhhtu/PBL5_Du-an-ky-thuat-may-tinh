import { io, Socket } from 'socket.io-client';
import { ITempHumid } from '../types/device.interface';
import 'dotenv/config';
import { errorHandlerFunc } from '../providers/errorHandler.provider';
import weatherContentSocket from '../socket/weatherContent.socket';

class IotConnector {
  socketClient: Socket | null = null;
  latestData: ITempHumid = {
    temperature: undefined,
    humidity: undefined,
  };
  readonly reconnectDelay = 5000;

  constructor() {
    if (!process.env.IOT_URI) {
      throw new Error('IOT_URI is not defined in environment variables.');
    }
  }

  isConnectedOrConnecting(): boolean {
    return this.socketClient?.connected || false;
  }

  resetData(): void {
    this.latestData = {
      temperature: undefined,
      humidity: undefined,
    };
  }

  handleTempHumidUpdated = async (data: ITempHumid): Promise<void> => {
    await errorHandlerFunc(async () => {
      console.log('Received temp_humid_updated:', data);
      
      this.latestData = {
        temperature: data.temperature,
        humidity: data.humidity,
      };
      console.log('Updated latest data:', this.latestData);

      weatherContentSocket.emitTempHumidChange(this.latestData);
    }).catch(error => {
      console.error('Failed to handle temp_humid_updated:', error.message);
    });
  };

  cleanup(): void {
    this.resetData();
    if (this.socketClient) {
      this.socketClient.removeAllListeners();
      this.socketClient = null;
    }
  }

  async setupEventListeners(): Promise<void> {
    return errorHandlerFunc(async () => {
      if (!this.socketClient) return;

      // Connection events
      this.socketClient.on('connect', () => {
        console.log('Successfully connected to IoT Socket.IO server.');
        console.log('Socket ID:', this.socketClient?.id);
      });

      this.socketClient.on('disconnect', (reason) => {
        console.log(`IoT Socket.IO disconnected. Reason: ${reason}`);
        this.cleanup();
        
        if (reason === 'io server disconnect') {
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      });

      this.socketClient.on('connect_error', (error) => {
        console.error('IoT Socket.IO connection error:', error.message);
        this.resetData();
      });

      this.socketClient.on('reconnect', (attemptNumber) => {
        console.log(`IoT Socket.IO reconnected after ${attemptNumber} attempts.`);
      });

      // Chỉ lắng nghe sự kiện temp_humid_updated
      this.socketClient.on('temp_humid_updated', this.handleTempHumidUpdated);
    });
  }

  async connect(): Promise<void> {
    return errorHandlerFunc(async () => {
      if (this.isConnectedOrConnecting()) {
        console.log('IoT Socket.IO client already connected or connecting.');
        return;
      }

      console.log(`Attempting to connect to IoT Socket.IO at ${process.env.IOT_URI}`);
      
      const socketOptions = {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: 5,
        timeout: 20000,
        forceNew: true,
      };

      this.socketClient = io(process.env.IOT_URI!, socketOptions);
      await this.setupEventListeners();
    });
  }

  getLatestData(): ITempHumid {
    console.log('Fetching latest temp_humid data:', this.latestData);
    return { ...this.latestData }; 
  }

  async disconnect(): Promise<void> {
    return errorHandlerFunc(async () => {
      if (this.socketClient) {
        this.socketClient.disconnect();
        this.cleanup();
        console.log('IoT Socket.IO connection closed gracefully.');
      }
    });
  }
}

// Singleton instance
const connector = new IotConnector();

export function getLatestTempHumid(): ITempHumid {
  return connector.getLatestData();
}

export async function initializeIoTSocket(): Promise<void> {
  await connector.connect();
}

export async function disconnectIoTSocket(): Promise<void> {
  await connector.disconnect();
}