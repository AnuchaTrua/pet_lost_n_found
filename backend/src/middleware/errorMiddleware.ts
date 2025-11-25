import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../utils/httpException';
import { logger } from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpException ? err.status : 500;
  const message = err.message || 'Something went wrong';

  logger.error(message, err);
  res.status(status).json({ message });
};

