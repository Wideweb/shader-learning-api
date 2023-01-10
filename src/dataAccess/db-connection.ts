import { logger } from '@/utils/logger';
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '@config';
import { Connection, createConnection } from 'mysql';

class DBConnection {
  private connection: Connection;

  constructor() {
    this.connection = createConnection({
      host: DB_HOST,
      port: Number.parseInt(DB_PORT),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
    });
  }

  connect(): void {
    this.connection.connect(error => {
      if (error) {
        logger.error(`DBConnection|error connecting: ${error.stack}`);
      }
    });
  }

  query<T>(sql: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, (error, results) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(results as T);
      });
    });
  }

  disconnect(): void {
    this.connection.end();
  }
}

const dbConnection = new DBConnection();
export default dbConnection;
