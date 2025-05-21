

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  phone?: string;
  profilePhotoUrl?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    photoUrl?: string;
  };
}

export const generateUserId = (): string => {
  return `user_${Math.random().toString(36).substring(2, 10)}`;
};
export {};
