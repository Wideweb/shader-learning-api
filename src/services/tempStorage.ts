import { TEMP_FOLDER } from '@/config';
import { logger } from '@utils/logger';
import fs from 'fs';
import path from 'path';

class TempStorage {
  get(fileName: string): Promise<Buffer | null> {
    const toFilePath = path.resolve(TEMP_FOLDER, fileName);

    return new Promise((resolve, reject) => {
      fs.readFile(toFilePath, (error, data) => {
        if (error) {
          logger.error(`TempStorage::get | fileName: ${fileName}; error: ${error.message}`);
          reject(error);
          return;
        }

        resolve(data);
      });
    });
  }

  remove(fileName: string): Promise<void> {
    const toFilePath = path.resolve(TEMP_FOLDER, fileName);

    return new Promise((resolve, reject) => {
      fs.unlink(toFilePath, error => {
        if (error) {
          logger.error(`TempStorage::remove | fileName: ${fileName}; | error: ${error.message}`);
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

const tempStorage = new TempStorage();
export default tempStorage;
