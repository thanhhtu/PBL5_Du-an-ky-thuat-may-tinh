import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { errorInfo } from '../providers/errorHandler.provider';

function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { statusError, messageError } = errorInfo(err);

  const error = {
    status: statusError || StatusCodes.INTERNAL_SERVER_ERROR,
    message: messageError || 'Internal Server Error',
    stack: err instanceof Error ? err.stack : undefined,
  };

  res.status(statusError).json(error);
}

export default errorHandler;
