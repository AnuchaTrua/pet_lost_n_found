import { randomBytes } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  ObjectCannedACL,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
const normalizeKey = (value: string) => {
  if (!value) return '';
  if (!value.startsWith('http')) return value.replace(/^\//, '');
  try {
    const url = new URL(value);
    return url.pathname.replace(/^\//, '');
  } catch {
    return value;
  }
};

export const storageService = {
  async uploadPetPhoto(file: Express.Multer.File) {
    if (!env.aws.bucket || !env.aws.region) {
      throw new Error('S3 bucket/region not configured');
    }

    const unique = randomBytes(8).toString('hex');
    const baseName = sanitizeFileName(file.originalname || 'photo');
    const key = `${env.aws.prefix ? `${env.aws.prefix.replace(/\/?$/, '/')}` : ''}pets/${unique}-${baseName}`;

    const baseParams: PutObjectCommandInput = {
      Bucket: env.aws.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const shouldApplyAcl = env.aws.useObjectAcl && env.aws.objectAcl;
    const params: PutObjectCommandInput = shouldApplyAcl
      ? { ...baseParams, ACL: env.aws.objectAcl as ObjectCannedACL }
      : baseParams;

    try {
      await s3.send(new PutObjectCommand(params));
    } catch (error) {
      const code = (error as any)?.Code ?? (error as any)?.name;

      if (shouldApplyAcl && code === 'AccessControlListNotSupported') {
        console.warn('Bucket does not support ACLs; retrying upload without ACL');
        await s3.send(new PutObjectCommand({ ...baseParams }));
      } else {
        throw error;
      }
    }

    return key;
  },

  async getPublicUrl(storedPath: string | null) {
    if (!storedPath) return null;
    const key = normalizeKey(storedPath);

    if (env.aws.publicBaseUrl) {
      const base = env.aws.publicBaseUrl.replace(/\/$/, '');
      return `${base}/${key}`;
    }

    if (env.aws.bucket && env.aws.region) {
      try {
        return await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: env.aws.bucket,
            Key: key,
          }),
          {
            expiresIn: env.aws.signedUrlExpiresIn || 3600,
          },
        );
      } catch (error) {
        // If signing fails, fall through to return the stored path
        console.warn('Failed to sign S3 URL', error);
      }
    }

    return storedPath;
  },
};
