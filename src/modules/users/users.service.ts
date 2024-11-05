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
    const existEmail = await this.isEmailExisting(registerUserDto.email);
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
    if (registerUserDto.password.length < 8) {
      throw new BadRequestException(
        `invalid password`,
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

  async logout(id: bigint) {
    const user = await this.userRepository.findOne({
      where: {
        id: id
      },
    });
    if (!user) {
      throw new NotFoundException(`user not found`);
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      user.refeshToken = null
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return { message: 'Logout successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(`Failed to logout: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    })
  }

  async getUserById(id: bigint): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id: id,
      },
    })
  }


  async updateRefreshToken(id: bigint, refeshToken: string): Promise<{ message?: string, error?: any }> {
    const user = await this.userRepository.findOne({
      where: {
        id: id
      }
    })
    if (!user) {
      return { error: "user not found" }
    }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      user.refeshToken = refeshToken
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return { message: 'update refeshToken successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { error: error }
    } finally {
      await queryRunner.release();
    }
  }

  async isEmailExisting(email: string): Promise<boolean> {
    return this.userRepository.exists({
      where: {
        email: email,
      },
    });
  }
}
