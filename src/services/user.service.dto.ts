import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { RedisDecorator } from 'decorators/redis.decorator';
import { EventPublisherDecorator } from 'decorators/event.publisher.decorator';
import { EVENTS } from 'value-objects/enums/events.enum';
import { UserRepository } from 'repositories/user.repository';
import { RoleRepository } from 'repositories/role.repository';
import { GetUserArgs } from 'value-objects/inputs/user/get-user.args';
import { CreateUserArgs } from 'value-objects/inputs/user/create-user.args';
import { UpdateUserArgs } from 'value-objects/inputs/user/update-user.args';
import { DeleteUserArgs } from 'value-objects/inputs/user/delete-user.args';
import { UserResultsDto } from 'value-objects/dto/user/user-results';
import { UserResultMessage } from 'value-objects/enums/user-result-message.enum';
import { UserDto } from 'value-objects/dto/user/user.dto';
import { REDIS_CACHE_KEYS } from 'value-objects/types/redis/redis-decorator.types';

export interface IUserService {
  get (): Promise<UserResultsDto>;
  getBy (userData: GetUserArgs): Promise<UserResultsDto>;
  create (userData: CreateUserArgs): Promise<UserResultsDto>;
  update (id: number, userData: UpdateUserArgs): Promise<UserResultsDto>;
  delete (userData: DeleteUserArgs): Promise<UserResultsDto>;
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
    const users = await this.userRepository.find();
    const userDtos = users.map((user) => plainToInstance(UserDto, user, { excludeExtraneousValues: true }));

    return { users: userDtos, result: UserResultMessage.SUCCEED };
  }

  async getBy ({ id }: GetUserArgs): Promise<UserResultsDto> {
    const user = await this.userRepository.findOneByOrFail({ id });
    const userDto = plainToInstance(UserDto, user, { excludeExtraneousValues: true });

    return { user: userDto, result: UserResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_CREATED })
  async create (userData: CreateUserArgs): Promise<UserResultsDto> {
    const { email, firstName, lastName, password, role } = userData;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      return { result: UserResultMessage.USER_EXISTS };
    }

    const userRole = await this.roleRepository.findOne({ where: { name: role } });
    if (!userRole) {
      return { result: UserResultMessage.ERROR };
    }

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password,
      role: userRole
    });

    const newUser = await this.userRepository.save(user);
    const userDto = plainToInstance(UserDto, newUser, { excludeExtraneousValues: true });

    return { user: userDto, result: UserResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_UPDATED })
  async update (id: number, userData: UpdateUserArgs): Promise<UserResultsDto> {
    const { email, firstName, lastName, role } = userData;

    const userToBeUpdated = await this.userRepository.findOneBy({ id });
    if (!userToBeUpdated) {
      return { result: UserResultMessage.NOT_FOUND };
    }

    if (email) userToBeUpdated.email = email;
    if (firstName) userToBeUpdated.firstName = firstName;
    if (lastName) userToBeUpdated.lastName = lastName;

    if (role) {
      const userRole = await this.roleRepository.findOne({ where: { name: role } });
      if (userRole) userToBeUpdated.role = userRole;
    }

    const updatedUser = await this.userRepository.save(userToBeUpdated);
    const userDto = plainToInstance(UserDto, updatedUser, { excludeExtraneousValues: true });

    return { user: userDto, result: UserResultMessage.SUCCEED };
  }

  @EventPublisherDecorator({ keyTemplate: REDIS_CACHE_KEYS.USER_GET_LIST, event: EVENTS.USER_DELETED })
  async delete (userData: DeleteUserArgs): Promise<UserResultsDto> {
    const { id } = userData;

    const existingUser = await this.userRepository.findOne({ where: { id } });
    if (!existingUser) {
      return { result: UserResultMessage.NOT_FOUND };
    }

    await this.userRepository.softDelete(id);
    return { result: UserResultMessage.SUCCEED };
  }
}
