import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpException } from '../utils/httpException';

interface AdminTokenPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpException(401, 'Authorization token is required'));
  }

  if (!env.auth.jwtSecret) {
    return next(new HttpException(500, 'Admin authentication is not configured'));
  }

  const token = header.replace('Bearer ', '').trim();

  try {
    const decoded = jwt.verify(token, env.auth.jwtSecret) as AdminTokenPayload;
    if (decoded.role !== 'admin') {
      throw new HttpException(403, 'Insufficient permissions');
    }
    return next();
  } catch (error) {
    return next(new HttpException(401, 'Invalid or expired token'));
  }
};
