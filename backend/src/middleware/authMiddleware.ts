import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpException } from '../utils/httpException';
import type { UserRole } from '../types/user';
import { userService } from '../services/userService';

export interface AuthUser {
  id: number;
  role: UserRole;
  email: string;
  fullname: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

const decodeToken = async (token: string): Promise<AuthUser> => {
  if (!env.auth.jwtSecret) {
    throw new HttpException(500, 'JWT secret not configured');
  }
  const payload = jwt.verify(token, env.auth.jwtSecret) as AuthUser;

  // Ensure user still exists and role is up to date
  const dbUser = await userService.findById(payload.id);
  if (!dbUser) {
    throw new HttpException(401, 'User not found');
  }

  return {
    id: dbUser.id,
    role: dbUser.role,
    email: dbUser.email,
    fullname: dbUser.fullname,
  };
};

const authenticate = async (req: Request) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new HttpException(401, 'Authorization token is required');
  }

  const token = header.replace('Bearer ', '').trim();

  const user = await decodeToken(token);
  req.user = user;
  return user;
};

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    await authenticate(req);
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authenticate(req);
    if (user.role !== 'admin') {
      throw new HttpException(403, 'Forbidden');
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
