export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
}

export const UserRolePermissions = {
  canView: (role: UserRole) => true,
  canCreate: (role: UserRole) => 
    role === UserRole.ADMIN || role === UserRole.MANAGER,
  canEdit: (role: UserRole) => 
    role === UserRole.ADMIN || role === UserRole.MANAGER,
  canDelete: (role: UserRole) => 
    role === UserRole.ADMIN || role === UserRole.MANAGER,
  canManageUsers: (role: UserRole) => 
    role === UserRole.ADMIN,
} as const;