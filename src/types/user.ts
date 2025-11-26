export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
}
