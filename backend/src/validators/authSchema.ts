import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  fullname: z.string().min(2).max(255),
  email: z.string().email('Invalid email'),
  password: z.string().min(6).max(16),
  phone: z.string().max(10).optional(),
  lineId: z.string().max(45).optional(),
});
