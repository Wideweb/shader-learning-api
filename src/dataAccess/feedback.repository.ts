import { logger } from '@/utils/logger';
import dbConnection from './db-connection';
import { FeedbackListModel } from './models/feedback.model';

export class FeedbackRepository {
  public async getAll(): Promise<FeedbackListModel[]> {
    try {
      const result = await dbConnection.query<FeedbackListModel>(
        `
      SELECT
        Feedback.Id,
        Feedback.AuthorName,
        Feedback.AuthorTitle,
        Feedback.Message,
        Feedback.Order
      FROM Feedback
      ORDER BY Feedback.Order
      LIMIT 100
    `,
      );
      return result;
    } catch (err) {
      logger.error(`FeedbackRepository::getAll | error: ${err.message}`);
      return null;
    }
  }
}

const feedbackRepository = new FeedbackRepository();
export default feedbackRepository;
