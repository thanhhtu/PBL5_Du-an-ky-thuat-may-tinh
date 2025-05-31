import WebSocket from 'ws';
import { ITempHumid } from '../types/device.interface';
import 'dotenv/config';
import { errorHandlerFunc } from '../providers/errorHandler.provider';
import weatherContentSocket from '../socket/weatherContent.socket';

class IotConnector {
  wsClient: WebSocket | null = null;
  
  latestData: ITempHumid = {
    temperature: undefined,
    humidity: undefined,
  };

  readonly reconnectDelay = 5000;
  reconnectAttempts = 0;
  maxReconnectAttempts = 5;
  reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (!process.env.IOT_SOCKET_URI) {
      throw new Error('IOT_SOCKET_URI is not defined in environment variables.');
    }
  }

  isConnectedOrConnecting(): boolean {
    return this.wsClient?.readyState === WebSocket.OPEN || 
           this.wsClient?.readyState === WebSocket.CONNECTING;
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

  handleMessage(data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.error) {
        console.error('ESP32 error:', message.error);
        this.resetData();
        weatherContentSocket.emitTempHumidChange(this.latestData);
        return;
      }
      
      if (typeof message.temperature === 'number' && typeof message.humidity === 'number') {
        this.handleTempHumidUpdated({
          temperature: message.temperature,
          humidity: message.humidity
        });
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  cleanup(): void {
    this.resetData();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.wsClient) {
      this.wsClient.removeAllListeners();
      if (this.wsClient.readyState === WebSocket.OPEN) {
        this.wsClient.close();
      }
      this.wsClient = null;
    }
  }

  scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached. Giving up.');
    }
  }

  async setupEventListeners(): Promise<void> {
    return errorHandlerFunc(async () => {
      if (!this.wsClient) return;

      this.wsClient.on('open', () => {
        console.log('Successfully connected to IoT WebSocket server.');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        
        console.log('Current latest data:', this.latestData);
        weatherContentSocket.emitTempHumidChange(this.latestData);
      });

      this.wsClient.on('close', (code, reason) => {
        console.log(`IoT WebSocket disconnected. Code: ${code}, Reason: ${reason.toString()}`);
        this.resetData();
        weatherContentSocket.emitTempHumidChange(this.latestData);
        
        if (code !== 1000) { 
          this.scheduleReconnect();
        }
      });

      this.wsClient.on('error', (error) => {
        console.error('IoT WebSocket connection error:', error.message);
        this.resetData();
        weatherContentSocket.emitTempHumidChange(this.latestData);
      });

      this.wsClient.on('message', (data) => {
        this.handleMessage(data);
      });
    });
  }

  async connect(): Promise<void> {
    return errorHandlerFunc(async () => {
      if (this.isConnectedOrConnecting()) {
        console.log('IoT WebSocket client already connected or connecting.');
        return;
      }

      let wsUrl = process.env.IOT_SOCKET_URI!;
      
      // Validate WebSocket URL (port 81)
      if (!wsUrl.includes(':81')) {
        console.warn('Warning: ESP32 WebSocket server typically runs on port 81');
      }
      
      console.log(`Attempting to connect to IoT WebSocket at ${wsUrl}`);
      
      const wsOptions = {
        handshakeTimeout: 20000,
        perMessageDeflate: false,
      };

      this.wsClient = new WebSocket(wsUrl, wsOptions);
      await this.setupEventListeners();
    });
  }

  getLatestData(): ITempHumid {
    console.log('Fetching latest temp_humid data:', this.latestData);
    return { ...this.latestData }; 
  }

  async disconnect(): Promise<void> {
    return errorHandlerFunc(async () => {
      if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
        this.wsClient.close(1000, 'Normal closure'); // 1000 = normal closure
        this.cleanup();
        console.log('IoT WebSocket connection closed gracefully.');
      }
    });
  }

  getConnectionStatus(): string {
    if (!this.wsClient) return 'DISCONNECTED';
    
    switch (this.wsClient.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
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

export function getIoTConnectionStatus(): string {
  return connector.getConnectionStatus();
}