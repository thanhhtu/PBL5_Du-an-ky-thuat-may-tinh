import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { errorHandlerRes } from '../service/errorHandler.service';
import { DeviceState } from '../types/device.enum';

class ValidateMiddleware{
  async createDeviceBody(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validateInput = Joi.object({
        name: Joi.string()
          .pattern(new RegExp('^[a-zA-ZÀ-ỹ0-9\\s]{3,30}$', 'u'))
          .trim()
          .required(),
        
        label: Joi.string()
          .pattern(new RegExp('^[a-zA-ZÀ-ỹ0-9\\s]{3,30}$', 'u'))
          .trim()
          .required(),

        state: Joi.string()
          .trim()
          .valid(...Object.values(DeviceState))
          .optional(),
      })

      await validateInput.validateAsync(req.body, { abortEarly: false });
      
      next();
    } catch (error: unknown) {
      errorHandlerRes(error, res);
    }
  }

  async updateDeviceStateBody(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validateInput = Joi.object({
        state: Joi.string()
          .trim()
          .valid(...Object.values(DeviceState))
          .required(),
      })

      await validateInput.validateAsync(req.body, { abortEarly: false });
      
      next();
    } catch (error: unknown) {
      errorHandlerRes(error, res);
    }
  }
}

export default new ValidateMiddleware();