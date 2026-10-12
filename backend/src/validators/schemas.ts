import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().nullable().optional(),
});

export const renameFolderSchema = z.object({
  name: z.string().min(1).max(255),
});

export const moveFolderSchema = z.object({
  parentId: z.string().nullable(),
});

export const renameFileSchema = z.object({
  name: z.string().min(1).max(255),
});

export const moveFileSchema = z.object({
  folderId: z.string().nullable(),
});

export const createShareSchema = z.object({
  fileId: z.string().min(1),
  password: z.string().min(1).max(128).optional(),
  expiresAt: z.string().datetime().optional(),
  allowDownload: z.boolean().optional().default(true),
});

export const verifySharePasswordSchema = z.object({
  password: z.string().min(1),
});

export const bulkDeleteSchema = z.object({
  fileIds: z.array(z.string()).min(1),
});

export const fileContentSchema = z.object({
  content: z.string(),
  lastModified: z.string().datetime().optional(),
});
