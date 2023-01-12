import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import userService from '@services/users.service';
import authService from '@/services/auth.service';

const permissionMiddleware = (permissions: string[], all: boolean) => async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (!Authorization) {
      next(new HttpException(403, 'Authentication token missing'));
    }

    const tokenData = await authService.decodeAccessToken(Authorization);
    const findUser = await userService.findUserById(tokenData.id);

    if (!findUser) {
      next(new HttpException(401, 'Wrong authentication token'));
      return;
    }

    findUser.permissions = tokenData.permissions;

    if (permissions && permissions.length > 0) {
      if (all && !permissions.every(p => findUser.permissions.includes(p))) {
        next(new HttpException(403, 'No Permissions'));
        return;
      }

      if (!all && !permissions.some(p => findUser.permissions.includes(p))) {
        next(new HttpException(403, 'No Permissions'));
        return;
      }
    }

    req.user = findUser;
    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token'));
  }
};

const authMiddleware = permissionMiddleware([], false);
const hasAnyPermissions = (permissions: string[]) => permissionMiddleware(permissions, false);
const hasAllPermissions = (permissions: string[]) => permissionMiddleware(permissions, true);

export { authMiddleware, hasAnyPermissions, hasAllPermissions };
