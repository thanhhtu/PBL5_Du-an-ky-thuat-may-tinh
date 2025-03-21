import { getIO } from '../config/socket.config';
import { errorHandlerFunc } from './errorHandler.service';


class DateLocationService {
  async getDate(): Promise<string>{
    return errorHandlerFunc(async () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
      const year = now.getFullYear();
      const date = `${day} ${month} ${year}`;
      
      const io = getIO();
      io.emit('date_changed', date);
      
      return date;
    });
  }
}

export default new DateLocationService();