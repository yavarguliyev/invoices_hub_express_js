import { Expose } from 'class-transformer';

export class RoleDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}
