export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  permissions: string[];
}

export interface Role {
  id: number;
  name: string;
}
