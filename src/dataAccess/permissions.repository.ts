import { logger } from '@/utils/logger';
import dbConnection from './db-connection';
import { PermissionModel } from './models/permission.model';

export class PermissionRepository {
  public async getUserPermissions(userId: number): Promise<PermissionModel[]> {
    try {
      const result = await dbConnection.query<PermissionModel>(
        `
      SELECT Permissions.Id, Permissions.Name
      FROM UserPermissions 
      INNER JOIN Permissions ON UserPermissions.Permission_Id = Permissions.Id
      WHERE UserPermissions.User_Id = :userId
    `,
        { userId },
      );
      return result;
    } catch (err) {
      logger.error(`PermissionRepository::getUserPermissions | userId:${userId}; error: ${err.message}`);
      return [];
    }
  }

  public async getRolePermissions(roleId: number): Promise<PermissionModel[]> {
    try {
      const result = await dbConnection.query<PermissionModel>(
        `
      SELECT Permissions.Id, Permissions.Name
      FROM RolePermissions 
      INNER JOIN Permissions ON RolePermissions.Permission_Id = Permissions.Id
      WHERE RolePermissions.Role_Id = :roleId
    `,
        { roleId },
      );
      return result;
    } catch (err) {
      logger.error(`PermissionRepository::getRolePermissions | roleId:${roleId}; error: ${err.message}`);
      return [];
    }
  }

  public async getUserAndRolePermissions(userId: number): Promise<PermissionModel[]> {
    try {
      const result = await dbConnection.query<PermissionModel>(
        `
      SELECT Permissions.Id, Permissions.Name
      FROM UserPermissions 
      INNER JOIN Permissions ON Permissions.Id = UserPermissions.Permission_Id
      WHERE UserPermissions.User_Id = :userId

      UNION

      SELECT Permissions.Id, Permissions.Name
      FROM Users
      INNER JOIN RolePermissions ON RolePermissions.Role_Id = Users.Role_Id
      INNER JOIN Permissions ON Permissions.Id = RolePermissions.Permission_Id
      WHERE Users.Id = :userId
    `,
        { userId },
      );
      return result;
    } catch (err) {
      logger.error(`PermissionRepository::getUserAndRolePermissions | userId:${userId}; error: ${err.message}`);
      return [];
    }
  }
}

const permissionRepository = new PermissionRepository();
export default permissionRepository;
