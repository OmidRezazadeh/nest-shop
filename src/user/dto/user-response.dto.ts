import { Exclude, Expose } from 'class-transformer';


export class UserResponseDto {
  @Expose() // ✅ Include this field
  id: number;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  role: { id: number; name: string };

  @Expose()
  profile?: { id: number; bio: string };

  @Expose()
  image?: string;

  @Exclude() // ❌ Exclude sensitive fields
  password?: string;

  @Exclude()
  refreshToken?: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
