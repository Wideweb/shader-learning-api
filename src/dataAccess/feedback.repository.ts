import dbConnection from './db-connection';
import { FeedbackListModel } from './models/feedback.model';

export class FeedbackRepository {
  public async getModuleList(): Promise<FeedbackListModel[]> {
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
  }
}

const feedbackRepository = new FeedbackRepository();
export default feedbackRepository;
