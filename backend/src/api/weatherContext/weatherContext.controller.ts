import { Request, Response, NextFunction } from 'express';
import weatherContextService from './weatherContext.service';

class WeatherContextController {
  async getTempHumid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await weatherContextService.getTempHumid();

      res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new WeatherContextController();
