import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ContextCreator } from "@nestjs/core/helpers/context-creator";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor (private readonly jwt: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers.authorization ?? "";
        const[scheme, value] = auth.split(" ");
        const token = scheme?.toLowerCase() === 'bearer' ? value: null;

        if(!token) throw new UnauthorizedException("No token provided");

        try {
            const payload = await this.jwt.verifyAsync(token);
            // token reset password (punya "purpose") tidak boleh dipakai sebagai token login
            if (payload.purpose) throw new Error('Not an access token');
            req.user = { id: payload.sub, role: payload.role };
            return true;
        } catch (err: any) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}