import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksController } from './controllers/tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity';
import { ProjectEntity } from 'src/projects/entities/project.entity';
import { ProjectsModule } from 'src/projects/projects.module';

@Module( {
    imports: [
        TypeOrmModule.forFeature( [ TaskEntity, ProjectEntity ] ),
        ProjectsModule
    ],
    controllers: [ TasksController ],
    providers: [ TasksService ]
} )
export class TasksModule { }
