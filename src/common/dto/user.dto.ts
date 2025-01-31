import { Expose } from 'class-transformer';

import { RoleDto } from 'common/dto/role.dto';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  role: RoleDto;
}
