import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { PublicAccess } from 'src/auth/decorators/public-access.decorator'
import { AuthGuard } from 'src/auth/guards/auth.guard'
import { UserDTO, UserToProjectDTO, UserUpdateDTO } from '../dtos/user.dto'
import { UserEntity } from '../entities/user.entity'
import { UsersService } from '../services/users.service'


/**
 * The UsersController class is a controller that uses the UsersService class 
 * to perform CRUD operations on the User model
 * @class 
 */
@Controller( 'users' )
@UseGuards( AuthGuard )
export class UsersController {
    constructor ( private readonly _usersService: UsersService ) { }

    @Post( 'register' )
    public async registerUser ( @Body() body: UserDTO ): Promise<UserEntity> {
        return await this._usersService.createUser( body )
    }

    @Get( 'all' )
    public async findAllUsers (): Promise<{ count: number, users: UserEntity[] }> {
        return await this._usersService.findUsers()
    }

    @PublicAccess()
    @Get( ':id' )
    public async findUserById ( @Param() { id }: { id: string } ): Promise<UserEntity> {
        return await this._usersService.findUserById( id )
    }

    @Put( 'edit/:id' )
    public async updateUser ( @Param( 'id' ) id: string, @Body() body: UserUpdateDTO ) {
        return await this._usersService.updateUser( id, body )
    }

    @Delete( 'delete/:id' )
    public async deleteUser ( @Param( 'id' ) id: string ) {
        return await this._usersService.deleteUser( id )
    }

    @Post( 'user-to-project' )
    public async addToProject ( @Body() body: UserToProjectDTO ) {
        return await this._usersService.relationToProject( body )
    }
}
