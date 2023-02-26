import { IUseToken } from "src/auth/interfaces/auth.interface"
import * as jwt from 'jsonwebtoken'
import { IAuthTokenResult } from '../auth/interfaces/auth.interface'


/**
 * It takes a token, decodes it, and returns an object with the token's subject, role, and whether or
 * not it's expired
 * @param {string} token - string - the token you want to decode
 * @returns An object with the following properties:
 */
export const useToken = ( token: string ): IUseToken | string => {
    try {
        const decode = jwt.decode( token ) as unknown as IAuthTokenResult

        const currentDate = new Date()
        const expiresDate = new Date( decode.exp )

        return {
            sub: decode.sub,
            role: decode.role,
            isExpired: +expiresDate <= +currentDate / 1000
        }
    } catch ( error ) {
        return 'Token is invalid'
    }
}