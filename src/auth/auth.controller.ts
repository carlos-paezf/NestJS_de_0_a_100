import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDTO } from './dto/auth.dto'

@Controller( 'auth' )
export class AuthController {
    constructor ( private readonly authService: AuthService ) { }

    @Post( 'login' )
    async login ( @Body() body: AuthDTO ) {
        return await this.authService.login( body )
    }
}
