import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { STATUS_TASK } from "src/constants";
import { ITask } from "src/interface/task.interface";

export class CreateTaskDto implements ITask {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsEnum( STATUS_TASK )
    status: STATUS_TASK;

    @IsNotEmpty()
    @IsString()
    responsableName: string;
}
