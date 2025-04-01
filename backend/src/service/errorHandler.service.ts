import { Response } from 'express';
import { StatusCodes } from "http-status-codes";
import CustomError from "./customError.service";
import Joi from 'joi';

let errorHandlerRes = (error: unknown, res: Response) => {
  console.error('Error caught in errorHandlerRes:', error); // Thêm log chi tiết

  if (error instanceof Joi.ValidationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: error.message,
    });
  }else if(error instanceof CustomError){
    return res.status(error.status).json({
      success: false,
      error: error.message,
    });
  }else if(error instanceof Error){
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ //400
      success: false,
      error: error.message,
    });
  }else{
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
}

function errorInfo(error: unknown){
  let messageError: string;
  let statusError:number;

  if(error instanceof CustomError){
    statusError = error.status;
    messageError = error.message;
  }else if(error instanceof Error){
    statusError = StatusCodes.INTERNAL_SERVER_ERROR;
    messageError = error.message;
  }else{
    statusError = StatusCodes.INTERNAL_SERVER_ERROR;
    messageError = "Internal Server Error";
  }

  return { statusError, messageError }
}

async function errorHandlerFunc<T>(func: (() => Promise<T>)): Promise<T> {
  try {
    return await func();
  } catch (error) {
    const { statusError, messageError } = errorInfo(error);
    throw new CustomError(statusError, messageError);
  }
}

export { 
  errorHandlerRes, 
  errorInfo, 
  errorHandlerFunc 
};