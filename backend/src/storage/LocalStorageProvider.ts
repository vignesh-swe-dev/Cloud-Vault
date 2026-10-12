import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { config } from '../config';
import { logger } from '../utils/logger';
import {
  IStorageProvider,
  MultipartCompleteOptions,
  MultipartInitOptions,
  UploadOptions,
} from './StorageProvider.interface';

export class LocalStorageProvider implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(config.storage.localUploadDir);
    fs.mkdirSync(this.baseDir, { recursive: true });
    logger.info(`Local storage initialised at ${this.baseDir}`);
  }

  async upload({ key, buffer }: UploadOptions): Promise<void> {
    const filePath = this.resolve(key);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);
  }

  async getDownloadUrl(key: string): Promise<string> {
    // For local dev the backend serves files through /api/local-storage/:key
    return `/api/local-storage/${encodeURIComponent(key)}`;
  }

  async streamObject(key: string): Promise<Readable> {
    const filePath = this.resolve(key);
    return fs.createReadStream(filePath);
  }

  async deleteObject(key: string): Promise<void> {
    const filePath = this.resolve(key);
    try {
      await fs.promises.unlink(filePath);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  // Multipart not needed for local — fall back to regular upload
  async initiateMultipart(_options: MultipartInitOptions): Promise<string> {
    return 'local-multipart-stub';
  }

  async getPartUploadUrl(_key: string, _uploadId: string, _partNumber: number): Promise<string> {
    return '';
  }

  async completeMultipart(_options: MultipartCompleteOptions): Promise<void> {}

  async abortMultipart(_key: string, _uploadId: string): Promise<void> {}

  private resolve(key: string): string {
    // Prevent path traversal
    const resolved = path.resolve(this.baseDir, key);
    if (!resolved.startsWith(this.baseDir)) {
      throw new Error('Path traversal detected');
    }
    return resolved;
  }
}
