import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { HttpException } from '../utils/httpException';

export const validateBody =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join(', ');
      return next(new HttpException(400, message));
    }
    req.body = parsed.data;
    return next();
  };

