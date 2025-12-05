import dotenv from 'dotenv';
import type { StringValue } from 'ms';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const requiredVars = ['PORT', 'MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE', 'JWT_SECRET'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[env] Missing environment variable: ${key}`);
  }
});

const r2Config = {
  endpoint: process.env.R2_ENDPOINT ?? '',
  region: process.env.R2_REGION ?? 'auto',
  bucket: process.env.R2_BUCKET ?? '',
  accessKeyId: process.env.ACCESS_KEY_ID ?? '',
  secretAccessKey: process.env.SECRET_ACCESS_KEY ?? '',
  prefix: process.env.R2_PREFIX ?? '',
  useObjectAcl: (process.env.R2_USE_OBJECT_ACL ?? 'false') === 'true',
  objectAcl: process.env.R2_OBJECT_ACL ?? 'public-read',
  publicBaseUrl: process.env.R2_PUBLIC_BASE_URL ?? '',
  signedUrlExpiresIn: Number(process.env.R2_SIGNED_URL_EXPIRES_IN ?? '3600'),
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 4000,
  mysql: {
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'lost_pet_finder',
    ssl: (process.env.MYSQL_SSL ?? 'true') !== 'false',
    sslRejectUnauthorized: (process.env.MYSQL_SSL_REJECT_UNAUTHORIZED ?? 'true') !== 'false',
  },
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  r2: r2Config,
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? '',
    tokenExpiresIn: ((process.env.ADMIN_TOKEN_EXPIRES_IN as StringValue | undefined) ?? '12h') as StringValue,
  },
};
