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
  
      // Kiểm tra xem role từ token có trong danh sách requiredRoles không
      // Chúng ta kiểm tra user.role (được set trong token) thay vì user.roles
      const hasRole = requiredRoles.includes(user.role as RoleName);
  
      if (!hasRole) {
        throw new ForbiddenException('Bạn không đủ quyền!');
      }
  
      return true;
    }
  }