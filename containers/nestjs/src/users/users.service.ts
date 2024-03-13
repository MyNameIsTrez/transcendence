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
    user.intra_id = createUserDto.intra_id
    user.displayname = createUserDto.displayname
    user.email = createUserDto.email
    user.image_url = createUserDto.image_url

    return this.usersRepository.save(user)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  // TODO: Why isn't this async, unlike findAll()? Try removing "async" from findAll()
  findOne(intra_id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ intra_id: intra_id })
  }

  async remove(intra_id: number): Promise<void> {
    await this.usersRepository.delete(intra_id)
  }
}
