import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { RefreshToken } from '../models/RefreshToken';
import { Types } from 'mongoose';

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires as any,
  });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d

  await RefreshToken.create({ userId: new Types.ObjectId(userId), tokenHash, expiresAt });
  return token;
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
