import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    findAll () {
        return `This action returns all tasks`;
    }

    findOne ( id: number ) {
        return `This action returns a #${ id } task`;
    }

    update ( id: number, updateTaskDto: UpdateTaskDto ) {
        return `This action updates a #${ id } task`;
    }

    remove ( id: number ) {
        return `This action removes a #${ id } task`;
    }
}
