import {StatusCodes} from 'http-status-codes';
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { errorHandlerRes } from '../service/errorHandler.service';

class UrlValidateMiddleware {
  async checkUrl(req: Request, res: Response, next: NextFunction){
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      error: 'Invalid URL',
    })
  }

  checkParams(schema: Joi.ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await schema.validateAsync(req.params, { abortEarly: false });
        next();
      } catch (error: unknown) {
        errorHandlerRes(error, res);
      }
    };
  }

  id = this.checkParams(
    Joi.object({
      id: Joi.number().integer().optional()
    })
  );
}

export default new UrlValidateMiddleware()