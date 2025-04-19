// src/models/User.models.ts

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export const generateUserId = (): string => {
  return `user_${Math.random().toString(36).substring(2, 10)}`;
};
export {};
