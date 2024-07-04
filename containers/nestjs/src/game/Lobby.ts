import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import { UserService } from '../user/user.service';
import { APong } from './APong';
import NormalPong from './NormalPong';
import SpecialPong from './SpecialPong';
import { MatchService } from '../user/match.service';
import { WsException } from '@nestjs/websockets';
import { User } from '../user/user.entity';
import { Gamemode } from '../user/match.entity';
import { ConfigService } from '@nestjs/config';
import UserSockets from 'src/user/user.sockets';

export default class Lobby {
  public readonly id: string = uuid();
  private _isSaving = false;

  private readonly maxClients = 2;

  public readonly clients = new Map<number, Socket>();

  public inviterIntraId: number | null = null;
  public invitedIntraId: number | null = null;

  private leftPlayerIntraId: number;
  private rightPlayerIntraId: number;

  public pong: APong;

  private readonly gamemodes: Map<string, (scoreToWin: number) => APong> =
    new Map([
      [Gamemode.NORMAL, (scoreToWin: number) => new NormalPong(scoreToWin)],
      [Gamemode.SPECIAL, (scoreToWin: number) => new SpecialPong(scoreToWin)],
    ]);

  public gameHasStarted = false;

  constructor(
    readonly gamemode: Gamemode,
    readonly isPrivate: boolean,
    private readonly server: Server,
    private readonly userService: UserService,
    private readonly matchService: MatchService,
    private readonly configService: ConfigService,
    private readonly userSockets: UserSockets,
  ) {
    if (!this.gamemodes.has(gamemode)) {
      throw new WsException('Requested gamemode does not exist');
    }
    this.pong = this.gamemodes.get(gamemode)(
      this.configService.get('SCORE_TO_WIN'),
    );
  }

  public async addClient(client: Socket) {
    client.data.playerIndex = this.clients.size;

    if (client.data.playerIndex === 0) {
      this.leftPlayerIntraId = client.data.intra_id;
    } else {
      this.rightPlayerIntraId = client.data.intra_id;
    }

    this.clients.set(client.data.intra_id, client);

    await client.join(this.id);

    if (this.isFull()) {
      this.gameHasStarted = true;
      this.emit('gameStart');
      Array.from(this.clients.keys()).forEach(async (intra_id) => {
        const user = await this.userService.findOne(intra_id, {
          friends: true,
        });
        if (user) {
          user.friends.forEach((friend) => {
            this.userSockets.emitToClient(
              friend.intra_id,
              'gamingFriend',
              intra_id,
            );
          });
        }
      });
    }
  }

  public async removeClient(client: Socket) {
    this.clients.delete(client.data.intra_id);
    await client.leave(this.id);
  }

  public hasUser(intra_id: number) {
    return this.clients.has(intra_id);
  }

  public isFull() {
    return this.clients.size >= this.maxClients;
  }

  public async update(): Promise<boolean> {
    this.pong.update();

    this.emit('pong', this.pong.getData());

    if (this.pong.didSomeoneWin()) {
      const winnerIndex = this.pong.getWinnerIndex();
      this.clients.forEach(async (client) => {
        client.emit(
          'gameOver',
          client.data.playerIndex === this.pong.getWinnerIndex(),
        );
      });

      if (this._isSaving) {
        return false;
      }
      this._isSaving = true;
      await this.saveMatch(null);

      this.clients.forEach(async (client) => {
        if (client.data.playerIndex === winnerIndex) {
          await this.userService.addWin(client.data.intra_id);
        } else {
          await this.userService.addLoss(client.data.intra_id);
        }
      });
      return true;
    }
    return false;
  }

  public didSomeoneWin() {
    return this.pong.didSomeoneWin();
  }

  public async disconnectClients() {
    await this.clients.forEach(async (client) => {
      await this.removeClient(client);
    });
  }

  public emit(event: string, payload?: any) {
    this.server.to(this.id).emit(event, payload);
  }

  public movePaddle(playerIndex: number, keydown: boolean, north: boolean) {
    if (!this.gameHasStarted) {
      return;
    }

    this.pong.movePaddle(playerIndex, keydown, north);
  }

  public async saveMatch(disconnectedPlayer: User | null) {
    await this.matchService.create(
      await this.userService.findOne(this.leftPlayerIntraId),
      await this.userService.findOne(this.rightPlayerIntraId),
      disconnectedPlayer,
      this.pong.getLeftPlayerScore(),
      this.pong.getRightPlayerScore(),
      this.pong.gamemode,
    );
  }
}
