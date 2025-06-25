import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdatePasswordInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Password confirmation is required' })
  passwordConfirm: string;
}
