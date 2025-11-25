import { randomBytes } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';

const s3 = new S3Client({
  region: env.aws.region,
  credentials: env.aws.accessKeyId && env.aws.secretAccessKey
    ? {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      }
    : undefined,
});

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9.-]/g, '_');

export const storageService = {
  async uploadPetPhoto(file: Express.Multer.File) {
    if (!env.aws.bucket || !env.aws.region) {
      throw new Error('S3 bucket/region not configured');
    }

    const unique = randomBytes(8).toString('hex');
    const baseName = sanitizeFileName(file.originalname || 'photo');
    const key = `${env.aws.prefix ? `${env.aws.prefix.replace(/\/?$/, '/')}` : ''}pets/${unique}-${baseName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: env.aws.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
  },
};
