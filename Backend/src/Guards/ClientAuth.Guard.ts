import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * ClientAuthGuard validates JWT tokens from client requests.
 * Ensures only authenticated clients with a valid token can access protected routes.
 */
@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookies(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    try {
      const decodedClient = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET, // Ensure JWT_SECRET is securely stored
      });

      // Optional: Extend with custom client checks here (e.g., isBlocked, verified, etc.)

      // Attach decoded client data to request for downstream usage
      request.client = decodedClient;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Extracts JWT token from request cookies.
   * @param request - Incoming HTTP request
   * @returns JWT token string, if present
   */
  private extractTokenFromCookies(request: Request): string | undefined {
    return request.cookies?.['token'];
  }
}
