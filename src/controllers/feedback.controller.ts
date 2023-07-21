import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import feedbackService from '@/services/feedback.service';
import { FeedbackListDto } from '@/dtos/feedback.dto';

class FeedbackController {
  public list = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const results: FeedbackListDto[] = await feedbackService.getFeedbackList();
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  };
}

export default FeedbackController;
