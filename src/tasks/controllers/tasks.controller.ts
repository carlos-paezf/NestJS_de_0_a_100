import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksService } from '../services/tasks.service';


@ApiTags( 'Tasks' )
@ApiHeader( {
    name: 'Authorization',
    description: 'Token generado en la autenticación'
} )
@Controller( 'tasks' )
@UseGuards( AuthGuard, RolesGuard, AccessLevelGuard )
export class TasksController {
    constructor ( private readonly tasksService: TasksService ) { }

    @Post( 'create/:projectId' )
    @ApiParam( {
        name: 'projectId',
        description: 'Id del proyecto contenedor',
        example: "e3685c60-079a-493e-b30d-48adf83515ae"
    } )
    @AccessLevel( 'DEVELOPER' )
    create ( @Param( 'projectId' ) projectId: string, @Body() createTaskDto: CreateTaskDto ) {
        return this.tasksService.create( projectId, createTaskDto );
    }

    @Get( 'all/:projectId' )
    @ApiParam( {
        name: 'projectId',
        description: 'Id del proyecto contenedor',
        example: "e3685c60-079a-493e-b30d-48adf83515ae"
    } )
    findAll ( @Param( 'projectId' ) projectId: string ) {
        return this.tasksService.findAllByProject( projectId );
    }

    @Get( ':projectId/:taskId' )
    @ApiParam( {
        name: 'projectId',
        description: 'Id del proyecto contenedor',
        example: "e3685c60-079a-493e-b30d-48adf83515ae"
    } )
    @ApiParam( {
        name: 'taskId',
        description: "Id asignado a la tarea",
        example: "e47d6f5a-daba-4949-9d8c-1b119c2df019"
    } )
    findOne ( @Param( 'projectId' ) projectId: string, @Param( 'taskId' ) taskId: string ) {
        return this.tasksService.findOneTaskByTaskIdProjectId( projectId, taskId );
    }

    @Patch( 'edit/:projectId/:taskId' )
    @ApiParam( {
        name: 'projectId',
        description: 'Id del proyecto contenedor',
        example: "e3685c60-079a-493e-b30d-48adf83515ae"
    } )
    @ApiParam( {
        name: 'taskId',
        description: "Id asignado a la tarea",
        example: "e47d6f5a-daba-4949-9d8c-1b119c2df019"
    } )
    update ( @Param( 'projectId' ) projectId: string, @Param( 'taskId' ) taskId: string, @Body() updateTaskDto: UpdateTaskDto ) {
        return this.tasksService.update( projectId, taskId, updateTaskDto );
    }

    @Delete( 'delete/:projectId/:taskId' )
    @ApiParam( {
        name: 'projectId',
        description: 'Id del proyecto contenedor',
        example: "e3685c60-079a-493e-b30d-48adf83515ae"
    } )
    @ApiParam( {
        name: 'taskId',
        description: "Id asignado a la tarea",
        example: "e47d6f5a-daba-4949-9d8c-1b119c2df019"
    } )
    remove ( @Param( 'projectId' ) projectId: string, @Param( 'taskId' ) taskId: string, ) {
        return this.tasksService.remove( projectId, taskId );
    }
}
