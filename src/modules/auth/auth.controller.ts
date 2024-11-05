
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/SetMetadata';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() loginDto: Record<string, any>) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refreshToken(@Body() refeshDto: Record<string, any>) {
        return this.authService.refreshToken(refeshDto.token);
    }
}
