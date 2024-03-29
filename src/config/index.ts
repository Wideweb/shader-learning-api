import { config } from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const {
  NODE_ENV,
  PORT,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_LIFE,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_LIFE,
  LOG_FORMAT,
  LOG_DIR,
  ORIGIN,
  AWS_ID,
  AWS_SECRET,
  AWS_BUCKET,
  TEMP_FOLDER,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  BASE_URL,
  GOOGLE_OAUTH_CLIENT_ID,
} = process.env;
