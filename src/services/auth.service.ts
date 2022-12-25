import { genSalt, hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { CreateUserDto, LoginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
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

  public async logout(userData: User): Promise<User> {
    if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

    const findUser: UserModel = await userRepository.findUserByName(userData.name);
    if (!findUser) throw new UserNameNotFoundExcrption(userData.name);

    const user: User = {
      id: findUser.Id,
      name: findUser.UserName,
      email: findUser.Email,
      roleId: findUser.Role_Id,
      permissions: this.getPermissions(findUser.Role_Id),
    };

    return user;
  }

  public createToken(user: UserModel): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.Id };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }

  public getPermissions(roleId: number): string[] {
    if (roleId == 1) {
      return ['task_view', 'task_submit', 'task_create', 'task_edit', 'task_visibility', 'task_delete', 'task_view_all', 'task_edit_all'];
    }

    return ['task_view', 'task_submit', 'task_create', 'task_edit'];
  }
}

const authService = new AuthService();
export default authService;
