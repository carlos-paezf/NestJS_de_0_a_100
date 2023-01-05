import { Module } from '@nestjs/common'
import { ProjectsService } from './services/projects.service'
import { ProjectsController } from './controllers/projects.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProjectEntity } from './entities/project.entity'

@Module( {
    imports: [
        TypeOrmModule.forFeature( [ ProjectEntity ] )
    ],
    providers: [ ProjectsService ],
    controllers: [ ProjectsController ]
} )
export class ProjectsModule { }
