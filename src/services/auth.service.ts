import { genSalt, hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE, BASE_URL } from '@config';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInRefreshToken, DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import userRepository from '@dataAccess/users.repository';
import permissionRepository from '@dataAccess/permissions.repository';
import { UserModel } from '@dataAccess/models/user.model';
import { PasswordMatchException } from '@exceptions/PasswordMatchException';
import { EmailNotUniqueException } from '@exceptions/EmailNotUniqueException';
import { UserNameNotUniqueException } from '@exceptions/UserNameNotUniqueException';
import emailSender from './emailSender';
import { randomUUID } from 'crypto';
import { UserNotFoundException } from '@/exceptions/UserNotFoundException';
import { WrongPasswordResetTokenException } from '@/exceptions/WrongPasswordResetTokenException';
import { UserEmailNotFoundExcrption } from '@/exceptions/UserEmailNotFoundException copy';

class AuthService {
  public async signup(userData: CreateUserDto): Promise<{ tokenData: TokenData; user: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    let findUser: UserModel = await userRepository.findUserByEmail(userData.email);
    if (findUser) throw new EmailNotUniqueException(userData.email);

    findUser = await userRepository.findUserByName(userData.name);
    if (findUser) throw new UserNameNotUniqueException(userData.name);

    const passwordSalt = await genSalt();
    const passwordHashed = await hash(userData.password, passwordSalt);
    const isUserCreated = await userRepository.createUser({
      Id: null,
      UserName: userData.name,
      Email: userData.email,
      Password: passwordHashed,
      PasswordSalt: passwordSalt,
      FailedLoginAttemptsCount: 0,
      ResetPasswordToken: null,
      Role_Id: 2,
    });

    if (!isUserCreated) throw new HttpException(500, `User is not created`);

    const createdUser = await userRepository.findUserByEmail(userData.email);
    if (!createdUser) throw new HttpException(500, `User with Email ${userData.email} is not created`);

    const permissions = await this.getPermissions(createdUser.Id);
    const tokenData = await this.createSession(createdUser, permissions);

    const user: User = {
      id: createdUser.Id,
      name: createdUser.UserName,
      email: createdUser.Email,
      roleId: createdUser.Role_Id,
      permissions,
    };

    return { tokenData, user };
  }

  public async login(userData: LoginUserDto): Promise<{ tokenData: TokenData; user: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: UserModel = await userRepository.findUserByEmail(userData.email);
    if (!findUser) throw new UserEmailNotFoundExcrption(userData.email);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.Password);
    if (!isPasswordMatching) throw new PasswordMatchException();

    const permissions = await this.getPermissions(findUser.Id);
    const tokenData = await this.createSession(findUser, permissions);

    const user: User = {
      id: findUser.Id,
      name: findUser.UserName,
      email: findUser.Email,
      roleId: findUser.Role_Id,
      permissions,
    };

