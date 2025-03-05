import { Container } from 'typedi';

import { queryResults } from 'application/helpers/utility-functions.helper';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'core/types/decorator.types';
import { ResponseResults } from 'core/types/response-results.type';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { RoleRepository } from 'domain/repositories/role.repository';
import { RoleDto } from 'domain/dto/role.dto';
import { ResultMessage } from 'domain/enums/result-message.enum';

export interface IRoleService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<RoleDto>>;
}

export class RoleService implements IRoleService {
  private roleRepository: RoleRepository;

  constructor () {
    this.roleRepository = Container.get(RoleRepository);
  }

  @RedisDecorator<RoleDto>({ keyTemplate: REDIS_CACHE_KEYS.ROLE_GET_LIST })
  async get (query: GetQueryResultsArgs) {
    const { payloads, total } = await queryResults({ repository: this.roleRepository, query, dtoClass: RoleDto });

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
