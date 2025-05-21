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

  // ✅ Updated this to match what we're using in controllers
  photoUrl?: string;

  // ✅ Keep existing location structure
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

/**
 * Generate a unique user ID with a random string
 */
export const generateUserId = (): string => {
  return `user_${Math.random().toString(36).substring(2, 10)}`;
};

export {};
