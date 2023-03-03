import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './controllers/projects.controller';
import { ProjectEntity } from './entities/project.entity';
import { ProjectsService } from './services/projects.service';

@Module( {
    imports: [
        TypeOrmModule.forFeature( [ ProjectEntity ] )
    ],
    providers: [ ProjectsService ],
    controllers: [ ProjectsController ]
} )
export class ProjectsModule { }
