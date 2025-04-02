import { Container } from 'typedi';
import DataLoader from 'dataloader';

import { ContainerKeys } from 'application/ioc/static/container-keys';
import { queryResults } from 'application/helpers/utility-functions.helper';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { GetUserArgs } from 'core/inputs/get-user.args';
import { ResponseResults } from 'core/types/response-results.type';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { REDIS_USER_LIST } from 'core/configs/decorators.config';
import { UserRepository } from 'domain/repositories/user.repository';
import { ResultMessage } from 'domain/enums/result-message.enum';
import { UserDto } from 'domain/dto/user.dto';
import { RoleDto } from 'domain/dto/role.dto';
import User from 'domain/entities/user.entity';
import { DataLoaderInfrastructure } from 'infrastructure/database/data-loader.infrastructure';

export interface IUserService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<UserDto>>;
  getBy (userData: GetUserArgs): Promise<ResponseResults<UserDto>>;
}

export class UserService implements IUserService {
  private _userRepository?: UserRepository;
  private _userDtoLoaderById?: DataLoader<number, UserDto>;

  private get userRepository (): UserRepository {
    if (!this._userRepository) {
      this._userRepository = Container.get(UserRepository);
    }

    return this._userRepository;
  }

  private get userDtoLoaderById (): DataLoader<number, UserDto> {
    if (!this._userDtoLoaderById) {
      this._userDtoLoaderById = Container.get<DataLoaderInfrastructure<User>>(ContainerKeys.USER_DATA_LOADER)
        .getDataLoader({ entity: User, Dto: UserDto, fetchField: 'id', relations: [{ relation: 'role', relationDto: RoleDto }] });
    }

    return this._userDtoLoaderById;
  }

  @RedisDecorator(REDIS_USER_LIST)
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

    return { payloads, total, result: ResultMessage.SUCCESS };
  }

  async getBy ({ id }: GetUserArgs) {
    const userDto = await this.userDtoLoaderById.load(id);

    return { payload: userDto, result: ResultMessage.SUCCESS };
  }
}
