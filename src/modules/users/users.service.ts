import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from './dtos/register-user.dto';
import { Hasher } from '../..//utils/hasher';
import { LoginUserDto } from './dtos/login-user.dto';
import { error } from 'console';


function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) { }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const existEmail = this.isEmailExisting(registerUserDto.email);
    if (existEmail) {
      throw new ConflictException(
        `The email address is already in use`,
      );
    }
    if (!validateEmail(registerUserDto.email)) {
      throw new BadRequestException(
        `invalid email`,
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = new User();
      user.email = registerUserDto.email;
      user.password = await Hasher.hashPassword(registerUserDto.password);
      const newUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Failed to create user: ${error}`);
    } finally {
      await queryRunner.release();
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginUserDto.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException(`Wrong email`);
    }
    const checkPassword = await Hasher.comparePassword(
      loginUserDto.password,
      user.password,
    );
    if (!checkPassword) {
      throw new UnauthorizedException(`Wrong password`);
    }
    return user;
  }

  async isEmailExisting(email: string): Promise<boolean> {
    return this.userRepository.exists({
      where: {
        email: email,
      },
    });
  }
}
