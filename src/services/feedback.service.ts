import feedbackRepository from '@/dataAccess/feedback.repository';
import { FeedbackListDto } from '@/dtos/feedback.dto';

class FeedbackService {
  public async getFeedbackList(): Promise<FeedbackListDto[]> {
    const feedbacks = await feedbackRepository.getModuleList();

    return feedbacks.map(item => ({
      authorName: item.AuthorName,
      authorTitle: item.AuthorTitle,
      message: item.Message,
    }));
  }
}

const feedbackService = new FeedbackService();
export default feedbackService;
