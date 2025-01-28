import { ResultMessage } from 'value-objects/enums/result-message.enum';
import { UserDto } from 'value-objects/dto/user/user.dto';
import { RoleDto } from 'value-objects/dto/role/role.dto';

export class UserResultsDto {
  users?: UserDto[];
  user?: UserDto;
  role?: RoleDto;
  result: ResultMessage;

  constructor (users: UserDto[], user: UserDto, role: RoleDto, result: ResultMessage) {
    this.users = users;
    this.user = user;
    this.role = role;
    this.result = result;
  }
}
