import { NextFunction, Response } from 'express';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import achievementService from '@/services/user-activity/achievement.service';

class AchievementsController {
  public unviewed = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;

      const achievements = await achievementService.getUserAchievementsUnviewed(userData.id);
      res.status(200).json(achievements);
    } catch (error) {
      next(error);
    }
  };

  public completed = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;

      const achievements = await achievementService.getUserAchievements(userData.id);
      res.status(200).json(achievements);
    } catch (error) {
      next(error);
    }
  };

  public view = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const achievementId: number = parseInt(req.params.id);

      const result = await achievementService.viewUserAchievement(userData.id, achievementId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export default AchievementsController;
