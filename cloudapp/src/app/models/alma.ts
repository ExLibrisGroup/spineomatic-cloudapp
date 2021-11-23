import { UserRoleTypes } from "./alma-user-role-types";

export interface User {
  primary_id: string;
  full_name: string;
  user_role: UserRole[];
}

export interface UserRole {
  status: Value;
  scope: Value;
  role_type: Value;
  parameter: UserRoleParameter[];
}

export interface UserRoleParameter {
  scope: Value;
  type: Value;
  value: Value;
}

export interface Value {
  value: string;
  desc: string;
}

export const canConfigure = (user: User) => {
  const roles = [
    UserRoleTypes.CATALOG_ADMINISTRATOR, 
    UserRoleTypes.GENERAL_ADMINISTRATOR,
  ];
  return user.user_role.some(r => roles.includes(parseInt(r.role_type.value)));
}
  