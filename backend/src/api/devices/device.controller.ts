import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import deviceService from './device.service';

class DeviceController {
  async getAllDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const devices = await deviceService.getAllDevices();

      res.status(StatusCodes.OK).json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeviceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const device = await deviceService.getDeviceById(id);

      res.status(StatusCodes.OK).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deviceData = req.body;
      const img: Express.Multer.File | undefined = req.file;
      const device = await deviceService.createDevice(deviceData, img);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDevice(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await deviceService.deleteDevice(id);

      res.status(StatusCodes.OK).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLogsByDeviceId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const logs = await deviceService.getLogsByDeviceId(id);

      res.status(StatusCodes.OK).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await deviceService.getAllLogs();

      res.status(StatusCodes.OK).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDeviceState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const { state } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || null;

      const updatedDevice = await deviceService.updateDeviceState(
        id,
        state,
        ipAddress
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: updatedDevice,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAllDevicesState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { state } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || null;

      const updatedDevices = await deviceService.updateAllDeviceState(
        state,
        ipAddress
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: updatedDevices,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeviceController(); 
