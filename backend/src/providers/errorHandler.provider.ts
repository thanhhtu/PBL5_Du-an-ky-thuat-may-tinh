import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import CustomError from './customError.provider';

function errorInfo(error: unknown) {
  let messageError: string;
  let statusError: number;

  if (error instanceof Joi.ValidationError) {
    statusError = StatusCodes.BAD_REQUEST;
    messageError = error.message;
  } else if (error instanceof CustomError) {
    statusError = error.status;
    messageError = error.message;
  } else if (error instanceof Error) {
    statusError = StatusCodes.INTERNAL_SERVER_ERROR;
    messageError = error.message;
  } else {
    statusError = StatusCodes.INTERNAL_SERVER_ERROR;
    messageError = 'Internal Server Error';
  }

  return { statusError, messageError };
}

async function errorHandlerFunc<T>(func: () => Promise<T>): Promise<T> {
  try {
    return await func();
  } catch (error) {
    const { statusError, messageError } = errorInfo(error);
    throw new CustomError(statusError, messageError);
  }
}

export { errorInfo, errorHandlerFunc };
