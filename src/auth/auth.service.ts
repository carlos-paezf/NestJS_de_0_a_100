import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { UserEntity } from '../users/entities/user.entity'
import { UsersService } from './../users/services/users.service'
import { AuthDTO } from './dto/auth.dto'
import { IPayloadToken, ISignJWT, ITokenResponse } from './interfaces/auth.interface'

@Injectable()
export class AuthService {
    constructor ( private _userService: UsersService ) { }

    public async login ( { username, password }: AuthDTO ) {
        const userValidate = await this._validateUser( username, password )

        if ( !userValidate )
            throw new UnauthorizedException( 'Data not valid' )

        const jwt = await this._generateJWT( userValidate )

        return jwt
    }

    private async _validateUser ( username: string, password: string ) {
        const userByUsername = await this._userService.findBy( { key: 'username', value: username } )

        if ( userByUsername ) {
            const match = await bcrypt.compare( password, userByUsername.password )
            if ( match ) return userByUsername
        }

        const userByEmail = await this._userService.findBy( { key: 'email', value: password } )

        if ( userByEmail ) {
            const match = await bcrypt.compare( password, userByEmail.password )
            if ( match ) return userByEmail
        }
    }

    private async _signJWT ( { payload, secret, expiresIn }: ISignJWT ) {
        return await jwt.sign( payload, secret, { expiresIn } )
    }

    private async _generateJWT ( user: UserEntity ): Promise<ITokenResponse> {
        const payload: IPayloadToken = {
            role: user.role,
            sub: user.id
        }

        delete user.password

        return {
            accessToken: await this._signJWT( {
                payload,
                secret: process.env.JWT_SECRET,
                expiresIn: '1h'
            } ),
            user
        }
    }
}