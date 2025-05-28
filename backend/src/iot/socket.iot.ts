import WebSocket from 'ws';
import weatherContentSocket from '../socket/weatherContent.socket'; // To push updates to web clients
import { ITempHumid } from '../types/device.interface';
import 'dotenv/config';

let latestTempHumid: ITempHumid = {
  temperature: '',
  humidity: '',
};

let wsClient: WebSocket | null = null;

function connectToEsp32() {
  if(!process.env.AXIOS_IOT_URI) {
    console.error('AXIOS_IOT_URI is not defined in environment variables.');
    return;
  }

  if (wsClient && (wsClient.readyState === WebSocket.OPEN || wsClient.readyState === WebSocket.CONNECTING)) {
    console.log('ESP32 WebSocket client already connected or connecting.');
    return;
  }

  console.log(`Attempting to connect to ESP32 WebSocket at ${process.env.AXIOS_IOT_URI}`);
  wsClient = new WebSocket(process.env.AXIOS_IOT_URI);

  wsClient.on('open', () => {
    console.log('Successfully connected to ESP32 WebSocket.');
  });

  wsClient.on('message', (data: WebSocket.Data) => {
    try {
      const messageString = data.toString();
      const parsedData = JSON.parse(messageString);

      if (parsedData.error) {
        console.error('ESP32 reported error:', parsedData.error);
        latestTempHumid = {
            temperature: '',
            humidity: '',
        };
      } else if (parsedData.temperature !== undefined && parsedData.humidity !== undefined) {
        latestTempHumid = {
          temperature: parsedData.temperature.toString(),
          humidity: parsedData.humidity.toString(),
        };
        console.log('Received from ESP32:', latestTempHumid);

        // --- Real-time push to frontend clients via backend's Socket.IO ---
        if (weatherContentSocket.io) {
            weatherContentSocket.io.emit('temp_humid_updated', latestTempHumid);
        } else {
            console.warn('Backend Socket.IO not ready, cannot emit temp_humid_updated yet.');
        }
        // --- End real-time push ---

      } else {
        console.warn('Received unknown message format from ESP32:', parsedData);
      }
    } catch (error) {
      console.error('Failed to parse message from ESP32 or unexpected error:', error);
      latestTempHumid = {
        temperature: '',
        humidity: '',
      };
    }
  });

  wsClient.on('close', (code, reason) => {
    const reasonMsg = reason ? reason.toString() : 'No reason provided';
    console.log(`Disconnected from ESP32 WebSocket. Code: ${code}, Reason: ${reasonMsg}. Reconnecting in 5 seconds...`);
    latestTempHumid = {
      temperature: '',
      humidity: '',
    };
    wsClient = null; // Clear the client instance
    setTimeout(connectToEsp32, 5000); // Attempt to reconnect after 5 seconds
  });

  wsClient.on('error', (err) => {
    console.error('ESP32 WebSocket connection error:', err.message);
    latestTempHumid = {
      temperature: '',
      humidity: '',
    };
    // The 'close' event will usually follow an error, triggering reconnection logic
    if (wsClient && wsClient.readyState !== WebSocket.OPEN) {
      wsClient.terminate(); // Force close if not already closing
    }
  });
}

export function getLatestEsp32Data(): ITempHumid {
  return { ...latestTempHumid }; // Return a copy to prevent direct modification
}

export function initializeEsp32Connector() {
  connectToEsp32();
}