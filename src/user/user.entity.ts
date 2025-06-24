import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role } from './role.enum';

@ObjectType()
@Entity()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Field(() => [String])
  @Column('text', { array: true, default: [Role.USER] })
  roles: Role[];

  @Field()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
