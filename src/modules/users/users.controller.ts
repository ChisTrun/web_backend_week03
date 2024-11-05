import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { CheckEmailDto } from './dtos/check-email.dto';
import { ResponseUserDto } from './dtos/response-user.dto';
import { Public } from 'src/decorators/SetMetadata';
import { AuthGuard } from '../auth/auth.guard';


@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Public()
    @Post('register')
    async Register(@Body() registerUserDto: RegisterUserDto): Promise<ResponseUserDto> {
        const user = await this.userService.register(registerUserDto)
        return new ResponseUserDto(user.email, user.createdAt)
    }

    @Public()
    @Post('check-email')
    async CheckMail(@Body() checkEmailDto: CheckEmailDto): Promise<object> {
        return {
            exist: await this.userService.isEmailExisting(checkEmailDto.email)
        }
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(AuthGuard)
    @Get('logout')
    async logout(@Request() req) {
        await this.userService.logout(req.sub)
    }
}
