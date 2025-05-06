import { Request, Response, NextFunction } from 'express';
import AIService from './ai.service';
import { StatusCodes } from 'http-status-codes';
class AIController {
  async transcribeAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(StatusCodes.NOT_FOUND).json({ 
          error: 'No audio file uploaded' 
        });
        
        return;
      }
      
      const ipAddress = req.ip || req.socket.remoteAddress || null;

      const result = await AIService.updateDeviceState(req.file.path, ipAddress);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();