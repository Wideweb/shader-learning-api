import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public name: string;

  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsOptional()
  public ref: string;
}

export class GoogleLoginDto {
  @IsString()
  public token: string;

  @IsOptional()
  public ref: string;
}

export class LoginUserDto {
  @IsString()
  public email: string;

  @IsString()
  public password: string;
}

export interface UserRankedListDto {
  id: number;

  name: string;

  rank: number;

  solved: number;
}

export interface UserProfileDto {
  id: number;

  name: string;

  rank: number;

  solved: number;
}

export class RequestResetPasswordDto {
  @IsEmail()
  public email: string;
}

export class ResetPasswordDto {
  @IsNumber()
  public userId: number;

  @IsString()
  public token: string;

  @IsString()
  public password: string;
}
