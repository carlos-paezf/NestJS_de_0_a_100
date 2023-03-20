import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../config/base.entity";
import { IProject } from "../../interface/project.interface";
import { UsersProjectsEntity } from "../../users/entities/usersProjects.entity";
import { TaskEntity } from "../../tasks/entities/task.entity";


/**
 * This class is a TypeScript class that extends the BaseEntity class and implements the IProject interface. 
 * @class
 * @extends BaseEntity
 * @implements {IProject}
 */
@Entity( { name: 'projects' } )
export class ProjectEntity extends BaseEntity implements IProject {
    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany( () => UsersProjectsEntity, ( userProject ) => userProject.project )
    usersIncludes: UsersProjectsEntity[];

    @OneToMany( () => TaskEntity, ( task ) => task.project )
    tasks: TaskEntity[];
}