import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';

import { EVENTS } from 'common/enums/events.enum';
import { REDIS_CACHE_KEYS } from 'common/types/decorator.types';
import { RedisDecorator } from 'decorators/redis.decorator';
import { EventPublisherDecorator } from 'decorators/event.publisher.decorator';
import { UserRepository } from 'repositories/user.repository';
import { RoleRepository } from 'repositories/role.repository';
import { GetUserArgs } from 'common/inputs/get-user.args';
import { CreateUserArgs } from 'common/inputs/create-user.args';
import { UpdateUserArgs } from 'common/inputs/update-user.args';
import { DeleteUserArgs } from 'common/inputs/delete-user.args';
import { ResultMessage } from 'common/enums/result-message.enum';
import { UserDto } from 'common/dto/user.dto';
import { NotFoundError, BadRequestError } from 'errors';
import { ResponseResults } from 'common/types/response-results.type';
import { RoleDto } from 'common/dto/role.dto';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { generateStrongPassword, queryResults } from 'helpers/utility-functions.helper';
import { UpdateUserPasswordArgs } from 'common/inputs/update-user-password.args';

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

  constructor () {
    this.userRepository = Container.get(UserRepository);
    this.roleRepository = Container.get(RoleRepository);
  }

  @RedisDecorator<UserDto>({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST })
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<UserDto>> {
    const { payloads, total } = await queryResults(this.userRepository, query, UserDto, { RelatedDtoClass: RoleDto, relationField: 'role' });

    return { payloads, total, result: ResultMessage.SUCCEED };
  }

  async getBy ({ id }: GetUserArgs): Promise<ResponseResults<UserDto>> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found.`, { id });
    }

    const role = await user.role;

    const userDto = plainToInstance(UserDto, user, { excludeExtraneousValues: true });
    userDto.role = plainToInstance(RoleDto, role, { excludeExtraneousValues: true });

    return { payload: userDto, result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_CREATED })
  async create (userData: CreateUserArgs): Promise<ResponseResults<UserDto>> {
    const { email, roleId } = userData;

    const existingUser = await this.userRepository.findOne({ where: { email }, withDeleted: true });
    if (existingUser) {
      throw new BadRequestError('User already exists with the provided email.', { email });
    }

    const userRole = await this.roleRepository.findOne({ where: { id: Number(process.env.STANDARD_ROLE_ID) } });
    if (!userRole) {
      throw new NotFoundError('Role not found.', { roleId });
    }

    const user = this.userRepository.create({ ...userData, role: userRole, password: generateStrongPassword() });
    await this.userRepository.save(user);

    // TODO: In the future, extend this functionality to send an email notification
    // to the user with their login credentials (email and generated password).

    return { result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_UPDATED })
  async update (id: number, userData: UpdateUserArgs): Promise<ResponseResults<UserDto>> {
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

    return { payload: userDto, result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_PASSWORD_UPDATED })
  async updatePassword (id: number, updatePasswordArgs: UpdateUserPasswordArgs): Promise<ResponseResults<UserDto>> {
    const { currentPassword, password, confirmPassword } = updatePasswordArgs;

    const userToBeUpdated = await this.userRepository.findOneBy({ id });
    if (!userToBeUpdated) {
      throw new NotFoundError(`User with ID ${id} not found.`, { id });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userToBeUpdated.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestError('Current password is incorrect.', { id });
    }

    if (password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.', { id });
    }

    userToBeUpdated.password = password;
    await this.userRepository.save(userToBeUpdated);

    return { result: ResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_DELETED })
  async delete ({ id }: DeleteUserArgs): Promise<ResponseResults<UserDto>> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw new NotFoundError(`User with ID ${id} not found.`, { id });
    }

    await this.userRepository.softDelete(id);
    return { result: ResultMessage.SUCCEED };
  }
}
