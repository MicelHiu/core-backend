import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<string[]>
        ('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if(!required) return true;

        //set by JwtAuthGuard, which must run first in @UseGuards
        const {user} = context.switchToHttp().getRequest();
        if(!required.includes(user?.role)) {
            throw new ForbiddenException('Forbidden Access');
        }
        return true;
    }
}