import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { IUser } from '../../interface/user.interface';
import { ACCESS_LEVEL, ROLES } from '../../constants';
import { UserEntity } from '../entities/user.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { ApiProperty } from '@nestjs/swagger';


/** 
 * This class is a DTO (Data Transfer Object) that is used to validate the data that is sent 
 * to the server when a user is created. 
 * @class
 * @implements {IUser}
 */
export class UserDTO implements IUser {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    age: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty( { enum: ROLES } )
    @IsNotEmpty()
    @IsEnum( ROLES )
    role: ROLES;
}


/** 
 * This class is a TypeScript class that implements the Partial interface of the IUser interface, and
 * it has a bunch of properties that are optional, and they are all of the same type as the IUser interface.
 * @class
 * @implements {IUser} 
 */
export class UserUpdateDTO implements Partial<IUser> {
    @ApiProperty()
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    age?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    password?: string;

    @ApiProperty()
    @IsOptional()
    @IsEnum( ROLES )
    role?: ROLES;
}

export class UserToProjectDTO {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    user: UserEntity;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    project: ProjectEntity;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum( ACCESS_LEVEL )
    accessLevel: ACCESS_LEVEL;
}