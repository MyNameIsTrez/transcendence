import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './user.entity'
import { UsersService } from './users.service'

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  // TODO: Idk if we need this, but it poses a mild security risk,
  // as this allows anyone to get the email address of any intra id
  // @Get(':intra_id')
  // findOne(@Param('intra_id') intra_id: number): Promise<User | null> {
  //   return this.usersService.findOne(intra_id)
  // }
}
