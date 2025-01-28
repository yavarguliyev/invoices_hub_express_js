import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';
import { EntityNotFoundError } from 'typeorm';

import { EVENTS } from 'value-objects/enums/events.enum';
import { REDIS_CACHE_KEYS } from 'value-objects/types/redis/redis-decorator.types';
import { RedisDecorator } from 'decorators/redis.decorator';
import { EventPublisherDecorator } from 'decorators/event.publisher.decorator';
import { UserRepository } from 'repositories/user.repository';
import { RoleRepository } from 'repositories/role.repository';
import { GetUserArgs } from 'value-objects/inputs/user/get-user.args';
import { CreateUserArgs } from 'value-objects/inputs/user/create-user.args';
import { UpdateUserArgs } from 'value-objects/inputs/user/update-user.args';
import { DeleteUserArgs } from 'value-objects/inputs/user/delete-user.args';
import { UserResultsDto } from 'value-objects/dto/user/user-results.dto';
import { UserResultMessage } from 'value-objects/enums/user-result-message.enum';
import { UserDto } from 'value-objects/dto/user/user.dto';
import { NotFoundError, BadRequestError, DatabaseConnectionError } from 'errors';

export interface IUserService {
  get(): Promise<UserResultsDto>;
  getBy(userData: GetUserArgs): Promise<UserResultsDto>;
  create(userData: CreateUserArgs): Promise<UserResultsDto>;
  update(id: number, userData: UpdateUserArgs): Promise<UserResultsDto>;
  delete(userData: DeleteUserArgs): Promise<UserResultsDto>;
}

export class UserService implements IUserService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;

  constructor () {
    this.userRepository = Container.get(UserRepository);
    this.roleRepository = Container.get(RoleRepository);
  }

  @RedisDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST })
  async get (): Promise<UserResultsDto> {
    try {
      const users = await this.userRepository.find();
      const userDtos = users.map((user) => plainToInstance(UserDto, user, { excludeExtraneousValues: true }));

      return { users: userDtos, result: UserResultMessage.SUCCEED };
    } catch (error) {
      throw new DatabaseConnectionError({ operation: 'find', error });
    }
  }

  async getBy ({ id }: GetUserArgs): Promise<UserResultsDto> {
    try {
      const user = await this.userRepository.findOneByOrFail({ id });
      const userDto = plainToInstance(UserDto, user, { excludeExtraneousValues: true });

      return { user: userDto, result: UserResultMessage.SUCCEED };
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundError(`User with ID ${id} not found.`, { id });
      }

      throw new DatabaseConnectionError({ operation: 'findOneByOrFail', error });
    }
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_CREATED })
  async create (userData: CreateUserArgs): Promise<UserResultsDto> {
    const { email, roleId } = userData;

    try {
      const existingUser = await this.userRepository.findOne({ where: { email }, withDeleted: true });
      if (existingUser) {
        throw new BadRequestError('User already exists with the provided email.', { email });
      }

      const userRole = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!userRole) {
        throw new NotFoundError('Role not found.', { roleId });
      }

      const user = this.userRepository.create({ ...userData, role: userRole });
      const newUser = await this.userRepository.save(user);
      const userDto = plainToInstance(UserDto, newUser, { excludeExtraneousValues: true });

      return { user: userDto, result: UserResultMessage.SUCCEED };
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }

      throw new DatabaseConnectionError({ operation: 'save', error });
    }
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_UPDATED })
  async update (id: number, userData: UpdateUserArgs): Promise<UserResultsDto> {
    try {
      const userToBeUpdated = await this.userRepository.findOneBy({ id });
      if (!userToBeUpdated) {
        throw new NotFoundError(`User with ID ${id} not found.`, { id });
      }

      if (userData?.email) {
        const existingUser = await this.userRepository.findOne({ where: { email: userData?.email }, withDeleted: true });
        if (existingUser) {
          throw new BadRequestError('User already exists with the provided email.', { email: userData.email });
        }
      }

      Object.assign(userToBeUpdated, userData);
      const updatedUser = await this.userRepository.save(userToBeUpdated);
      const userDto = plainToInstance(UserDto, updatedUser, { excludeExtraneousValues: true });

      return { user: userDto, result: UserResultMessage.SUCCEED };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }

      throw new DatabaseConnectionError({ operation: 'save', error });
    }
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_DELETED })
  async delete ({ id }: DeleteUserArgs): Promise<UserResultsDto> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) {
        throw new NotFoundError(`User with ID ${id} not found.`, { id });
      }

      await this.userRepository.softDelete(id);
      return { result: UserResultMessage.SUCCEED };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new DatabaseConnectionError({ operation: 'softDelete', error });
    }
  }
}
