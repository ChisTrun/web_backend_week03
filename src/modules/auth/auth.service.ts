import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Hasher } from 'src/utils/hasher';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private accessJwtService: JwtService,
        private refreshJwtService: JwtService
    ) { }

    async login(email: string, pass: string,): Promise<{ access_token: string, refesh_token: string }> {
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
        const refeshToken = await this.refreshJwtService.signAsync(payload)
        const rsp = await this.usersService.updateRefeshToken(user.id, refeshToken)
        if (rsp.error) {
            throw new InternalServerErrorException("error while login to page")
        }
        return {
            access_token: accessToken,
            refesh_token: refeshToken,
        };
    }


}
