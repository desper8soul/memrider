import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { AuthUserSchema, SyncProfileSchema } from '@memrider/shared';
import { AuthService, CurrentUser, type AuthenticatedUser } from '@memrider/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return AuthUserSchema.parse({
      id: user.id,
      email: user.email,
    });
  }

  @Post('sync')
  async sync(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const accessToken = authorization.slice('Bearer '.length).trim();
    const { idToken } = SyncProfileSchema.parse(body);
    const user = await this.authService.syncProfileFromIdToken(
      accessToken,
      idToken,
    );

    return AuthUserSchema.parse({
      id: user.id,
      email: user.email,
    });
  }
}
