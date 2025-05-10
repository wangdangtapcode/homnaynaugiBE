export enum RoleName {
    ADMIN = 'admin',
    USER = 'user'
}

export enum Permission {
    // User permissions
    VIEW_PROFILE = 'view_profile',
    EDIT_PROFILE = 'edit_profile',
    
    // Admin permissions
    MANAGE_USERS = 'manage_users',
    MANAGE_SYSTEM = 'manage_system'
}

export const RolePermissions = {
    [RoleName.ADMIN]: [
        Permission.MANAGE_USERS,
        Permission.MANAGE_SYSTEM,
        Permission.VIEW_PROFILE,
        Permission.EDIT_PROFILE
    ],
    [RoleName.USER]: [
        Permission.VIEW_PROFILE,
        Permission.EDIT_PROFILE
    ]
};