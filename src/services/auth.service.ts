import { Container } from 'typedi';
import { compare } from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

import { UserRepository } from 'repositories/user.repository';
import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { SigninArgs } from 'value-objects/inputs/auth/signin.args';
import { NotAuthorizedError } from 'errors';
import { LoginResponse } from 'value-objects/types/auth/login-response.type';
import { GenerateLoginResponse } from 'value-objects/types/auth/generate-login-response.type';

export interface IAuthService {
  signin (args: SigninArgs): Promise<LoginResponse>;
  signout (): Promise<boolean>;
}

export class AuthService implements IAuthService {
  private userRepository: UserRepository;

  constructor () {
    this.userRepository = Container.get(UserRepository);
  }

  async signin (args: SigninArgs): Promise<LoginResponse> {
    const { email, password } = args;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotAuthorizedError();
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new NotAuthorizedError();
    }

    return await this.generateLoginResponse({ id: user.id, email });
  }

  async signout (): Promise<boolean> {
    return true;
  }

  private async generateLoginResponse ({ id, email }: GenerateLoginResponse) {
    const payload = { id, email };

    const secretKey = process.env.JWT_SECRET_KEY!;
    const expiresIn = process.env.JWT_EXPIRES_IN!;

    const validatedExpiresIn = !isNaN(Number(expiresIn)) ? Number(expiresIn) : (expiresIn as SignOptions['expiresIn']);

    const signOptions: SignOptions = { expiresIn: validatedExpiresIn };
    const accessToken = jwt.sign(payload, secretKey, signOptions);
    const response: LoginResponse = { accessToken, payload, results: ResultMessage.SUCCEED };

    return response;
  }
}
