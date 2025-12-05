import mysql from 'mysql2/promise';
import { env } from '../config/env';

export const pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  connectionLimit: 10,
  ssl: env.mysql.ssl
    ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: env.mysql.sslRejectUnauthorized,
      }
    : undefined,
});
