import { AWS_BUCKET, AWS_ID, AWS_SECRET } from '@/config';
import AWS from 'aws-sdk';
import { logger } from '@utils/logger';
import { Utils } from './utils';

class AmazonFileStorage {
  private s3Client: AWS.S3;

  constructor() {
    this.s3Client = new AWS.S3({
      accessKeyId: AWS_ID,
      secretAccessKey: AWS_SECRET,
    });
  }

  async get(directory: string, fileName: string): Promise<Buffer | null> {
    const options: AWS.S3.Types.GetObjectRequest = {
      Bucket: `${AWS_BUCKET}/${directory}`,
      Key: fileName,
    };

    try {
      const buffer = await Utils.streamToBuffer(this.s3Client.getObject(options).createReadStream());
      return buffer;
    } catch (err) {
      logger.error(`Failed to load file | fileName:${fileName}, directory:${directory}, bucketName:${AWS_BUCKET}, error:${err.message}`);
    }

    return null;
  }

  async save(directory: string, fileName: string, data: AWS.S3.Body): Promise<string> {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: `${AWS_BUCKET}/${directory}`,
      Key: fileName,
      Body: data,
    };

    try {
      const result = await this.s3Client.upload(params).promise();
      return result.Location;
    } catch (err) {
      logger.error(`Failed to upload file | fileName:${fileName}, directory:${directory}, bucketName:${AWS_BUCKET}, error:${err.message}`);
    }

    return null;
  }
}

const amazonFileStorage = new AmazonFileStorage();
export default amazonFileStorage;
