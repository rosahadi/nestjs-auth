import { Resolver, Query } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from './role.enum';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  @Roles(Role.ADMIN)
  async users(): Promise<User[]> {
    return this.userService.findAll();
  }
}
