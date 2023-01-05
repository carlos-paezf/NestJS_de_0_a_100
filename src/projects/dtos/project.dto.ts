import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { IProject } from '../../../dist/interface/project.interface'


/**
 * This class is a DTO (Data Transfer Object) that is used to validate the data that is 
 * sent to the server when a new project is created. 
 * @class
 * @implements {IProject}
 */
export class ProjectDTO implements IProject {
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsString()
    description: string
}


/**
 * This class is a DTO that is used to update a project. It is optional to 
 * update the name and description of a project. 
 * @class
 * @implements {IProject}
 */
export class ProjectUpdateDTO implements Partial<IProject> {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    description?: string
}