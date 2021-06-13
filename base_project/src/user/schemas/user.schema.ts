import { HookNextFunction, Document } from 'mongoose';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import validator from 'validator';
import { hash } from 'bcrypt';

@Schema({
  timestamps: true,
  collection: 'users',
})
export class UserModel extends Document {
  @Prop({
    type: String,
    minlength: 6,
    maxlength: 255,
    required: [true, 'NAME_IS_BLANK'],
  })
  fullName: string;

  @Prop({
    type: String,
    lowercase: true,
    validate: validator.isEmail,
    maxlength: 255,
    minlength: 6,
    unique: true,
    required: [true, 'EMAIL_IS_BLANK'],
  })
  email: string;

  @Prop({
    type: String,
    minlength: 5,
    maxlength: 1024,
    required: [true, 'PASSWORD_IS_BLANK'],
  })
  password: string;

  @Prop({
    type: String,
    maxlength: 32,
  })
  bankAccountNumber: string;

  @Prop({
    type: String,
    minlength: 6,
    maxlength: 255,
  })
  bankAccountOwnerName: string;

  @Prop({
    type: [String],
    default: ['user'],
    enum: ['user', 'admin'],
  })
  roles: string[];

  @Prop({
    type: String,
    validate: validator.isUUID,
  })
  verification: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  verified: boolean;

  @Prop({
    type: Date,
    default: Date.now,
  })
  verificationExpires: Date;

  @Prop({
    type: Number,
    default: 0,
  })
  loginAttempts: number;

  @Prop({
    type: Date,
    default: Date.now,
  })
  blockExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);

UserSchema.pre('save', async function (next: HookNextFunction) {
  if (!this.isModified('password')) {
    return next();
  }
  // tslint:disable-next-line:no-string-literal
  console.log(this['password']);

  const hashed = await hash(this['password'], 10);
  // tslint:disable-next-line:no-string-literal
  this['password'] = hashed;
  return next();
});
