import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userService from '@services/users.service';
import authService from '@/services/auth.service';

const permissionMiddleware = (prmissions: string[], all: boolean) => async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (!Authorization) {
      next(new HttpException(404, 'Authentication token missing'));
    }

    const secretKey: string = SECRET_KEY;
    const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
    const userId = verificationResponse.id;
    const findUser = await userService.findUserById(userId);

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
