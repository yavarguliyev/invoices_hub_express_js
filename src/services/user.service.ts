import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { EVENTS } from 'value-objects/enums/events.enum';
import { REDIS_CACHE_KEYS } from 'value-objects/types/decorator/decorator.types';
import { RedisDecorator } from 'decorators/redis.decorator';
import { EventPublisherDecorator } from 'decorators/event.publisher.decorator';
import { UserRepository } from 'repositories/user.repository';
import { RoleRepository } from 'repositories/role.repository';
import { GetUserArgs } from 'value-objects/inputs/user/get-user.args';
import { CreateUserArgs } from 'value-objects/inputs/user/create-user.args';
import { UpdateUserArgs } from 'value-objects/inputs/user/update-user.args';
import { DeleteUserArgs } from 'value-objects/inputs/user/delete-user.args';
import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { UserDto } from 'value-objects/dto/user/user.dto';
import { NotFoundError, BadRequestError } from 'errors';
import { ResponseResults } from 'value-objects/types/services/response-results.type';
import { RoleDto } from 'value-objects/dto/role/role.dto';
import { GetQueryResultsArgs } from 'value-objects/inputs/query-results/get-query-results.args';
import { queryResults } from 'helpers/utility-functions.helper';

export interface IUserService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<UserDto>>;
  getBy (userData: GetUserArgs): Promise<ResponseResults<UserDto>>;
  create (userData: CreateUserArgs): Promise<ResponseResults<UserDto>>;
  update (id: number, userData: UpdateUserArgs): Promise<ResponseResults<UserDto>>;
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

    const userRole = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!userRole) {
      throw new NotFoundError('Role not found.', { roleId });
    }

    const user = this.userRepository.create({ ...userData, role: userRole });
    const newUser = await this.userRepository.save(user);
    const userDto = plainToInstance(UserDto, newUser, { excludeExtraneousValues: true });

    return { payload: userDto, result: ResultMessage.SUCCEED };
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
