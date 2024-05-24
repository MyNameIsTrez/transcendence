import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { UsersService } from 'src/users/users.service';
import { APong } from './APong';
import NormalPong from './NormalPong';
import SpecialPong from './SpecialPong';
import { MatchService } from '../users/match.service';
import { User } from '../users/user.entity';

export default class Lobby {
  public readonly id: string = uuid();

  private readonly maxClients = 2;

  public readonly clients = new Map<string, Socket>();

  private leftPlayerIntraId: number;
  private rightPlayerIntraId: number;

  public pong: APong;

  private readonly gamemodes: Map<string, (scoreToWin: number) => APong> =
    new Map([
      ['normal', (scoreToWin: number) => new NormalPong(scoreToWin)],
      ['special', (scoreToWin: number) => new SpecialPong(scoreToWin)],
    ]);

  private gameHasStarted = false;

  constructor(
    readonly mode: string,
    private readonly server: Server,
    private configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly matchService: MatchService,
  ) {
    console.log('Initializing lobby with mode:', mode);
    // console.log('gamemodes', this.gamemodes);
    this.pong = this.gamemodes.get(mode)(1);
  }

  private getClientKey(client: Socket) {
    if (this.configService.get('DEBUG')) {
      return client.data.intra_id + '-' + client.id;
    }
    return client.data.intra_id;
  }

  public async addClient(client: Socket) {
    // console.log(
    //   `In Lobby ${this.id} its addClient(), user ${client.data.intra_id} was added`,
    // );
    client.data.playerIndex = this.clients.size;

    if (client.data.playerIndex === 0) {
      this.leftPlayerIntraId = client.data.intra_id;
    } else {
      this.rightPlayerIntraId = client.data.intra_id;
    }

    // console.log('Adding user', client.data);
    this.clients.set(this.getClientKey(client), client);

    client.join(this.id);

    // TODO: Maybe add a countdown when game starts?
    if (this.isFull()) {
      this.gameHasStarted = true;
      this.emit('gameStart');
    }
  }

  public removeClient(client: Socket) {
    // console.log(
    //   `In Lobby ${this.id} its removeClient(), user ${client.data.intra_id} was removed`,
    // );
    this.clients.delete(this.getClientKey(client));
    client.leave(this.id);
    client.data.lobby = undefined;
  }

  public hasUser(user: any) {
    return this.clients.has(user.intra_id);
  }

  public isFull() {
    return this.clients.size >= this.maxClients;
  }

  public update() {
    // console.log(this.clients.size);
    if (!this.gameHasStarted) {
      return;
    }
    // console.log('In game loop');

    this.pong.update();

    this.emit('pong', this.pong.getData());

    if (this.pong.didSomeoneWin()) {
      this.saveMatch();

      const winnerIndex = this.pong.getWinnerIndex();

      this.clients.forEach(async (client) => {
        if (client.data.playerIndex === this.pong.getWinnerIndex()) {
          this.usersService.addWin(client.data.intra_id);
        } else {
          this.usersService.addLoss(client.data.intra_id);
        }

        client.emit('gameOver', client.data.playerIndex === winnerIndex);
      });
    }
  }

  public didSomeoneWin() {
    return this.pong.didSomeoneWin();
  }

  public disconnectClients() {
    this.clients.forEach((client) => {
      this.removeClient(client);
    });
  }

  public emit(event: string, payload?: any) {
    // console.log(
    //   `In Lobby ${this.id} its emit(), emitting to ${this.clients.size} clients`,
    // );
    this.server.to(this.id).emit(event, payload);
  }

  public movePaddle(playerIndex: number, keydown: boolean, north: boolean) {
    if (!this.gameHasStarted) {
      return;
    }

    this.pong.movePaddle(playerIndex, keydown, north);
  }

  public async saveMatch() {
    await this.matchService.create(
      await this.usersService.findOne(this.leftPlayerIntraId),
      await this.usersService.findOne(this.rightPlayerIntraId),
      this.pong.getLeftPlayerScore(),
      this.pong.getRightPlayerScore(),
    );
  }
}
