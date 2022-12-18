import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public name: string;

  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}

export class LoginUserDto {
  @IsString()
  public name: string;

  @IsString()
  public password: string;
}
