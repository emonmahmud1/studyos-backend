import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Alex Rivera' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'alex@university.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'alex@university.edu' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'alex@university.edu' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
