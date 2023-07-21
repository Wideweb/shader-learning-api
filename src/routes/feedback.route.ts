import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import FeedbackController from '@/controllers/feedback.controller';

class FeedbackRoute implements Routes {
  public path = '/feedback';
  public router = Router();
  public controller = new FeedbackController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/list`, this.controller.list);
  }
}

export default FeedbackRoute;
