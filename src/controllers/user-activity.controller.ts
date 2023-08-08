import { NextFunction, Response } from 'express';
import { User } from '@interfaces/users.interface';
import { RequestWithUser } from '@interfaces/auth.interface';
import { UserActivityDto } from '@/dtos/user-activity.dto';
import userActivityService from '@/services/user-activity/user-activity.service';

class UserActivityController {
  public create = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userData: User = req.user;
      const activity: UserActivityDto = req.body;

      const id = await userActivityService.addUserAction(userData.id, activity.type);
      res.status(200).json(id);
    } catch (error) {
      next(error);
    }
  };
}

export default UserActivityController;
