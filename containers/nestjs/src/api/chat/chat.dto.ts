import {
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateIf,
  IsPositive,
  IsInt,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';

import { Visibility } from 'src/chat/chat.entity';

//////////

export class ChatIdDto {
  @IsUUID()
  chat_id: string;
}

export class MuteDto {
  @IsInt()
  @IsPositive()
  intra_id: number;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class IntraIdDto {
  @IsInt()
  @IsPositive()
  intra_id: number;
}

export class EditDto {
  @IsNotEmpty({
    message: 'Name should not be empty',
  })
  @MaxLength(14, {
    message: 'Name exceeds character limit of 14',
  })
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @IsEnum(Visibility)
  visibility: Visibility;

  @ValidateIf((x) => x.visibility === Visibility.PROTECTED)
  @IsNotEmpty()
  password: string;
}

//////////

// TODO: Get rid of all of these

export class AddUserDto {
  @IsNotEmpty()
  chat_id: string;
}

export class OtherUserDto {
  @IsNotEmpty()
  chat_id: string;

  @IsInt()
  @IsPositive()
  intra_id: number;
}

export class PasswordDto {
  @IsUUID()
  chat_id: string;

  @IsNotEmpty()
  password: string;

  @IsInt()
  @IsPositive()
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
