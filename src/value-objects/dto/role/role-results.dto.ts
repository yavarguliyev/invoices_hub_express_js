import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { RoleDto } from 'value-objects/dto/role/role.dto';

export class RoleResultsDto {
  roles?: RoleDto[];
  role?: RoleDto;
  result: ResultMessage;

  constructor (roles: RoleDto[], role: RoleDto, result: ResultMessage) {
    this.roles = roles;
    this.role = role;
    this.result = result;
  }
}
