import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersProjectsEntity } from '../users/entities/usersProjects.entity';
import { UsersModule } from '../users/users.module';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectEntity } from './entities/project.entity';
import { ProjectsService } from './services/projects.service';

@Module( {
    imports: [
        TypeOrmModule.forFeature( [
            ProjectEntity, UsersProjectsEntity
        ] ),
        UsersModule
    ],
    providers: [ ProjectsService ],
    controllers: [ ProjectsController ],
    exports: [ ProjectsService ]
} )
export class ProjectsModule { }
