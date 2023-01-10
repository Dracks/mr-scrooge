import { SetMetadata } from '@nestjs/common';

export enum Role {
    ADMIN = 'ADMIN',
    GUEST = 'GUEST',
    USER = 'USER'
}

export const AllowRoles = (...roles: Role[]) => SetMetadata('roles', roles);
