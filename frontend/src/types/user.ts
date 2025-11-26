export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  fullname: string;
  email: string;
  phone?: string | null;
  lineId?: string | null;
  role: UserRole;
}
