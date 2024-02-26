import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
// TODO: Try having this Repository imported alongside the above line's InjectRepository
import { Repository } from 'typeorm'
import { CreateUserDto } from './dto/create-user.dto'
import { User } from './user.entity'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User()
    user.firstName = createUserDto.firstName
    user.lastName = createUserDto.lastName

    return this.usersRepository.save(user)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  // TODO: Why isn't this async, unlike findAll()? Try removing "async" from findAll()
  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: id })
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id)
  }
}
