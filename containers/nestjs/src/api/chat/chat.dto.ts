import {
  IsInt,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { Visibility } from 'src/chat/chat.entity';

//////////

export class ChatIdDto {
  @IsUUID()
  chat_id: string;
}

//////////

export class NameDto {
  @IsUUID()
  chat_id: string;
}

export class AddUserDto {
  @IsNotEmpty()
  chat_id: string;
}

export class OtherUserDto {
  @IsNotEmpty()
  chat_id: string;

  @IsNotEmpty()
  intra_id: number;
}

export class MuteDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  intra_id: number;

  @IsInt()
  @IsPositive()
  days: number;
}

export class PasswordDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  intra_id: number;
}

export class ChangeVisibilityDto {
  @IsUUID()
  chat_id: string;

  @IsEnum(Visibility)
  visibility: Visibility;

  @ValidateIf((x) => x.visibility === Visibility.PROTECTED)
  @IsNotEmpty()
  password: string | null;
}
