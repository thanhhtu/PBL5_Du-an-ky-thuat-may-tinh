import { Server, Socket } from 'socket.io';
import { getIO } from '../config/socket.config';
import { errorHandlerFunc } from '../service/errorHandler.service';
import weatherContentService from '../service/weatherContent.service';

class WeatherContentSocket{
  _io: Server | null = null;

  get io(): Server {
    if (!this._io) {
      this._io = getIO();
    }
    return this._io;
  }

  async emitLocationChange(): Promise<void>{
    return errorHandlerFunc(async () => {
      const location = await weatherContentService.getLocation();

      this.io.emit('location_changed', location);
    });
  }

  async emitDateChange(): Promise<void>{
    return errorHandlerFunc(async () => {
      const date = await weatherContentService.getDate();

      this.io.emit('date_changed', date);
    });
  }

  async emitTimeOfDateChange(): Promise<void>{
    return errorHandlerFunc(async () => {
      const time = await weatherContentService.getTimeOfDay();

      this.io.emit('time_of_date_changed', time);
    });
  }
}

export default new WeatherContentSocket();