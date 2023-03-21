import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';

@ApiTags( 'Authentication' )
@Controller( 'auth' )
export class AuthController {
    constructor ( private readonly authService: AuthService ) { }

    @Post( 'login' )
    async login ( @Body() body: AuthDTO ) {
        return await this.authService.login( body );
    }
}
