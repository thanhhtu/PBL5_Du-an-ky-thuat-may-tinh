import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

class UrlValidateMiddleware {
  async checkUrl(req: Request, res: Response, next: NextFunction) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      error: 'Invalid URL',
    });
  }

  checkParams(schema: Joi.ObjectSchema) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        await schema.validateAsync(req.params, { abortEarly: false });
        next();
      } catch (error: unknown) {
        next(error);
      }
    };
  }

  id = this.checkParams(
    Joi.object({
      id: Joi.number().integer().optional(),
    })
  );
}

export default new UrlValidateMiddleware();
