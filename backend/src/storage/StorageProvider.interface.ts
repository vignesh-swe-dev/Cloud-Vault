import { Readable } from 'stream';

export interface UploadOptions {
  key: string;
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export interface MultipartInitOptions {
  key: string;
  mimeType: string;
}

export interface MultipartCompleteOptions {
  key: string;
  uploadId: string;
  parts: { PartNumber: number; ETag: string }[];
}

export interface IStorageProvider {
  /** Upload a file (simple, for files under threshold) */
  upload(options: UploadOptions): Promise<void>;

  /** Get a short-lived signed download URL */
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /** Stream a file directly (for proxy download) */
  streamObject(key: string): Promise<Readable>;

  /** Delete an object */
  deleteObject(key: string): Promise<void>;

  /** Initiate a multipart upload — returns uploadId */
  initiateMultipart(options: MultipartInitOptions): Promise<string>;

  /** Get a presigned URL for uploading a single part */
  getPartUploadUrl(key: string, uploadId: string, partNumber: number): Promise<string>;

  /** Complete a multipart upload */
  completeMultipart(options: MultipartCompleteOptions): Promise<void>;

  /** Abort a multipart upload */
  abortMultipart(key: string, uploadId: string): Promise<void>;
}
