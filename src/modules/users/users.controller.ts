import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { CheckEmailDto } from './dtos/check-email.dto';
import { ResponseUserDto } from './dtos/response-user.dto';

@Controller('users')
export class UsersController {
    constructor (private readonly userService: UsersService) {}

    @Post('register')
    async Register(@Body() registerUserDto: RegisterUserDto): Promise<ResponseUserDto> {
        const user = await this.userService.register(registerUserDto)
        return  new ResponseUserDto(user.email, user.createdAt)
    }

    @Post('login')
    async Login(@Body() loginUserDto: LoginUserDto): Promise<ResponseUserDto> {
        const user = await this.userService.login(loginUserDto)
        return new ResponseUserDto(user.email, user.createdAt)
    }

    @Post('check-email')
    async CheckMail(@Body() checkEmailDto: CheckEmailDto): Promise<object> {
        return {
            exist: await this.userService.isEmailExisting(checkEmailDto.email)
        }
    }


 
}
