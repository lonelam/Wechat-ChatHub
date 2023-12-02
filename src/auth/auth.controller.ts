import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { promisify } from 'util';
import { UserDto } from 'src/chatdb/dto/user';
import { Public } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('pre-login')
  async preLogin() {
    const init = await this.authService.hasInitialized();
    return { init };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('setup')
  async setup(
    @Body()
    body: {
      password: string;
      openai: { token: string; baseUrl: string };
      padLocal: {
        token: string;
        puppetType: string;
      };
    },
  ) {
    const hasInitialized = await this.authService.hasInitialized();
    if (hasInitialized) {
      throw new BadRequestException('Already initialized');
    }
    const adminUser = await this.authService.setup(
      body.password,
      body.openai.baseUrl,
      body.openai.token,
      body.padLocal.token,
      body.padLocal.puppetType,
    );
    return {
      user: new UserDto(adminUser),
    };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() body: { username: string; password: string },
    @Request() req: Express.Request,
  ) {
    const { password, username } = body;

    const user = await this.authService.validateUser(username, password);
    if (user) {
      await promisify(req.logIn.bind(req))(user);
      return { user: new UserDto(user) };
    }
    throw new UnauthorizedException('Invalid username or password');
  }

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const { password, username } = body;
    const user = await this.authService.register(username, password);
    if (user) return { user };
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req: Express.Request) {
    await promisify(req.logout.bind(req))(); // Passport method to log out
    await promisify(req.session.destroy.bind(req.session))(); // Destroy the session
    return { message: 'Logged out successfully' };
  }
}
