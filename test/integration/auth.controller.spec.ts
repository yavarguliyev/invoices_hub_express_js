import { Container } from 'typedi';
import { DeepPartial } from 'typeorm';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

import { ContainerHelper } from '../../src/application/ioc/helpers/container.helper';
import { ContainerItems } from '../../src/application/ioc/static/container-items';
import { AuthController } from '../../src/api/v1/auth.controller';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { SigninArgs } from '../../src/core/inputs/signin.args';
import { AuthService } from '../../src/application/services/auth.service';
import User from '../../src/domain/entities/user.entity';
import Role from '../../src/domain/entities/role.entity';
import { Roles } from '../../src/domain/enums/roles.enum';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController Integration Tests', () => {
  let authController: AuthController;
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<Pick<UserRepository, 'findOne'>>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findOne: jest.fn()
    };

    authService = new AuthService();

    jest.spyOn(Container, 'get').mockImplementation((token) => {
      if (token === UserRepository) {
        return mockUserRepository;
      }

      return {};
    });

    jest.spyOn(ContainerHelper, 'get').mockImplementation((token) => {
      if (token === ContainerItems.IAuthService) {
        return authService;
      }

      return {};
    });

    authController = new AuthController();
  });

  describe('signin', () => {
    it('should return token when credentials are valid', async () => {
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

      const result = await authController.signin(signinArgs);

      expect(result).toHaveProperty('accessToken', 'jwt-token');
      expect(result).toHaveProperty('payload');
      expect(result.payload).toHaveProperty('id');
      expect(result.payload).toHaveProperty('email', 'test@example.com');
      expect(result.payload).toHaveProperty('role', Roles.Standard);
    });

    it('should throw error when credentials are invalid', async () => {
      const signinArgs: SigninArgs = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(authController.signin(signinArgs)).rejects.toThrow();
    });
  });
});
