import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { IProject } from '../../interface/project.interface';
import { ApiProperty } from '@nestjs/swagger';


/**
 * This class is a DTO (Data Transfer Object) that is used to validate the data that is 
 * sent to the server when a new project is created. 
 * @class
 * @implements {IProject}
 */
export class ProjectDTO implements IProject {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    userOwnerId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;
}


/**
 * This class is a DTO that is used to update a project. It is optional to 
 * update the name and description of a project. 
 * @class
 * @implements {IProject}
 */
export class ProjectUpdateDTO implements Partial<IProject> {
    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?: string;
}