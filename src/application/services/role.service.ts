import { Container } from 'typedi';

import { queryResults } from 'application/helpers/utility-functions.helper';
import { RedisDecorator } from 'core/decorators/redis.decorator';
import { ResponseResults } from 'core/types/response-results.type';
import { redisCacheConfig } from 'core/configs/redis.config';
import { GetQueryResultsArgs } from 'core/inputs/get-query-results.args';
import { RoleRepository } from 'domain/repositories/role.repository';
import { RoleDto } from 'domain/dto/role.dto';
import { ResultMessage } from 'domain/enums/result-message.enum';

export interface IRoleService {
  get (query: GetQueryResultsArgs): Promise<ResponseResults<RoleDto>>;
}

export class RoleService implements IRoleService {
  private _roleRepository?: RoleRepository;

  private get roleRepository (): RoleRepository {
    if (!this._roleRepository) {
      this._roleRepository = Container.get(RoleRepository);
    }

    return this._roleRepository;
  }

  @RedisDecorator(redisCacheConfig.ROLE_LIST)
  async get (query: GetQueryResultsArgs) {
    const { payloads, total } = await queryResults({ repository: this.roleRepository, query, dtoClass: RoleDto });

    return { payloads, total, result: ResultMessage.SUCCEED };
  }
}
