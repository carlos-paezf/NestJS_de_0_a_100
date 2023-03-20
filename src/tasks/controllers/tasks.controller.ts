import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TasksService } from '../services/tasks.service';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';


@Controller( 'tasks' )
@UseGuards( AuthGuard, RolesGuard, AccessLevelGuard )
export class TasksController {
    constructor ( private readonly tasksService: TasksService ) { }

    @AccessLevel( 30 )
    @Post( 'create/:projectId' )
    create ( @Param( 'projectId' ) projectId: string, @Body() createTaskDto: CreateTaskDto ) {
        return this.tasksService.create( projectId, createTaskDto );
    }

    @Get()
    findAll () {
        return this.tasksService.findAll();
    }

    @Get( ':id' )
    findOne ( @Param( 'id' ) id: string ) {
        return this.tasksService.findOne( +id );
    }

    @Patch( ':id' )
    update ( @Param( 'id' ) id: string, @Body() updateTaskDto: UpdateTaskDto ) {
        return this.tasksService.update( +id, updateTaskDto );
    }

    @Delete( ':id' )
    remove ( @Param( 'id' ) id: string ) {
        return this.tasksService.remove( +id );
    }
}
