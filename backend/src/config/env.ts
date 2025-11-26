import dotenv from 'dotenv';
import type { StringValue } from 'ms';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const requiredVars = ['PORT', 'MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE', 'JWT_SECRET'];

requiredVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 4000,
  mysql: {
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'lost_pet_finder',
  },
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  aws: {
    region: process.env.AWS_REGION ?? '',
    bucket: process.env.S3_BUCKET ?? '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    prefix: process.env.S3_PREFIX ?? '',
    useObjectAcl: process.env.S3_USE_OBJECT_ACL !== 'false',
    objectAcl: process.env.S3_OBJECT_ACL ?? 'public-read',
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL ?? '',
    signedUrlExpiresIn: Number(process.env.S3_SIGNED_URL_EXPIRES_IN ?? '3600'),
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? '',
    tokenExpiresIn: ((process.env.ADMIN_TOKEN_EXPIRES_IN as StringValue | undefined) ?? '12h') as StringValue,
  },
};
