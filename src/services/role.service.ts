import { Container } from 'typedi';
import { plainToInstance } from 'class-transformer';

import { RoleRepository } from 'repositories/role.repository';
import { RedisDecorator } from 'decorators/redis.decorator';
import { REDIS_CACHE_KEYS } from 'value-objects/types/decorator/decorator.types';
import { RoleDto } from 'value-objects/dto/role/role.dto';
import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { ResponseResults } from 'value-objects/types/services/response-results.type';

export interface IRoleService {
  get (): Promise<ResponseResults<RoleDto>>;
}

export class RoleService implements IRoleService {
  private roleRepository: RoleRepository;

  constructor () {
    this.roleRepository = Container.get(RoleRepository);
  }

  @RedisDecorator<RoleDto>({ keyTemplate: REDIS_CACHE_KEYS.ROLE_GET_LIST })
  async get (): Promise<ResponseResults<RoleDto>> {
    const roles = await this.roleRepository.find();
    const roleDtos = roles.map((role) => plainToInstance(RoleDto, role, { excludeExtraneousValues: true }));

    return { payloads: roleDtos, result: ResultMessage.SUCCEED };
  }
}
