import { Matches } from 'class-validator';

export const PasswordStrengthDecorator = () => {
  return Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, {
    message: 'Password must include uppercase, lowercase, number, and special character.'
  });
};
