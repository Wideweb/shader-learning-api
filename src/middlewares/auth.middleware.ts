import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import userService from '@services/users.service';
import authService from '@/services/auth.service';

const permissionMiddleware = (prmissions: string[], all: boolean) => async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (!Authorization) {
      next(new HttpException(403, 'Authentication token missing'));
    }

    const tokenData = authService.decodeAccessToken(Authorization);
    const findUser = await userService.findUserById((await tokenData).id);

    if (!findUser) {
      next(new HttpException(401, 'Wrong authentication token'));
      return;
    }

    findUser.permissions = authService.getPermissions(findUser.roleId);

    if (prmissions && prmissions.length > 0) {
      if (all && !prmissions.every(p => findUser.permissions.includes(p))) {
        next(new HttpException(403, 'No Permissions'));
        return;
      }

      if (!all && !prmissions.some(p => findUser.permissions.includes(p))) {
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
const hasAnyPermissions = (prmissions: string[]) => permissionMiddleware(prmissions, false);
const hasAllPermissions = (prmissions: string[]) => permissionMiddleware(prmissions, true);

export { authMiddleware, hasAnyPermissions, hasAllPermissions };
