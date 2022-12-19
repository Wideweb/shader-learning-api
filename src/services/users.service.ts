import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { isEmpty } from '@utils/util';
import { UserModel } from '@dataAccess/models/user.model';
import userRepository from '@dataAccess/users.repository';

class UserService {
  public async findUserById(userId: number): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, 'userId is empty');

    const findUser: UserModel = await userRepository.findUserById(userId);
    if (!findUser) throw new HttpException(409, `This userId ${userId} was not found`);

    const user: User = {
      id: findUser.Id,
      name: findUser.UserName,
      email: findUser.Email,
      roleId: findUser.Role_Id,
    };

    return user;
  }
}

const userService = new UserService();
export default userService;

// public async findUserById(userId: string): Promise<User> {
//   if (isEmpty(userId)) throw new HttpException(400, 'UserId is empty');

//   const findUser: UserModel = await this.repository.findUserById(userId);
//   if (!findUser) throw new HttpException(409, "User doesn't exist");

//   return findUser;
// }

// public async createUser(userData: CreateUserDto): Promise<User> {
//   if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

//   const findUser: User = await userModel.findOne({ email: userData.email });
//   if (findUser) throw new HttpException(409, `This email ${userData.email} already exists`);

//   const hashedPassword = await hash(userData.password, 10);
//   const createUserData: User = await userModel.create({ ...userData, password: hashedPassword });

//   return createUserData;
// }

// public async updateUser(userId: string, userData: CreateUserDto): Promise<User> {
//   if (isEmpty(userData)) throw new HttpException(400, 'userData is empty');

//   if (userData.email) {
//     const findUser: User = await userModel.findOne({ email: userData.email });
//     if (findUser && findUser._id != userId) throw new HttpException(409, `This email ${userData.email} already exists`);
//   }

//   if (userData.password) {
//     const hashedPassword = await hash(userData.password, 10);
//     userData = { ...userData, password: hashedPassword };
//   }

//   const updateUserById: User = await userModel.findByIdAndUpdate(userId, { userData });
//   if (!updateUserById) throw new HttpException(409, "User doesn't exist");

//   return updateUserById;
// }

// public async deleteUser(userId: string): Promise<User> {
//   const deleteUserById: User = await userModel.findByIdAndDelete(userId);
//   if (!deleteUserById) throw new HttpException(409, "User doesn't exist");

//   return deleteUserById;
// }
