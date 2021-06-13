export interface UserInterface {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  roles: string[];
  verification: string;
  verified: boolean;
  verificationExpires: Date;
  loginAttempts?: number;
  blockExpires?: Date;
  bankAccountNumber?: string;
  bankAccountName?: string;
}
