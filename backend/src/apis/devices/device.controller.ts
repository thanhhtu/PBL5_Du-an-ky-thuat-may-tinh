import { Request, Response, NextFunction } from 'express';
import { errorHandlerRes } from '../../service/errorHandler.service';
import deviceService from './device.service';
import { StatusCodes } from 'http-status-codes';

class DeviceController{
  async getAllDevices(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
      const devices = await deviceService.getAllDevices();
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: devices,
      });
    }catch(error){
        errorHandlerRes(error, res);
    }
  }

  async getDeviceById(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
      const id = Number(req.params.id);
      const device = await deviceService.getDeviceById(id);
        
      res.status(StatusCodes.OK).json({
        success: true,
        data: device,
      });
    }catch(error){
        errorHandlerRes(error, res);
    }
  }

  async createDevice(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
      const deviceData = req.body;
      const img: Express.Multer.File | undefined = req.file; 
      const device = await deviceService.createDevice(deviceData, img);
        
      res.status(StatusCodes.CREATED).json({
        success: true,
        data: device,
      });
    }catch(error){
        errorHandlerRes(error, res);
    }
  }

  async deleteDevice(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
      const id = Number(req.params.id);
      await deviceService.deleteDevice(id);
      
      res.status(StatusCodes.OK).json({
        success: true
      });
    }catch(error){
        errorHandlerRes(error, res);
    }
  }

  async getDeviceLogs(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
      const id = Number(req.params.id);
      const logs = await deviceService.getDeviceLogs(id);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: logs
      });
    }catch(error){
        errorHandlerRes(error, res);
    }
  }

  async updateDeviceState(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
      const id = Number(req.params.id);
      const { state } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || null;

      const updateDevice = await deviceService.updateDeviceState(id, state, ipAddress);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: updateDevice
      });
    }catch(error){
        errorHandlerRes(error, res);
    }
  }
}

export default new DeviceController();