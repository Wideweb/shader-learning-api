import { IsArray, IsBoolean, IsJSON, IsNumber, IsOptional, IsString } from 'class-validator';

export class TaskDto {
  id: number;

  moduleId: number;

  name: string;

  vertexShader: string;

  fragmentShader: string;

  defaultVertexShader: string | null;

  defaultFragmentShader: string | null;

  vertexCodeEditable: boolean;

  fragmentCodeEditable: boolean;

  @IsJSON()
  sceneSettings: JSON | null;

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

  channels: TaskChannelDto[];

  animated: boolean;

  animationSteps: number | null;

  animationStepTime: number | null;
}

export class TaskChannelDto {
  index: number;
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
  defaultFragmentShader: string | null;

  @IsString()
  defaultVertexShader: string | null;

  @IsBoolean()
  vertexCodeEditable: boolean;

  @IsBoolean()
  fragmentCodeEditable: boolean;

  @IsJSON()
  sceneSettings: JSON | null;

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

  @IsArray()
  channels: CreateTaskChannelDto[];

  @IsBoolean()
  animated: boolean;

  @IsOptional()
  animationSteps: number | null;

  @IsOptional()
  animationStepTime: number | null;
}

export class CreateTaskChannelDto {
  file: string;
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

  vertexShader: string;

  fragmentShader: string;

  at: Date;
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

  defaultVertexShader: string;

  defaultFragmentShader: string;

  liked: boolean;

  disliked: boolean;

  submissions: UserTaskSubmissionDto[];
}

export class UserTaskSubmissionDto {
  score: number;

  accepted: boolean;

  vertexShader: string;

  fragmentShader: string;

  at: Date;
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

  locked: boolean;
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

export class TaskFeedbackDto {
  @IsBoolean()
  unclearDescription: false;

  @IsBoolean()
  strictRuntime: false;

  @IsBoolean()
  other: false;

  @IsString()
  message: string;
}
