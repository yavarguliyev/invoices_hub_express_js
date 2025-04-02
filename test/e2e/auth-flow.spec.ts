import { Container } from 'typedi';
import { DeepPartial } from 'typeorm';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

import { ContainerHelper } from '../../src/application/ioc/helpers/container.helper';
import { ContainerItems } from '../../src/application/ioc/static/container-items';
import { AuthService } from '../../src/application/services/auth.service';
import { UserService } from '../../src/application/services/user.service';
import { SigninArgs } from '../../src/core/inputs/signin.args';
import { UserRepository } from '../../src/domain/repositories/user.repository';
import { RoleRepository } from '../../src/domain/repositories/role.repository';
import { Roles } from '../../src/domain/enums/roles.enum';
import Role from '../../src/domain/entities/role.entity';
import User from '../../src/domain/entities/user.entity';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Authentication Flow (E2E)', () => {
  let authService: AuthService;
  let userService: UserService;

  let mockUserRepository: jest.Mocked<Pick<UserRepository, 'findOne' | 'find' | 'save' | 'create'>>;
  let mockRoleRepository: jest.Mocked<Pick<RoleRepository, 'findOne' | 'find'>>;

  let testUser: User;
  let adminRole: Role;
  let authToken: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn()
    };

    mockRoleRepository = {
      findOne: jest.fn(),
      find: jest.fn()
    };

    const mockJwtPayload = {
      id: 1,
      email: 'admin@example.com',
      role: Roles.Admin,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    };

    (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');
    (jwt.decode as jest.Mock).mockReturnValue(mockJwtPayload);
    (jwt.verify as jest.Mock).mockReturnValue(mockJwtPayload);

    (compare as jest.Mock).mockResolvedValue(true);

    const roleData: DeepPartial<Role> = {
      name: Roles.Admin,
      users: []
    };

    adminRole = roleData as Role;

    const userData = {
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'hashedPassword',
      hashPassword: jest.fn(),
      role: adminRole,
      handleSoftDelete: jest.fn(),
      invoices: [],
      orders: []
    } as unknown as User;

    testUser = userData;

    jest.spyOn(Container, 'get').mockImplementation((token) => {
      if (token === UserRepository) {
        return mockUserRepository;
      }

      if (token === RoleRepository) {
        return mockRoleRepository;
      }

      return {};
    });

    authService = new AuthService();
    userService = new UserService();

    jest.spyOn(ContainerHelper, 'get').mockImplementation((token) => {
      if (token === ContainerItems.IAuthService) {
        return authService;
      }

      if (token === ContainerItems.IUserService) {
        return userService;
      }

      return {};
    });
  });

  it('should complete full authentication flow', async () => {
    mockUserRepository.findOne.mockResolvedValue(testUser);

    const signinArgs: SigninArgs = {
      email: 'admin@example.com',
      password: 'adminpass'
    };

    const loginResponse = await authService.signin(signinArgs);

    expect(loginResponse).toHaveProperty('accessToken');
    expect(loginResponse.accessToken).toBe('mock-jwt-token');
    expect(loginResponse).toHaveProperty('payload');
    expect(loginResponse.payload).toHaveProperty('id');
    expect(loginResponse.payload).toHaveProperty('email', 'admin@example.com');
    expect(loginResponse.payload).toHaveProperty('role', Roles.Admin);

    authToken = loginResponse.accessToken;

    const signoutResult = await authService.signout(`Bearer ${authToken}`);
    expect(signoutResult).toBe(true);
  });
});
