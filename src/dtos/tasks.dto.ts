import { IsNumber, IsString } from 'class-validator';

export class TaskDto {
  id: number;

  vertexShader: string;

  fragmentShader: string;

  hints: TaskHintDto[];

  restrictions: TaskRestrictionDto[];

  order: number;

  cost: number;

  threshold: number;
}

export class TaskHintDto {
  message: string;

  cost: number;

  order: number;
}

export class TaskRestrictionDto {
  cost: number;

  instruction: string;
}

export class TaskSubmitResultDto {
  match: number;

  score: number;

  accepted: boolean;
}

export class TaskSubmitWithValidationDto {
  @IsNumber()
  id: number;

  @IsString()
  vertexShader: string;

  @IsString()
  fragmentShader: string;
}

export class TaskSubmitDto {
  @IsNumber()
  id: number;

  @IsString()
  vertexShader: string;

  @IsString()
  fragmentShader: string;

  @IsNumber()
  match: number;
}

export class UserTaskResultDto {
  id: number;

  name: string;

  order: number;

  accepted: boolean;

  rejected: boolean;

  score: number;
}
