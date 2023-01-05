import { Controller } from '@nestjs/common'
import { ProjectsService } from '../services/projects.service'


@Controller( 'projects' )
export class ProjectsController {
    constructor ( private readonly _projectService: ProjectsService ) { }
}
