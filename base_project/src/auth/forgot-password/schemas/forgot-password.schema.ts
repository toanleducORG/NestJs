import { Document } from 'mongoose';
import validator from 'validator';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'forgotpasswords',
})
export class ForgotPasswordModel extends Document {
  @Prop({
    required: [true, 'EMAIL_IS_BLANK'],
    type: String,
    requierd: true,
  })
  email: string;

  @Prop({
    type: String,
    validate: validator.isUUID,
    requierd: true,
  })
  verification: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  firstUsed?: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  finalUsed?: boolean;

  @Prop({
    type: Date,
    requierd: true,
  })
  expires: Date;

  @Prop({
    type: String,
    requierd: true,
  })
  ip: string;

  @Prop({
    type: String,
    requierd: true,
  })
  browser: string;

  @Prop({
    type: String,
    requierd: true,
  })
  country: string;

  @Prop({
    type: String,
  })
  ipChanged?: string;

  @Prop({
    type: String,
  })
  browserChanged?: string;

  @Prop({
    type: String,
  })
  countryChanged?: string;
}

export const ForgotPasswordSchema =
  SchemaFactory.createForClass(ForgotPasswordModel);
