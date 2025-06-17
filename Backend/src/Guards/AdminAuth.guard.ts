import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { RequestWithAdmin } from "src/common/interfaces/request-admin.interface";
 
@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithAdmin>();
       const token = this.extractTokenFromCookies(request);

       if(!token){
        throw new UnauthorizedException('authentication admin token is missing');
       }

       try {
        const decodedAdmin = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET, // Ensure JWT_SECRET is securely stored
        })
        // Optional: Extend with custom admin checks here (e.g., isBlocked, verified, etc.)
        // Attach decoded admin data to request for downstream usage
        request.admin = decodedAdmin;

        return true; // Placeholder, implement your logic
       } catch (error) {
        throw new UnauthorizedException('invalid or expired token');
       }
    }

    private extractTokenFromCookies(req: Request): string | undefined {
        return req.cookies?.['adminAccessToken'];
    }
}