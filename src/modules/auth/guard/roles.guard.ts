import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { ROLES_KEY } from '../decorator/roles.decorator';
  import { RoleName } from '../../role/enum/role.enum';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
  
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      if (!user) {
        throw new ForbiddenException('Bạn không có quyền truy cập!');
      }
  
      const userRoles = user.roles || [];

      const hasRole = userRoles.some((role: string) =>
        requiredRoles.includes(role as RoleName),
      );
      
      if (!hasRole) {
        throw new ForbiddenException('Bạn không đủ quyền!');
      }
  
      console.log('Required roles in roles guard:', requiredRoles);
      console.log('User from request in roles guard:', user);
      console.log('User role in roles guard :', user.roles);
  
      return true;
    }
  }