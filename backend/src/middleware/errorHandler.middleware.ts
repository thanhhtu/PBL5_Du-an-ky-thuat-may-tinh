import {Request, Response, NextFunction} from 'express';
import { errorInfo } from '../service/errorHandler.service';

function errorHandler (
  err: unknown, 
  req: Request, 
  res: Response, 
  next: NextFunction
){
  const { statusError, messageError } = errorInfo(err);
  
  const error = {
    status: statusError,
    error: messageError
  };

  res.status(statusError).json(error);
};

export default errorHandler;