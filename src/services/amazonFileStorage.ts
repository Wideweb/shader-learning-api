import { AWS_BUCKET, AWS_ID, AWS_SECRET } from '@/config';
import { logger } from '@utils/logger';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const AWS_REGION = 'eu-west-2';

class AmazonFileStorage {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ID,
        secretAccessKey: AWS_SECRET,
      },
    });
  }

  async get(fileName: string): Promise<Buffer | null> {
    const command = new GetObjectCommand({
      Bucket: `${AWS_BUCKET}`,
      Key: fileName,
    });

    try {
      const output = await this.s3Client.send(command);
      const bytes = await output.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err) {
      logger.warn(`AmazonFileStorage::get | fileName:${fileName}, bucketName:${AWS_BUCKET}, error:${err.message}`);
    }

    return null;
  }

  async save(fileName: string, data: Buffer): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: `${AWS_BUCKET}`,
      Key: fileName,
      Body: data,
    });

    try {
      await this.s3Client.send(command);
      return `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    } catch (err) {
      logger.error(`AmazonFileStorage::save | fileName:${fileName}, bucketName:${AWS_BUCKET}, error:${err.message}`);
    }

    return null;
  }
}

const amazonFileStorage = new AmazonFileStorage();
export default amazonFileStorage;
