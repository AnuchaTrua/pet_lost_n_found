import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpException } from '../utils/httpException';

export const authController = {
  login(req: Request, res: Response) {
    const { username, password } = req.body as { username: string; password: string };

    if (!env.auth.adminUsername || !env.auth.adminPassword || !env.auth.jwtSecret) {
      throw new HttpException(500, 'Admin authentication is not configured');
    }

    const isValid = username === env.auth.adminUsername && password === env.auth.adminPassword;
    if (!isValid) {
      throw new HttpException(401, 'Invalid username or password');
    }

    const token = jwt.sign({ role: 'admin' }, env.auth.jwtSecret, {
      expiresIn: env.auth.tokenExpiresIn,
    });

    res.json({ token });
  },
};
