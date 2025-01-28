import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { RoleRepository } from 'repositories/role.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { RoleResultsDto } from 'value-objects/dto/role/role-results.dto';
import { REDIS_CACHE_KEYS } from 'value-objects/types/redis/redis-decorator.types';
import { RoleDto } from 'value-objects/dto/role/role.dto';
import { ResultMessage } from 'value-objects/enums/result-message.enum';

export interface IRoleService {
  get (): Promise<RoleResultsDto>;
}

export class RoleService implements IRoleService {
  private roleRepository: RoleRepository;

  constructor () {
    this.roleRepository = Container.get(RoleRepository);
  }

  @RedisDecorator({ keyTemplate: REDIS_CACHE_KEYS.ROLE_GET_LIST })
  async get (): Promise<RoleResultsDto> {
    const roles = await this.roleRepository.find();
    const roleDtos = roles.map((role) => plainToInstance(RoleDto, role, { excludeExtraneousValues: true }));

    return { roles: roleDtos, result: ResultMessage.SUCCEED };
  }
}
