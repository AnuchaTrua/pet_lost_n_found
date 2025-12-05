import { randomBytes } from 'crypto';
import {
  S3Client as R2Client,
  PutObjectCommand,
  PutObjectCommandInput,
  ObjectCannedACL,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';

const storage = env.r2;

let endpointUrl: URL | null = null;
try {
  endpointUrl = storage.endpoint ? new URL(storage.endpoint) : null;
} catch {
  endpointUrl = null;
}

const buildPublicBase = () => {
  const trimmed = storage.publicBaseUrl?.replace(/\/$/, '');
  if (trimmed) {
    try {
      const url = new URL(trimmed);
      return `${url.origin}${url.pathname}`;
    } catch {
      return trimmed;
    }
  }

  if (endpointUrl && storage.bucket) {
    return `${endpointUrl.origin}/${storage.bucket}`;
  }

  return '';
};

const derivedPublicBase = buildPublicBase();
let derivedBasePath = '';
try {
  const parsed = derivedPublicBase ? new URL(derivedPublicBase) : null;
  if (parsed) {
    derivedBasePath = parsed.pathname.replace(/\/+$/, '').replace(/^\//, '');
  }
} catch {
  derivedBasePath = '';
}

const r2Client = new R2Client({
  region: storage.region || 'auto',
  endpoint: storage.endpoint || undefined,
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
  credentials: storage.accessKeyId && storage.secretAccessKey
    ? {
        accessKeyId: storage.accessKeyId,
        secretAccessKey: storage.secretAccessKey,
      }
    : undefined,
});

const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9.-]/g, '_');
const normalizeKey = (value: string) => {
  if (!value) return '';
  const cleaned = value.replace(/\\/g, '/');
  if (!cleaned.startsWith('http')) return cleaned.replace(/^\//, '');
  try {
    const url = new URL(cleaned);
    return url.pathname.replace(/^\//, '');
  } catch {
    return cleaned.replace(/^\//, '');
  }
};

export const storageService = {
  async uploadPetPhoto(file: Express.Multer.File) {
    if (!storage.bucket) {
      throw new Error('Storage bucket not configured');
    }

    const unique = randomBytes(8).toString('hex');
    const baseName = sanitizeFileName(file.originalname || 'photo');
    const key = `${storage.prefix ? `${storage.prefix.replace(/\/?$/, '/')}` : ''}pets/${unique}-${baseName}`;

    const params: PutObjectCommandInput = {
      Bucket: storage.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    if (storage.useObjectAcl && storage.objectAcl) {
      params.ACL = storage.objectAcl as ObjectCannedACL;
    }

    try {
      console.info('[r2] uploading', { key, bucket: storage.bucket, endpoint: storage.endpoint, region: storage.region });
      const result = await r2Client.send(new PutObjectCommand(params));
      console.info('[r2] upload success', { key, requestId: result.$metadata.requestId, httpStatus: result.$metadata.httpStatusCode });
    } catch (error: unknown) {
      const err = error as Record<string, unknown>;
      console.error('[r2] upload failed', {
        key,
        bucket: storage.bucket,
        endpoint: storage.endpoint,
        region: storage.region,
        code: err?.Code || err?.name,
        message: err?.message,
        httpStatus: err?.$metadata && (err.$metadata as Record<string, unknown>).httpStatusCode,
      });
      throw error;
    }

    return key;
  },

  async getPublicUrl(storedPath: string | null) {
    if (!storedPath) return null;
    let key = normalizeKey(storedPath);

    if (derivedPublicBase) {
      const base = derivedPublicBase.replace(/\/$/, '');
      return `${base}/${key}`;
    }

    if (storage.bucket) {
      try {
        return await getSignedUrl(
          r2Client,
          new GetObjectCommand({
            Bucket: storage.bucket,
            Key: key,
          }),
          {
            expiresIn: storage.signedUrlExpiresIn || 3600,
          },
        );
      } catch (error) {
        // If signing fails, fall through to return the stored path
        console.warn('Failed to sign storage URL', {
          key,
          bucket: storage.bucket,
          endpoint: storage.endpoint,
          region: storage.region,
          message: (error as Error)?.message,
        });
      }
    }

    return storedPath;
  },
};
