import { Exclude, Expose } from 'class-transformer';
import { Types } from 'mongoose';

export class UserEntity {
  fullName: string;
  email: string;
  bankAccountNumber?: string;
  bankAccountOwnerName?: string;
  roles: string[];
  verification?: string;
  verified?: boolean;
  verificationExpires?: Date;
  loginAttempts?: number;
  blockExpires?: Date;

  @Exclude()
  password: string;
  _id: Types.ObjectId;

  @Expose()
  get emailName(): string {
    return `${this.fullName}: ${this.email}`;
  }
  @Expose()
  get id(): string {
    return this._id.toString();
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
