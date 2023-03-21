import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { STATUS_TASK } from "src/constants";
import { ITask } from "src/interface/task.interface";

export class CreateTaskDto implements ITask {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsOptional()
    @IsEnum( STATUS_TASK )
    status: STATUS_TASK;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    responsableName: string;
}
