import { logger } from '@/utils/logger';
import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '@config';
import { createPool, Pool } from 'mysql2/promise';

class DBConnection {
  private pool: Pool;

  async create() {
    if (this.pool) {
      return;
    }

    this.pool = createPool({
      host: DB_HOST,
      port: Number.parseInt(DB_PORT),
      database: DB_NAME,
      user: DB_USER,
      password: DB_PASSWORD,
      namedPlaceholders: true,
      waitForConnections: true,
      connectionLimit: 30,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.create();
    } catch (error) {
      logger.error(`DBConnection|error connecting: ${error.stack}`);
    }
  }

  async query<T>(sql: string, values: { [param: string]: any } = undefined): Promise<any> {
    try {
      const result = await this.pool.query(sql, values);
      return result[0] as T;
    } catch (error) {
      logger.error(`DB Error: ${error.code}; `);

      if (error.code == 'PROTOCOL_CONNECTION_LOST') {
        logger.info('DB: RECONNECT');
        await this.connect();
        return this.query(sql, values);
      }

      logger.error(`SQL QUERY: ${sql}`);
      throw error;
    }
  }

  disconnect(): void {
    this.pool.end();
  }
}

const dbConnection = new DBConnection();
export default dbConnection;
