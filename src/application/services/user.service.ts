import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';
import DataLoader from 'dataloader';

import { EVENTS } from 'domain/enums/events.enum';
import { REDIS_CACHE_KEYS } from 'core/types/decorator.types';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { EventPublisherDecorator } from 'core/decorators/event-publisher.decorator';
import { UserRepository } from 'domain/repositories/user.repository';
import { RoleRepository } from 'domain/repositories/role.repository';
import { GetUserArgs } from 'core/inputs/get-user.args';
import { CreateUserArgs } from 'core/inputs/create-user.args';
import { UpdateUserArgs } from 'core/inputs/update-user.args';
import { DeleteUserArgs } from 'core/inputs/delete-user.args';
import { ResultMessage } from 'domain/enums/result-message.enum';
import { UserDto } from 'domain/dto/user.dto';
import { NotFoundError, BadRequestError } from 'core/errors';
import { ResponseResults } from 'core/types/response-results.type';
import { RoleDto } from 'domain/dto/role.dto';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { generateStrongPassword, queryResults } from 'application/helpers/utility-functions.helper';
import { UpdateUserPasswordArgs } from 'core/inputs/update-user-password.args';
import { DataLoaderInfrastructure } from 'infrastructure/data-loader.infrastructure';
import User from 'domain/entities/user.entity';
import config from 'core/configs/app.config';

export interface IUserService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<UserDto>>;
  getBy (userData: GetUserArgs): Promise<ResponseResults<UserDto>>;
  create (userData: CreateUserArgs): Promise<ResponseResults<UserDto>>;
  update (id: number, userData: UpdateUserArgs): Promise<ResponseResults<UserDto>>;
  updatePassword (id: number, updatePasswordArgs: UpdateUserPasswordArgs): Promise<ResponseResults<UserDto>>;
  delete (userData: DeleteUserArgs): Promise<ResponseResults<UserDto>>;
}

export class UserService implements IUserService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;

  private userDtoLoaderById: DataLoader<number, UserDto>;

  constructor () {
    this.userRepository = Container.get(UserRepository);
    this.roleRepository = Container.get(RoleRepository);

    this.userDtoLoaderById = DataLoaderInfrastructure.getDataLoader({
      entity: User,
      repository: this.userRepository,
      Dto: UserDto,
      fetchField: 'id',
      relations: [
        {
          relation: 'role',
          relationDto: RoleDto
        }
      ]
    });
  }

  @RedisDecorator<UserDto>({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST })
  async get (query: GetQueryResultsArgs) {
    const { payloads, total } = await queryResults({
      repository: this.userRepository,
      query,
      dtoClass: UserDto,
      relatedEntity: {
        RelatedDtoClass: RoleDto,
        relationField: 'role'
      }
    });

    return { payloads, total, result: ResultMessage.SUCCEED };
  }

  async getBy ({ id }: GetUserArgs) {
    const userDto = await this.userDtoLoaderById.load(id);

    return { payload: userDto, result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_CREATED })
  async create (userData: CreateUserArgs) {
    const { email, roleId } = userData;

    const existingUser = await this.userRepository.findOne({ where: { email }, withDeleted: true });
    if (existingUser) {
      throw new BadRequestError('User already exists with the provided email.', { errorField: userData.email });
    }

    const userRole = await this.roleRepository.findOne({ where: { id: config.STANDARD_ROLE_ID } });
    if (!userRole) {
      throw new NotFoundError('Role not found.', { resourceId: roleId });
    }

    const user = this.userRepository.create({ ...userData, role: userRole, password: generateStrongPassword({}) });
    await this.userRepository.save(user);

    // TODO: In the future, extend this functionality to send an email notification
    // to the user with their login credentials (email and generated password).

    return { result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_UPDATED })
  async update (id: number, userData: UpdateUserArgs) {
    const userToBeUpdated = await this.userRepository.findOneBy({ id });
    if (!userToBeUpdated) {
      throw new NotFoundError(`User with ID ${id} not found.`, { resourceId: id });
    }

    if (userData?.email) {
      const existingUser = await this.userRepository.findOne({ where: { email: userData?.email }, withDeleted: true });
      if (existingUser) {
        throw new BadRequestError('User already exists with the provided email.', { errorField: userData.email });
      }
    }

    Object.assign(userToBeUpdated, userData);

    const updatedUser = await this.userRepository.save(userToBeUpdated);
    const userDto = plainToInstance(UserDto, updatedUser, { excludeExtraneousValues: true }) as UserDto;

    this.userDtoLoaderById.clear(id);

    return { payload: userDto, result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_PASSWORD_UPDATED })
  async updatePassword (id: number, updatePasswordArgs: UpdateUserPasswordArgs) {
    const { currentPassword, password, confirmPassword } = updatePasswordArgs;

    const userToBeUpdated = await this.userRepository.findOneBy({ id });
    if (!userToBeUpdated) {
      throw new NotFoundError(`User with ID ${id} not found.`, { resourceId: id });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userToBeUpdated.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestError('Current password is incorrect.', { errorField: id });
    }

    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.', { errorField: id });
    }

    userToBeUpdated.password = password;
    await this.userRepository.save(userToBeUpdated);

    this.userDtoLoaderById.clear(id);

    return { result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_DELETED })
  async delete ({ id }: DeleteUserArgs) {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found.`, { resourceId: id });
    }

    await this.userRepository.softDelete(id);
    this.userDtoLoaderById.clear(id);

    return { result: ResultMessage.SUCCEED };
  }
}
