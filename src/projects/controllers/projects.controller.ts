import { Body, Controller, Post, Get, Param, Delete, Put } from '@nestjs/common'
import { ProjectDTO, ProjectUpdateDTO } from '../dtos/project.dto'
import { ProjectsService } from '../services/projects.service'
import { ProjectEntity } from '../entities/project.entity'


@Controller( 'projects' )
export class ProjectsController {
    constructor ( private readonly _projectService: ProjectsService ) { }

    @Post( 'register' )
    public async registerProject ( @Body() body: ProjectDTO ): Promise<ProjectEntity> {
        return await this._projectService.createProject( body )
    }

    @Get( 'all' )
    public async findAllProjects (): Promise<{ count: number, projects: ProjectEntity[] }> {
        return await this._projectService.findProjects()
    }

    @Get( ':id' )
    public async findProjectById ( @Param() { id }: { id: string } ): Promise<ProjectEntity> {
        return await this._projectService.findProjectById( id )
    }

    @Put( 'edit/:id' )
    public async updateProject ( @Param( 'id' ) id: string, @Body() body: ProjectUpdateDTO ) {
        return await this._projectService.updateProject( id, body )
    }

    @Delete( 'delete/:id' )
    public async deleteProject ( @Param( 'id' ) id: string ) {
        return await this._projectService.deleteProject( id )
    }
}
