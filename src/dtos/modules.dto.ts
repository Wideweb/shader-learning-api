import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { TaskListDto } from './tasks.dto';

export class ModuleDto {
  id: number;

  name: string;

  description: string;

  order: number;

  createdBy: { id: number; name: string };

  tasks: TaskListDto[];

  locked: boolean;
}

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsBoolean()
  locked: boolean;
}

export class UpdateModuleDto extends CreateModuleDto {
  @IsNumber()
  id: number;
}

export class ModuleTaskReorderDto {
  @IsNumber()
  oldOrder: number;

  @IsNumber()
  newOrder: number;
}

export interface ModuleListDto {
  id: number;
  name: string;
  description: string;
  tasks: number;
  order: number;
  locked: boolean;
}