    return { tokenData, user };
  }

  public async sendPasswordResetLink(email: string): Promise<void> {
    const findUser: UserModel = await userRepository.findUserByEmail(email);
    if (!findUser) return;

    const token = randomUUID();
    await userRepository.setResetPasswordToken(findUser.Id, token);

    const resetUrl = `${BASE_URL}/password-reset/${findUser.Id}/${token}`;
    await emailSender.send(findUser.Email, 'Password reset', resetUrl);
  }

  public async resetPassword(userId: number, token: string, password: string): Promise<{ tokenData: TokenData; user: User }> {
    const findUser: UserModel = await userRepository.findUserById(userId);
    if (!findUser) throw new UserNotFoundException(userId);

    if (findUser.ResetPasswordToken != token) throw new WrongPasswordResetTokenException(userId, token);

    findUser.PasswordSalt = await genSalt();
    findUser.Password = await hash(password, findUser.PasswordSalt);

    await userRepository.setPassword(userId, findUser.Password, findUser.PasswordSalt);
    await userRepository.invalidateUserSessions(userId);

    const permissions = await this.getPermissions(findUser.Id);
    const tokenData = await this.createSession(findUser, permissions);

    const user: User = {
      id: findUser.Id,
      name: findUser.UserName,
      email: findUser.Email,
      roleId: findUser.Role_Id,
      permissions,
    };

    return { tokenData, user };
  }

  public async logout(sessionId: number): Promise<void> {
    if (!sessionId) throw new HttpException(400, 'no user session');
    userRepository.finishUserSession(sessionId);
  }

  public async decodeAccessToken(accessToken: string): Promise<DataStoredInToken> {
    const tokenData = (await verify(accessToken, ACCESS_TOKEN_SECRET)) as DataStoredInToken;
    return tokenData;
  }

  private async createSession(user: UserModel, permissions: string[]): Promise<TokenData> {
    const sessionId = await userRepository.createUserSession(user.Id, null);

    const accessToken = this.createAccessToken(user, permissions, sessionId);
    const refreshToken = this.createRefreshToken(user, sessionId);

    await userRepository.setRefreshToken(sessionId, refreshToken.token);

    return {
      accessToken: accessToken.token,
      accessTokenLife: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenLife: refreshToken.expiresIn,
    };
  }

  public async refreshAccessToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    if (isEmpty(refreshToken)) {
      throw new HttpException(400, 'invalid refreshToken');
    }

    const verificationResponse = (await verify(refreshToken, REFRESH_TOKEN_SECRET)) as DataStoredInToken;
    const userId = verificationResponse.id;
    const sessionId = verificationResponse.sessionId;
    const findSession = await userRepository.findUserSession(sessionId);

    if (isEmpty(findSession) || findSession.RefreshToken != refreshToken) {
      throw new HttpException(400, 'invalid refreshToken');
    }

    if (findSession.FinishedAt != null) {
      throw new HttpException(400, 'session is finished');
    }

    const findUser = await userRepository.findUserById(userId);
    const permissions = await this.getPermissions(userId);

    const accessToken = this.createAccessToken(findUser, permissions, sessionId);
    return accessToken;
  }

  private createAccessToken(user: UserModel, permissions: string[], sessionId: number): { token: string; expiresIn: number } {
    const storedData: DataStoredInToken = { id: user.Id, permissions, sessionId };
    const secret: string = ACCESS_TOKEN_SECRET;
    const expiresIn = Number.parseInt(ACCESS_TOKEN_LIFE);

    return {
      token: sign(storedData, secret, { expiresIn }),
      expiresIn,
    };
  }

  private createRefreshToken(user: UserModel, sessionId: number): { token: string; expiresIn: number } {
    const storedData: DataStoredInRefreshToken = { id: user.Id, sessionId };
    const secret: string = REFRESH_TOKEN_SECRET;
    const expiresIn = Number.parseInt(REFRESH_TOKEN_LIFE);

    return {
      token: sign(storedData, secret, expiresIn > 0 ? { expiresIn } : null),
      expiresIn,
    };
  }

  public createCookie(token: string, expiresIn: number): string {
    return `Authorization=${token}; HttpOnly; Max-Age=${expiresIn};`;
  }

  private async getPermissions(userId: number): Promise<string[]> {
    const userPermissions = await permissionRepository.getUserAndRolePermissions(userId);
    return userPermissions.map(p => p.Name);

    // if (roleId == 1) {
    //   return [
    //     'profile_view',
    //     'users_rating',
    //     'task_view',
    //     'task_submit',
    //     'task_create',
    //     'task_edit',
    //     'task_edit_all',
    //     'task_visibility',
    //     'task_delete',
    //     'task_reorder',
    //     'module_create',
    //     'module_view',
    //     'module_edit',
    //     'module_edit_all',
    //   ];
    // }

    // return ['profile_view', 'users_rating', 'task_view', 'task_submit', 'module_view'];
  }
}

const authService = new AuthService();
export default authService;
