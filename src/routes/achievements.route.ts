import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { authMiddleware } from '@/middlewares/auth.middleware';
import AchievementsController from '@/controllers/achievements.controller';

class AchievementsRoute implements Routes {
  public path = '/achievements';
  public router = Router();
  public controller = new AchievementsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/completed`, authMiddleware, this.controller.completed);
    this.router.get(`${this.path}/unviewed`, authMiddleware, this.controller.unviewed);
    this.router.put(`${this.path}/:id/view`, authMiddleware, this.controller.view);
  }
}

export default AchievementsRoute;
