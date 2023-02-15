import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { IUser } from '../../interface/user.interface'
import { ACCESS_LEVEL, ROLES } from '../../constants'
import { UserEntity } from '../entities/user.entity'
import { ProjectEntity } from '../../projects/entities/project.entity'


/** 
 * This class is a DTO (Data Transfer Object) that is used to validate the data that is sent 
 * to the server when a user is created. 
 * @class
 * @implements {IUser}
 */
export class UserDTO implements IUser {
    @IsNotEmpty()
    @IsString()
    firstName: string

    @IsNotEmpty()
    @IsString()
    lastName: string

    @IsNotEmpty()
    @IsNumber()
    age: number

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsEnum( ROLES )
    role: ROLES
}


/** 
 * This class is a TypeScript class that implements the Partial interface of the IUser interface, and
 * it has a bunch of properties that are optional, and they are all of the same type as the IUser interface.
 * @class
 * @implements {IUser} 
 */
export class UserUpdateDTO implements Partial<IUser> {
    @IsOptional()
    @IsString()
    firstName?: string

    @IsOptional()
    @IsString()
    lastName?: string

    @IsOptional()
    @IsNumber()
    age?: number

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    username?: string

    @IsOptional()
    @IsString()
    password?: string

    @IsOptional()
    @IsEnum( ROLES )
    role?: ROLES
}

export class UserToProjectDTO {
    @IsNotEmpty()
    @IsUUID()
    user: UserEntity

    @IsNotEmpty()
    @IsUUID()
    project: ProjectEntity

    @IsNotEmpty()
    @IsEnum( ACCESS_LEVEL )
    accessLevel: ACCESS_LEVEL
}