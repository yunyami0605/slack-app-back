import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() data: SignupDto) {
    return this.authService.signup(data);
  }

  @Post('/login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }
}
