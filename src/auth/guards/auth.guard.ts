import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { PUBLIC_KEY } from '../../constants/key-decorators'
import { UsersService } from '../../users/services/users.service'
import { useToken } from '../../utils/use.token'
import { IUseToken } from '../interfaces/auth.interface'

/**
 * It checks if the route is public, if it is, it returns true. If it's not, it checks if the token is
 * valid, if it is, it returns true. If it's not, it throws an error 
*/
@Injectable()
export class AuthGuard implements CanActivate {
    constructor (
        private readonly _userService: UsersService,
        private readonly _reflector: Reflector
    ) { }

    /**
     * It checks if the route is public, if it is, it returns true. If it's not, it checks if the token
     * is valid, if it is, it returns true. If it's not, it throws an error
     * @param {ExecutionContext} context - ExecutionContext: This is the context of the request.
     * @returns A boolean value.
     */
    async canActivate ( context: ExecutionContext ) {
        const isPublic = this._reflector.get<boolean>( PUBLIC_KEY, context.getHandler() )

        if ( isPublic ) return true

        const req = context.switchToHttp().getRequest<Request>()
        const token = req.headers.authorization

        if ( !token || Array.isArray( token ) ) throw new UnauthorizedException( 'Invalid token' )

        const manageToken: IUseToken | string = useToken( token )

        if ( typeof manageToken === 'string' ) throw new UnauthorizedException( manageToken )
        if ( manageToken.isExpired ) throw new UnauthorizedException( 'Token expired' )

        const { sub } = manageToken
        const user = await this._userService.findUserById( sub )

        if ( !user ) throw new UnauthorizedException( 'Invalid User' )

        req.idUser = user.id
        req.roleUser = user.role

        return true
    }
}
