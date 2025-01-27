import { UserResultMessage } from 'value-objects/enums/user-result-message.enum';
import { UserDto } from 'value-objects/dto/user/user.dto';
import { RoleDto } from 'value-objects/dto/role/role.dto';

export class UserResultsDto {
  users?: UserDto[];
  user?: UserDto;
  role?: RoleDto;
  result: UserResultMessage;

  constructor (user: UserDto, role: RoleDto, result: UserResultMessage) {
    this.user = user;
    this.role = role;
    this.result = result;
  }
}
