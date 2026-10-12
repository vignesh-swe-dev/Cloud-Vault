import { Request, Response, NextFunction } from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { PasswordResetToken } from '../models/PasswordResetToken';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateSecureToken,
} from '../utils/tokenUtils';
import { createError } from '../middleware/errorHandler';
import { config } from '../config';
import { logger } from '../utils/logger';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: !config.isDev,
  sameSite: 'lax' as const,
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      next(createError('Email already in use', 400));
      return;
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const user = await User.create({ name, email, passwordHash });

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, storageQuota: user.storageQuota, storageUsed: user.storageUsed },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      next(createError('Invalid email or password', 401));
      return;
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = await generateRefreshToken(user._id.toString());

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, storageQuota: user.storageQuota, storageUsed: user.storageUsed },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      await RefreshToken.deleteOne({ tokenHash });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function refreshTokens(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) { next(createError('No refresh token', 401)); return; }

    const tokenHash = hashToken(token);
    const stored = await RefreshToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!stored) { next(createError('Invalid or expired refresh token', 401)); return; }

    await RefreshToken.deleteOne({ _id: stored._id });

    const accessToken = generateAccessToken(stored.userId.toString());
    const newRefreshToken = await generateRefreshToken(stored.userId.toString());

    res.cookie('accessToken', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function me(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, storageQuota: user.storageQuota, storageUsed: user.storageUsed } },
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond 200 to prevent email enumeration
    if (!user) {
      res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
      return;
    }

    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });

    const resetUrl = `${config.cors.origin}/reset-password?token=${token}`;
    logger.info(`[DEV] Password reset link for ${email}: ${resetUrl}`);

    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;
    const tokenHash = hashToken(token);

    const record = await PasswordResetToken.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!record) { next(createError('Invalid or expired reset token', 400)); return; }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await User.findByIdAndUpdate(record.userId, { passwordHash });
    await PasswordResetToken.deleteOne({ _id: record._id });
    await RefreshToken.deleteMany({ userId: record.userId });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    next(err);
  }
}
