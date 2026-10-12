import { config } from '../config';
import { IStorageProvider } from './StorageProvider.interface';
import { LocalStorageProvider } from './LocalStorageProvider';
import { S3StorageProvider } from './S3StorageProvider';

let instance: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (!instance) {
    if (config.storage.provider === 's3') {
      instance = new S3StorageProvider();
    } else {
      instance = new LocalStorageProvider();
    }
  }
  return instance;
}
