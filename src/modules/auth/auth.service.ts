import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Hasher } from 'src/utils/hasher';
import { ResponseUserDto } from '../users/dtos/response-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private accessJwtService: JwtService,
        private refreshJwtService: JwtService
    ) { }

    async login(email: string, pass: string,): Promise<{ access_token: string, refresh_token: string, user: ResponseUserDto }> {
        const user = await this.usersService.getUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException();
        }
        const checkPassword = await Hasher.comparePassword(pass, user.password);
        if (!checkPassword) {
            throw new UnauthorizedException();
        }
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.accessJwtService.signAsync(payload)
        const refreshToken = await this.refreshJwtService.signAsync(payload)
        const rsp = await this.usersService.updateRefreshToken(user.id, refreshToken)
        if (rsp.error) {
            throw new InternalServerErrorException("error while login to page")
        }
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: new ResponseUserDto( user.email,user.createdAt)
        };
    }

    async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
        try {
            const payload = await this.refreshJwtService.verifyAsync(refreshToken);
            const user = await this.usersService.getUserById(payload.id);
            if (!user == null || refreshToken != user.refeshToken) {
                throw new UnauthorizedException();
            }
            const accessToken = await this.accessJwtService.signAsync({ sub: user.id, email: user.email })
            return {
                access_token: accessToken,
            };
        } catch {
            throw new UnauthorizedException();
        }
    }
}
