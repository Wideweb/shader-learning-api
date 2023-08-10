import { OAuth2Client } from 'google-auth-library';
import authService from './auth.service';
import { genSalt, hash } from 'bcrypt';
import { TokenData } from '@/interfaces/auth.interface';
import { User } from '@/interfaces/users.interface';
import { UserModel } from '@/dataAccess/models/user.model';
import userRepository from '@/dataAccess/users.repository';
import { HttpException } from '@/exceptions/HttpException';
import { GOOGLE_OAUTH_CLIENT_ID } from '@/config';

class OAuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(GOOGLE_OAUTH_CLIENT_ID);
  }

  public async loginWithGoogle(token: string): Promise<{ tokenData: TokenData; user: User }> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_OAUTH_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    let name = payload.name;

    let findUser: UserModel = await userRepository.findUserByEmail(email);
    if (!findUser) {
      let userByName = await userRepository.findUserByName(name);
      while (userByName) {
        name = payload.name + Math.round(Math.random() * 1000);
        userByName = await userRepository.findUserByName(name);
      }

      const password = await genSalt();
      const passwordSalt = await genSalt();
      const passwordHashed = await hash(password, passwordSalt);

      const isUserCreated = await userRepository.createUser({
        Id: null,
        UserName: name,
        Email: email,
        Password: passwordHashed,
        PasswordSalt: passwordSalt,
        FailedLoginAttemptsCount: 0,
        ResetPasswordToken: null,
        Role_Id: 2,
      });
      if (!isUserCreated) throw new HttpException(500, `User is not created`);

      findUser = await userRepository.findUserByEmail(email);
    }

    const permissions = await authService.getPermissions(findUser.Id);
    const tokenData = await authService.createSession(findUser, permissions);

    const user: User = {
      id: findUser.Id,
      name: findUser.UserName,
      email: findUser.Email,
      roleId: findUser.Role_Id,
      permissions,
    };

    return { tokenData, user };
  }
}

const oauthService = new OAuthService();
export default oauthService;
