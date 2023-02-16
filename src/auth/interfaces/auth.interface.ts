import { JwtPayload } from "jsonwebtoken"
import { UserEntity } from '../../users/entities/user.entity'

export interface ISignJWT {
    payload: JwtPayload
    secret: string
    expiresIn: number | string
}

export interface IPayloadToken {
    role: string
    sub: string
}

export interface IAuthBody {
    username: string
    password: string
}

export interface ITokenResponse {
    accessToken: string
    user: UserEntity
}