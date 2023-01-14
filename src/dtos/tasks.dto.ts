import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class TaskDto {
  id: number;

  moduleId: number;

  name: string;

  vertexShader: string;

  fragmentShader: string;

  description: string;

  hints: TaskHintDto[];

  restrictions: TaskRestrictionDto[];

  order: number;

  cost: number;

  threshold: number;

  likes: number;

  dislikes: number;

  visibility: boolean;

  createdBy: { id: number; name: string };

  channel1: boolean;

  channel2: boolean;
}

export class CreateTaskDto {
  @IsNumber()
  moduleId: number;

  @IsString()
  name: string;

  @IsString()
  vertexShader: string;

  @IsString()
  fragmentShader: string;

  @IsString()
  description: string;

  @IsArray()
  hints: TaskHintDto[];

  @IsArray()
  restrictions: TaskRestrictionDto[];

  @IsNumber()
  cost: number;

  @IsNumber()
  threshold: number;

  @IsBoolean()
  visibility: boolean;

  @IsOptional()
  channel1: string | null;

  @IsOptional()
  channel2: string | null;
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

  liked: boolean;

  disliked: boolean;
}

export class UserTaskResultDto {
  id: number;

  moduleId: number;

  name: string;

  order: number;

  accepted: boolean;

  rejected: boolean;

  score: number;

  match: number;
}

export interface TaskListDto {
  id: number;

  moduleId: number;

  name: string;

  order: number;

  threshold: number;

  cost: number;

  visibility: boolean;
}
