import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpException } from '../utils/httpException';
import { userService } from '../services/userService';
import type { UserRole } from '../types/user';

const signToken = (payload: { id: number; role: UserRole; email: string; fullname: string }) => {
  if (!env.auth.jwtSecret) {
    throw new HttpException(500, 'JWT secret is not configured');
  }

  return jwt.sign(payload, env.auth.jwtSecret, {
    expiresIn: env.auth.tokenExpiresIn,
  });
};

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string };

    const user = await userService.findByEmail(email);
    if (!user || user.password !== password) {
      throw new HttpException(401, 'Invalid email or password');
    }

    const token = signToken({ id: user.id, role: user.role, email: user.email, fullname: user.fullname });
    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        lineId: user.lineId,
        role: user.role,
      },
    });
  },

  async register(req: Request, res: Response) {
    const { fullname, email, password, phone, lineId } = req.body as {
      fullname: string;
      email: string;
      password: string;
      phone?: string;
      lineId?: string;
    };

    try {
      const user = await userService.createUser({ fullname, email, password, phone, lineId });
      const token = signToken({ id: user.id, role: user.role, email: user.email, fullname: user.fullname });
      res.status(201).json({
        token,
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          lineId: user.lineId,
          role: user.role,
        },
      });
    } catch (error) {
      throw new HttpException(400, (error as Error).message);
    }
  },

  async me(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      throw new HttpException(401, 'Unauthorized');
    }
    const user = await userService.findById(userId);
    if (!user) {
      throw new HttpException(404, 'User not found');
    }
    res.json({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      lineId: user.lineId,
      role: user.role,
    });
  },
};
