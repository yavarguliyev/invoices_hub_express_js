import { Container } from 'typedi';

import { RoleRepository } from 'repositories/role.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'common/types/decorator.types';
import { RoleDto } from 'common/dto/role.dto';
import { ResultMessage } from 'common/enums/result-message.enum';
import { ResponseResults } from 'common/types/response-results.type';
import { GetQueryResultsArgs } from 'common/inputs/get-query-results.args';
import { queryResults } from 'helpers/utility-functions.helper';

export interface IRoleService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<RoleDto>>;
}

export class RoleService implements IRoleService {
  private roleRepository: RoleRepository;

  constructor () {
    this.roleRepository = Container.get(RoleRepository);
  }

  @RedisDecorator<RoleDto>({ keyTemplate: REDIS_CACHE_KEYS.ROLE_GET_LIST })
  async get (query: GetQueryResultsArgs): Promise<ResponseResults<RoleDto>> {
    const { payloads, total } = await queryResults(this.roleRepository, query, RoleDto);

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
