import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool';
import type { User, UserRole } from '../types/user';

const parseRole = (value: unknown): UserRole => {
  if (value instanceof Buffer) {
    const asString = value.toString('utf8').trim();
    const parsed = Number(asString.length ? asString : value[0]);
    return parsed === 1 ? 'admin' : 'user';
  }
  const numeric = Number(value);
  return numeric === 1 ? 'admin' : 'user';
};

const mapRowToUser = (row: RowDataPacket): User => ({
  id: row.user_id,
  fullname: row.fullname,
  email: row.email,
  password: row.password,
  phone: row.phone,
  lineId: row.line_id,
  role: parseRole(row.role),
});

export const userService = {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return null;
    return mapRowToUser(rows[0]);
  },

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE user_id = ?', [id]);
    if (!rows.length) return null;
    return mapRowToUser(rows[0]);
  },

  async createUser(data: {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    lineId?: string;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const [result] = await pool.query(
      'INSERT INTO users (fullname, email, password, phone, line_id, role, create_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [data.fullname, data.email, data.password, data.phone ?? null, data.lineId ?? null, 0],
    );

    const insertedId = (result as { insertId: number }).insertId;
    const user = await this.findById(insertedId);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  },
};
