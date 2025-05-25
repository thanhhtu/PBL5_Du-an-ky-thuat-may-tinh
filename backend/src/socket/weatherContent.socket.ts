import { Server } from 'socket.io';
import { getIO } from '../config/socket.config';
import { errorHandlerFunc } from '../providers/errorHandler.provider';
import weatherContentService from '../providers/weatherContent.provider';

class WeatherContentSocket {
  _io: Server | null = null;

  get io(): Server {
    if (!this._io) {
      this._io = getIO();
    }
    return this._io;
  }

  async emitLocationChange(): Promise<void> {
    return errorHandlerFunc(async () => {
      const location = await weatherContentService.getLocation();
      this.io.emit('location_changed', location);
    });
  }

  async emitDateChange(): Promise<void> {
    return errorHandlerFunc(async () => {
      const date = weatherContentService.getDate();
      this.io.emit('date_changed', date);
    });
  }

  async emitTimeOfDateChange(): Promise<void> {
    return errorHandlerFunc(async () => {
      const time = weatherContentService.getTimeOfDay();
      this.io.emit('time_of_date_changed', time);
    });
  }

  async emitTempHumidChange(): Promise<void> {
    return errorHandlerFunc(async () => {
      const tempHumid = await weatherContentService.getTempHumid();

      this.io.emit('temp_humid_changed', tempHumid);
    });
  }
}

export default new WeatherContentSocket();
