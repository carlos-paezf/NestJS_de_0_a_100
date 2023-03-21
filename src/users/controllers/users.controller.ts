import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminAccess } from '../../auth/decorators/admin-access.decorator';
import { PublicAccess } from '../../auth/decorators/public-access.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { HttpCustomService } from '../../providers/http/http-custom.service';
import { UserDTO, UserToProjectDTO, UserUpdateDTO } from '../dtos/user.dto';
import { UserEntity } from '../entities/user.entity';
import { UsersService } from '../services/users.service';


/**
 * The UsersController class is a controller that uses the UsersService class 
 * to perform CRUD operations on the User model
 * @class 
 */
@ApiTags( 'Users' )
@Controller( 'users' )
@UseGuards( AuthGuard, RolesGuard )
export class UsersController {
    constructor (
        private readonly _usersService: UsersService,
        private readonly _httpCustomService: HttpCustomService
    ) { }

    @PublicAccess()
    @Get( 'rick-and-morty' )
    public async apiFindAllCharacters () {
        return await this._httpCustomService.apiFindAll();
    }

    @PublicAccess()
    @Post( 'register' )
    public async registerUser ( @Body() body: UserDTO ): Promise<UserEntity> {
        return await this._usersService.createUser( body );
    }

    @Get( 'list' )
    public async findAllUsers (): Promise<{ count: number, users: UserEntity[]; }> {
        return await this._usersService.findUsers();
    }

    @PublicAccess()
    @Get( 'list/:userId' )
    public async findUserById ( @Param() { userId }: { userId: string; } ): Promise<UserEntity> {
        return await this._usersService.findUserById( userId );
    }

    @Roles( 'ADMIN' )
    @Put( 'edit/:userId' )
    public async updateUser ( @Param( 'userId' ) userId: string, @Body() body: UserUpdateDTO ) {
        return await this._usersService.updateUser( userId, body );
    }

    @AdminAccess()
    @Delete( 'delete/:userId' )
    public async deleteUser ( @Param( 'userId' ) userId: string ) {
        return await this._usersService.deleteUser( userId );
    }

    @Post( 'user-to-project' )
    public async addToProject ( @Body() body: UserToProjectDTO ) {
        return await this._usersService.relationToProject( body );
    }
}
