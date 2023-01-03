import { genSalt, hash, compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, ACCESS_TOKEN_LIFE, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_LIFE } from '@config';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInRefreshToken, DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import userRepository from '@dataAccess/users.repository';
import { UserModel } from '@dataAccess/models/user.model';
import { UserNameNotFoundExcrption } from '@exceptions/UserNameNotFoundException';
import { PasswordMatchException } from '@exceptions/PasswordMatchException';
import { EmailNotUniqueException } from '@exceptions/EmailNotUniqueException';
import { UserNameNotUniqueException } from '@exceptions/UserNameNotUniqueException';

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
      Role_Id: 2,
      RefreshToken: null,
    });

    if (!isUserCreated) throw new HttpException(500, `User is not created`);

    const createdUser = await userRepository.findUserByEmail(userData.email);
    if (!createdUser) throw new HttpException(500, `User with Email ${userData.email} is not created`);

    const tokenData = this.createToken(createdUser);
    const user: User = {
      id: createdUser.Id,
      name: createdUser.UserName,
      email: createdUser.Email,
      roleId: createdUser.Role_Id,
      permissions: this.getPermissions(createdUser.Role_Id),
    };

    return { tokenData, user };
  }

  public async login(userData: LoginUserDto): Promise<{ tokenData: TokenData; user: User }> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: UserModel = await userRepository.findUserByName(userData.name);
    if (!findUser) throw new UserNameNotFoundExcrption(userData.name);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.Password);
    if (!isPasswordMatching) throw new PasswordMatchException();

    const tokenData = this.createToken(findUser);
    const user: User = {
      id: findUser.Id,
      name: findUser.UserName,
      email: findUser.Email,
      roleId: findUser.Role_Id,
      permissions: this.getPermissions(findUser.Role_Id),
    };

    return { tokenData, user };
  }

  public async logout(userData: User): Promise<void> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: UserModel = await userRepository.findUserByName(userData.name);
    if (!findUser) throw new UserNameNotFoundExcrption(userData.name);

    userRepository.setRefreshToken(findUser.Id, null);
  }

  public async decodeAccessToken(accessToken: string): Promise<DataStoredInToken> {
    const tokenData = (await verify(accessToken, ACCESS_TOKEN_SECRET)) as DataStoredInToken;
    return tokenData;
  }

  public async refreshAccessToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    const verificationResponse = (await verify(refreshToken, REFRESH_TOKEN_SECRET)) as DataStoredInToken;
    const userId = verificationResponse.id;
    const findUser = await userRepository.findUserById(userId);

    if (isEmpty(findUser) || findUser.RefreshToken != refreshToken) {
      throw new HttpException(400, 'invalid refreshToken');
    }

    const accessToken = this.createAccessToken(findUser);
    return accessToken;
  }

  private createToken(user: UserModel): TokenData {
    const accessToken = this.createAccessToken(user);
    const refreshToken = this.createRefreshToken(user);

    userRepository.setRefreshToken(user.Id, refreshToken.token);

    return {
      accessToken: accessToken.token,
      accessTokenLife: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenLife: refreshToken.expiresIn,
    };
  }

  private createAccessToken(user: UserModel): { token: string; expiresIn: number } {
    const storedData: DataStoredInToken = { id: user.Id };
    const secret: string = ACCESS_TOKEN_SECRET;
    const expiresIn = Number.parseInt(ACCESS_TOKEN_LIFE);

    return {
      token: sign(storedData, secret, { expiresIn }),
      expiresIn,
    };
  }

  private createRefreshToken(user: UserModel): { token: string; expiresIn: number } {
    const storedData: DataStoredInRefreshToken = { id: user.Id };
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

  public getPermissions(roleId: number): string[] {
    if (roleId == 1) {
      return [
        'task_view',
        'task_submit',
        'task_create',
        'task_edit',
        'task_visibility',
        'task_delete',
        'task_reorder',
        'task_view_all',
        'task_edit_all',
        'users-rating',
        'view-profile',
        'module_create',
        'module_view',
        'module_view_all',
        'module_edit',
      ];
    }

    return ['task_view', 'task_submit', 'users-rating', 'view-profile', 'module_view', 'module_view_all'];
  }
}

const authService = new AuthService();
export default authService;
