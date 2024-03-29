import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessLevel } from 'src/auth/decorators/access-level.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ProjectDTO, ProjectUpdateDTO } from '../dtos/project.dto';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectsService } from '../services/projects.service';


@ApiTags( 'Projects' )
@Controller( 'projects' )
@UseGuards( AuthGuard, RolesGuard, AccessLevelGuard )
export class ProjectsController {
    constructor ( private readonly _projectService: ProjectsService ) { }

    @Roles( 'CREATOR' )
    @Post( 'create' )
    public async createProject ( @Body() body: ProjectDTO ): Promise<ProjectEntity> {
        return await this._projectService.createProject( body );
    }

    @Get( 'all' )
    public async findAllProjects (): Promise<{ count: number, projects: ProjectEntity[]; }> {
        return await this._projectService.findProjects();
    }

    @Get( ':projectId' )
    public async findProjectById ( @Param() { projectId }: { projectId: string; } ): Promise<ProjectEntity> {
        return await this._projectService.findProjectById( projectId );
    }

    @AccessLevel( 'OWNER' )
    @Put( 'edit/:projectId' )
    public async updateProject ( @Param( 'projectId' ) projectId: string, @Body() body: ProjectUpdateDTO ) {
        return await this._projectService.updateProject( projectId, body );
    }

    @Delete( 'delete/:projectId' )
    public async deleteProject ( @Param( 'projectId' ) projectId: string ) {
        return await this._projectService.deleteProject( projectId );
    }
}
