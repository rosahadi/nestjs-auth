import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { PasswordService } from '../auth/password.service';
import { UpdateEmailVerificationInput } from './dto/update-email-verification.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private passwordService: PasswordService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async create(createUserData: CreateUserInput): Promise<User> {
    // Hash the password before creating the user
    if (createUserData.password) {
      createUserData.password = await this.passwordService.hash(
        createUserData.password,
      );
    }

    const user = this.usersRepository.create(createUserData);
    return await this.usersRepository.save(user);
  }

  async updateEmailVerification(
    input: UpdateEmailVerificationInput,
  ): Promise<User> {
    const user = await this.findById(input.userId);
    user.isEmailVerified = input.isEmailVerified;
    user.emailVerificationExpires = input.emailVerificationExpires;
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    // Hash password if it is being updated
    if (updateData.password) {
      updateData.password = await this.passwordService.hash(
        updateData.password,
      );
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
    return user;
  }
}
