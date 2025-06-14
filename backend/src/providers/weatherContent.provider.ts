import axios from 'axios';
import { errorHandlerFunc } from './errorHandler.provider';

class WeatherContentProvider {
  async getLocation(): Promise<string> {
    return errorHandlerFunc(async () => {
      const ipData = await axios.get('https://api64.ipify.org?format=json');
      const { ip } = ipData.data;
      const res = await axios.get(`https://ipinfo.io/${ip}/json`);
      const { region, country } = res.data;
      return `${region}`;
    });
  }

  getDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    const year = now.getFullYear();
    return `${day} ${month} ${year}`;
  }

  getTimeOfDay(): string {
    const today = new Date();
    const curHr = today.getHours();
    let time = null;

    if (curHr < 12) {
      time = 'Morning';
    } else if (curHr < 18) {
      time = 'Afternoon';
    } else {
      time = 'Evening';
    }
    return time;
  }
}

export default new WeatherContentProvider();
