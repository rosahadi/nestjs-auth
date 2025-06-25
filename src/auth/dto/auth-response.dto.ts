import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';

@ObjectType()
export class AuthResponse {
  @Field(() => User)
  user: User;
}
