export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  age?: number | null;
  gender?: string | null;
  bloodType?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  location?: {
    latitude: number | null;
    longitude: number | null;
    address?: string | null;
  } | null;
}

export const generateUserId = (): string => {
  return `user_${Math.random().toString(36).substring(2, 10)}`;
};

export {};
