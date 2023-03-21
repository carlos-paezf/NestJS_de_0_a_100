import { IsNotEmpty, IsString } from 'class-validator';
import { IAuthBody } from "../interfaces/auth.interface";
import { ApiProperty } from '@nestjs/swagger';

export class AuthDTO implements IAuthBody {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
}