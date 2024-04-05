// TODO: Use decorators to do stuff like @IsEmail() and @IsNotEmpty()?: https://docs.nestjs.com/techniques/validation#auto-validation
export class CreateUserDto {
  intra_id!: number;
  displayname!: string;
  email!: string;
  image_url!: string;
}
