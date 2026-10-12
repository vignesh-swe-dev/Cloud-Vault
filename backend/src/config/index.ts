import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '5000'), 10),
  isDev: optional('NODE_ENV', 'development') === 'development',

  mongodb: {
    uri: required('MONGODB_URI'),
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpires: optional('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpires: optional('JWT_REFRESH_EXPIRES', '7d'),
  },

  storage: {
    provider: optional('STORAGE_PROVIDER', 'local') as 'local' | 's3',
    localUploadDir: optional('LOCAL_UPLOAD_DIR', './uploads'),
    s3: {
      bucket: optional('S3_BUCKET', ''),
      region: optional('S3_REGION', 'us-east-1'),
      accessKeyId: optional('S3_ACCESS_KEY_ID', ''),
      secretAccessKey: optional('S3_SECRET_ACCESS_KEY', ''),
      endpoint: process.env['S3_ENDPOINT'],
    },
  },

  email: {
    host: optional('SMTP_HOST', ''),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('EMAIL_FROM', 'noreply@cloudvault.app'),
  },

  quotas: {
    defaultStorageQuota: parseInt(
      optional('DEFAULT_STORAGE_QUOTA', String(5 * 1024 * 1024 * 1024)),
      10,
    ),
  },

  cors: {
    origin: optional('CORS_ORIGIN', 'http://localhost:5173'),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
    authMax: parseInt(optional('AUTH_RATE_LIMIT_MAX', '10'), 10),
  },
};
