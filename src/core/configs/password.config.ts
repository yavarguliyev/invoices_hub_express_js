import dotenv from 'dotenv';

dotenv.config();

const passwordConfig = {
  PASSWORD_LENGTH: Number(process.env.PASSWORD_LENGTH),
  PASSWORD_UPPERCASE: process.env.PASSWORD_UPPERCASE,
  PASSWORD_LOWERCASE: process.env.PASSWORD_LOWERCASE,
  PASSWORD_NUMBERS: process.env.PASSWORD_NUMBERS,
  PASSWORD_SPECIAL: process.env.PASSWORD_SPECIAL
} as const;

export default passwordConfig;
