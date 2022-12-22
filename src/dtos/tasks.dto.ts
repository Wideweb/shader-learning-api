import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class TaskDto {
  id: number;

  name: string;

  vertexShader: string;

  fragmentShader: string;

  hints: TaskHintDto[];

  restrictions: TaskRestrictionDto[];

  order: number;

  cost: number;

  threshold: number;
}

export class CreateTaskDto {
  @IsString()
  name: string;

  @IsString()
  vertexShader: string;

  @IsString()
  fragmentShader: string;

  @IsArray()
  hints: TaskHintDto[];

  @IsArray()
  restrictions: TaskRestrictionDto[];

  @IsNumber()
  order: number;

  @IsNumber()
  cost: number;

  @IsNumber()
  threshold: number;

  @IsBoolean()
  visibility: boolean;
}

export class UpdateTaskDto extends CreateTaskDto {
  @IsNumber()
  id: number;
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

export class UserTaskDto {
  task: TaskDto;

  vertexShader: string;

  fragmentShader: string;
}

export class UserTaskResultDto {
  id: number;

  name: string;

  order: number;

  accepted: boolean;

  rejected: boolean;

  score: number;
}

export interface TaskListDto {
  id: number;
  name: string;
  order: number;
  threshold: number;
  cost: number;
  visibility: boolean;
}
