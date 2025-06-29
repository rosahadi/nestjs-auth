import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupInput } from './dto/signup.input';
import { LoginInput } from './dto/login.input';
import { PasswordService } from './password.service';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { UpdatePasswordInput } from './dto/update-password.input';

interface VerificationTokenPayload {
  email: string;
  sub: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private passwordService: PasswordService,
  ) {}

  async signup(
    signupInput: SignupInput,
  ): Promise<{ message: string; verificationToken?: string }> {
    // Check passwords match - doing this first saves a database call
    if (signupInput.password !== signupInput.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.usersService.findByEmail(signupInput.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Give them 15 minutes to verify their email
    const expiresDate = new Date();
    expiresDate.setMinutes(expiresDate.getMinutes() + 15);

    const user = await this.usersService.create({
      name: signupInput.name,
      email: signupInput.email,
      password: signupInput.password,
      isEmailVerified: false,
      emailVerificationExpires: expiresDate,
    });

    // Generate verification token (short-lived)
    const verificationToken = this.generateVerificationToken(user);

    // In real life, you'd send this via email service
    // For now, just log it so you can test
    console.log(`Verification token for ${user.email}: ${verificationToken}`);

    return { message: 'Please check your email for verification link' };
  }

  async verifyEmail(token: string): Promise<{ token: string; user: User }> {
    try {
      // Decode the verification token
      const decoded = this.jwtService.verify<VerificationTokenPayload>(token);
      const user = await this.usersService.findById(decoded.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Check if already verified
      if (user.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Check if verification expired
      if (
        user.emailVerificationExpires &&
        user.emailVerificationExpires < new Date()
      ) {
        // Clean up the unverified user account
        await this.usersService.remove(user.id);
        throw new UnauthorizedException(
          'Verification link has expired. Please sign up again.',
        );
      }

      // Mark email as verified
      await this.usersService.updateEmailVerification({
        userId: user.id,
        isEmailVerified: true,
        emailVerificationExpires: null,
      });

      // Get updated user and generate access token
      const updatedUser = await this.usersService.findById(user.id);
      const accessToken = this.generateToken(updatedUser);

      return { token: accessToken, user: updatedUser };
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async login(loginInput: LoginInput): Promise<{ token: string; user: User }> {
    const user = await this.usersService.findByEmail(loginInput.email);
    if (!user) {
      // Same error message whether email exists or not (prevents email enumeration)
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password using PasswordService
    const isPasswordValid = await this.passwordService.verify(
      loginInput.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Don't let unverified users log in
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email not verified. Please verify your email before logging in.',
      );
    }

    // All good - generate token
    const token = this.generateToken(user);

    return { token, user };
  }

  async updatePassword(
    userId: string,
    updatePasswordInput: UpdatePasswordInput,
  ): Promise<{ token: string; user: User }> {
    const user = await this.usersService.findById(userId);

    // Check if current password is correct using PasswordService
    const isCurrentPasswordValid = await this.passwordService.verify(
      updatePasswordInput.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new passwords match
    if (updatePasswordInput.password !== updatePasswordInput.passwordConfirm) {
      throw new BadRequestException('Passwords do not match');
    }

    // Update password - hashing handled by UsersService
    await this.usersService.update(userId, {
      password: updatePasswordInput.password,
    });

    const updatedUser = await this.usersService.findById(userId);

    const token = this.generateToken(updatedUser);

    return { token, user: updatedUser };
  }

  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return this.jwtService.sign(payload);
  }

  private generateVerificationToken(user: User): string {
    const payload = { email: user.email, sub: user.id };

    // Verification tokens are short-lived
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
  }
}
