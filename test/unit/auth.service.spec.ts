import { Container } from 'typedi';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DeepPartial } from 'typeorm';

import { AuthService } from '../../src/application/services/auth.service';
import { SigninArgs } from '../../src/core/inputs/signin.args';
import { NotAuthorizedError } from '../../src/core/errors/not-authorized-error'
import { UserRepository } from '../../src/domain/repositories/user.repository';
import User from '../../src/domain/entities/user.entity';
import Role from '../../src/domain/entities/role.entity';
import { Roles } from '../../src/domain/enums/roles.enum';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<Pick<UserRepository, 'findOne'>>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findOne: jest.fn()
    };

    jest.spyOn(Container, 'get').mockImplementation((token) => {
      if (token === UserRepository) {
        return mockUserRepository;
      }

      return {};
    });

    authService = new AuthService();
  });

  describe('signin', () => {
    it('should throw NotAuthorizedError when user is not found', async () => {
      const signinArgs: SigninArgs = {
        email: 'test@example.com',
        password: 'password123'
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authService.signin(signinArgs))
        .rejects
        .toThrow(NotAuthorizedError);
    });

    it('should throw NotAuthorizedError when password is incorrect', async () => {
      const signinArgs: SigninArgs = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      const mockRole: DeepPartial<Role> = {
        name: Roles.Standard
      };

      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        hashPassword: jest.fn(),
        role: mockRole,
        handleSoftDelete: jest.fn(),
        invoices: [],
        orders: []
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signin(signinArgs))
        .rejects
        .toThrow(NotAuthorizedError);
    });

    it('should return login response with token when credentials are valid', async () => {
      const signinArgs: SigninArgs = {
        email: 'test@example.com',
        password: 'correctPassword'
      };

      const mockRole: DeepPartial<Role> = {
        name: Roles.Standard
      };

      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword',
        hashPassword: jest.fn(),
        role: mockRole,
        handleSoftDelete: jest.fn(),
        invoices: [],
        orders: []
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('jwt-token');

      const result = await authService.signin(signinArgs);

      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('payload');
      expect(result.payload).toHaveProperty('id');
      expect(result.payload).toHaveProperty('email', 'test@example.com');
      expect(result.payload).toHaveProperty('role', Roles.Standard);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: signinArgs.email } });
      expect(compare).toHaveBeenCalledWith(signinArgs.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalled();
    });
  });
});
