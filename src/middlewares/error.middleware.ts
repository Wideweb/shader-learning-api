import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || 'Something went wrong';

    if (status >= 500) {
      logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    } else {
      logger.info(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    }

    res.status(status).json(error);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
