import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from '../../config/base.entity';
import { STATUS_TASK } from "../../constants";
import { ITask } from "../../interface/task.interface";
import { ProjectEntity } from "../../projects/entities/project.entity";

/**
 * This class is a TypeScript class that extends the BaseEntity class and implements the ITask interface. 
 * @class
 * @extends BaseEntity
 * @implements {ITask}
 */
@Entity( { name: 'tasks' } )
export class TaskEntity extends BaseEntity implements ITask {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column( { type: 'enum', enum: STATUS_TASK, default: STATUS_TASK.NEW } )
    status: STATUS_TASK;

    @Column()
    responsableName: string;

    @ManyToOne( () => ProjectEntity, ( project ) => project.tasks )
    @JoinColumn( { name: 'project_id' } )
    project: ProjectEntity;
}
