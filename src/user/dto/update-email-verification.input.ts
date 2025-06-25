import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateEmailVerificationInput {
  @Field()
  userId: string;

  @Field()
  isEmailVerified: boolean;

  @Field(() => Date, { nullable: true })
  emailVerificationExpires: Date | null;
}
