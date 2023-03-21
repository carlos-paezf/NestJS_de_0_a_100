import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskEntity } from '../entities/task.entity';
import { ProjectsService } from 'src/projects/services/projects.service';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class TasksService {
    constructor (
        @InjectRepository( TaskEntity ) private readonly _taskRepository: Repository<TaskEntity>,
        private readonly _projectsService: ProjectsService
    ) { }

    /**
     * It creates a task and assigns it to a project
     * @param {string} projectId - string: The id of the project to which the task belongs.
     * @param {CreateTaskDto} createTaskDto - CreateTaskDto
     * @returns The task created
     */
    async create ( projectId: string, createTaskDto: CreateTaskDto ): Promise<TaskEntity> {
        try {
            const project = await this._projectsService.findProjectById( projectId );
            if ( !project ) {
                throw new ErrorManager( {
                    type: 'NOT_FOUND',
                    message: 'No se encontró el proyecto solicitado'
                } );
            }

            return await this._taskRepository.save( { ...createTaskDto, project } );

        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }

    /**
     * It finds all tasks by project id and returns the count and tasks
     * @param {string} projectId - string
     * @returns an object with the count of the tasks and the tasks.
     */
    async findAllByProject ( projectId: string ) {
        try {
            const { 0: tasks, 1: count } = await this._taskRepository.findAndCount( {
                where: {
                    project: { id: projectId }
                }
            } );
            if ( !count ) throw new ErrorManager( {
                type: 'NOT_FOUND',
                message: `No se encontraron resultados para el proyecto con el id '${ projectId }'`
            } );
            return { count, tasks };
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }

    /**
     * It finds a task by its id and project id
     * @param {string} projectId - string, taskId: string
     * @param {string} taskId - The id of the task to be found.
     * @returns The task object
     */
    async findOneTaskByTaskIdProjectId ( projectId: string, taskId: string ) {
        try {
            const task = await this._taskRepository.findOne( {
                where: {
                    id: taskId,
                    project: { id: projectId }
                }
            } );
            if ( !task ) throw new ErrorManager( {
                type: 'NOT_FOUND',
                message: `No se encontró una tarea con el id '${ taskId }' para el proyecto '${ projectId }'`
            } );
            return task;
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }

    /**
     * It updates a task by taskId and projectId
     * @param {string} projectId - string, taskId: string, updateTaskDto: UpdateTaskDto
     * @param {string} taskId - string, updateTaskDto: UpdateTaskDto
     * @param {UpdateTaskDto} updateTaskDto - UpdateTaskDto
     */
    async update ( projectId: string, taskId: string, updateTaskDto: UpdateTaskDto ) {
        try {
            await this.findOneTaskByTaskIdProjectId( projectId, taskId );

            const result: UpdateResult = await this._taskRepository.update( taskId, updateTaskDto );

            if ( !result.affected ) throw new ErrorManager( {
                type: 'BAD_REQUEST',
                message: 'No se aplicaron los cambios'
            } );

            return result;
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }

    /**
     * It deletes a task from the database
     * @param {string} projectId - string, taskId: string
     * @param {string} taskId - The id of the task to be deleted.
     * @returns The result of the delete operation
     */
    async remove ( projectId: string, taskId: string ) {
        try {
            await this.findOneTaskByTaskIdProjectId( projectId, taskId );

            const result: DeleteResult = await this._taskRepository.delete( taskId );

            if ( !result.affected ) throw new ErrorManager( {
                type: 'BAD_REQUEST',
                message: 'No se aplicaron los cambios'
            } );

            return result;
        } catch ( error ) {
            throw ErrorManager.createSignatureError( error.message );
        }
    }
}
