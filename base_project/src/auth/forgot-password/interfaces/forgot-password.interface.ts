export interface ForgotPasswordInterFace {
  email: string;
  verification: string;
  firstUsed?: boolean;
  finalUsed?: boolean;
  expires: Date;
  ip: string;
  browser: string;
  country: string;
  ipChanged?: string;
  browserChanged?: string;
  countryChanged?: string;
}
