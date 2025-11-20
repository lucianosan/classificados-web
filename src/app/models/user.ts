export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  role?: 'admin' | 'user';
}
