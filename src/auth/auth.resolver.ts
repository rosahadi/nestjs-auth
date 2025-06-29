import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/auth-response.dto';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { SignupResponse } from './dto/signup-response.dto';
import { TokenUtils } from './utils/token.utils';
import { Public } from './decorators/public.decorator';
import { GqlContext } from 'src/types/express';
import { CurrentUser } from './decorators/current-user.decorator';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { VerifiedEmailGuard } from './guards/verified-email.guard';
import { UpdatePasswordInput } from './dto/update-password.input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenUtils: TokenUtils,
  ) {}

  @Public()
  @Mutation(() => SignupResponse)
  async signup(
    @Args('signupInput') signupInput: SignupInput,
  ): Promise<SignupResponse> {
    return this.authService.signup(signupInput);
  }

  @Public()
  @Mutation(() => AuthResponse)
  async verifyEmail(
    @Args('token') token: string,
    @Context() context: GqlContext,
  ): Promise<AuthResponse> {
    const { token: authToken, user } =
      await this.authService.verifyEmail(token);

    // Set the token in an HTTP-only cookie only
    this.tokenUtils.setCookieToken(context.res, authToken);

    return { user };
  }

  @Public()
  @Mutation(() => AuthResponse)
  async login(
    @Args('loginInput') loginInput: LoginInput,
    @Context() { res }: GqlContext,
  ): Promise<AuthResponse> {
    const { token, user } = await this.authService.login(loginInput);

    // Set the token in an HTTP-only cookie only
    this.tokenUtils.setCookieToken(res, token);

    return { user };
  }

  @Mutation(() => AuthResponse)
  @UseGuards(VerifiedEmailGuard)
  async updatePassword(
    @CurrentUser() user: User,
    @Args('updatePasswordInput') updatePasswordInput: UpdatePasswordInput,
    @Context() context: GqlContext,
  ): Promise<AuthResponse> {
    const result = await this.authService.updatePassword(
      user.id,
      updatePasswordInput,
    );

    // Set the new token in an HTTP-only cookie only
    this.tokenUtils.setCookieToken(context.res, result.token);

    return { user: result.user };
  }

  @Mutation(() => Boolean)
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@Context() context: GqlContext): Promise<boolean> {
    // Clear the cookie with secure options
    context.res.clearCookie('airbnbCloneJWT', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return true;
  }
}
