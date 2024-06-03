import { Server, Socket } from 'socket.io';
import Lobby from './Lobby';
import { WsException } from '@nestjs/websockets';
import { UsersService } from '../users/users.service';
import { MatchService } from '../users/match.service';
import { Gamemode } from '../users/match.entity';

export default class LobbyManager {
  private readonly lobbies = new Map<Lobby['id'], Lobby>();
  public readonly intraIdToLobby = new Map<number, Lobby>();

  private readonly updateIntervalMs = 1000 / 60;

  constructor(
    private readonly server: Server,
    private readonly usersService: UsersService,
    private readonly matchService: MatchService,
  ) {}

  public async queue(client: Socket, gamemode: Gamemode) {
    if (this.isUserAlreadyInLobby(client.data)) {
      console.error(`User ${client.data.intra_id} is already in a lobby`);
      throw new WsException('Already in a lobby');
    }

    client.emit('inQueue', { inQueue: true });

    const lobby = this.getLobby(gamemode);
    await lobby.addClient(client);
    this.intraIdToLobby.set(client.data.intra_id, lobby);
  }

  public async createPrivateLobby(
    client: Socket,
    invitedIntraId: number,
    gamemode: Gamemode,
    clients: Map<number, Socket[]>,
  ) {
    if (this.isUserAlreadyInLobby(client.data)) {
      console.error(`User ${client.data.intra_id} is already in a lobby`);
      throw new WsException('Already in a lobby');
    }

    if (!(await this.usersService.hasUser(invitedIntraId))) {
      throw new WsException('Could not find user');
    }

    const invitedSockets = clients.get(invitedIntraId);
    if (!invitedSockets) {
      throw new WsException('Invited user is not online');
    }

    const lobby = new Lobby(
      gamemode,
      true,
      this.server,
      this.usersService,
      this.matchService,
    );

    lobby.inviterIntraId = client.data.intra_id;
    lobby.invitedIntraId = invitedIntraId;

    client.emit('inQueue', { inQueue: true });

    this.lobbies.set(lobby.id, lobby);
    await lobby.addClient(client);
    this.intraIdToLobby.set(client.data.intra_id, lobby);

    const invitations = await this.getInvitations(invitedIntraId);
    // TODO: This fails when the invited user is offline, since they won't have a socket active
    invitedSockets.forEach((socket) => {
      socket.emit('updateInvitations', invitations);
    });
  }

  private isUserAlreadyInLobby(user: any): boolean {
    return Array.from(this.lobbies.values()).some((lobby) =>
      lobby.hasUser(user),
    );
  }

  // Looping through all lobbies is theoretically inefficient,
  // but we can't just use the old approach of using an array
  // and checking if the last lobby only has 1 player.
  // This is because join() could accidentally join the wrong lobby
  // if it took a lobby_index instead of a lobby_id.
  private getLobby(gamemode: Gamemode): Lobby {
    // TODO: Update this to look for the correct gamemode lobby
    const notFullLobby = Array.from(this.lobbies.values()).find(
      (lobby) =>
        lobby.pong.gamemode === gamemode && !lobby.isFull() && !lobby.isPrivate,
    );
    if (notFullLobby) {
      console.log("Found a lobby that wasn't full");
      return notFullLobby;
    }

    const newLobby = new Lobby(
      gamemode,
      false,
      this.server,
      this.usersService,
      this.matchService,
    );
    this.lobbies.set(newLobby.id, newLobby);
    console.log('Created a new lobby');
    return newLobby;
  }

  public async removeClient(client: Socket) {
    const lobby = this.intraIdToLobby.get(client.data.intra_id);

    if (lobby) {
      // If a client disconnect while queueing, lobby.clients.size is 1
      const client_count = lobby.clients.size;

      if (client_count >= 2) {
        lobby.saveMatch(await this.usersService.findOne(client.data.intra_id));
        this.usersService.addLoss(client.data.intra_id);
      }

      lobby.removeClient(client);

      // If one of the clients disconnects, the other client wins
      lobby.emit('gameOver', true);

      if (client_count >= 2) {
        lobby.clients.forEach((otherClient) => {
          this.usersService.addWin(otherClient.data.intra_id);
        });
      }

      this.removeLobby(lobby);
    }
  }

  public updateLoop() {
    setInterval(() => {
      this.lobbies.forEach((lobby) => {
        lobby.update();
        if (lobby.didSomeoneWin()) {
          this.removeLobby(lobby);
        }
      });
    }, this.updateIntervalMs);
  }

  private removeLobby(lobby: Lobby) {
    lobby.clients.forEach((client) => {
      this.intraIdToLobby.delete(client.data.intra_id);
    });

    lobby.disconnectClients();
    this.lobbies.delete(lobby.id);
  }

  public async getInvitations(intra_id: number) {
    const lobbiesArray = await Array.from(this.lobbies.values());

    return await Promise.all(
      lobbiesArray.flatMap(async (lobby) =>
        lobby.isPrivate && lobby.invitedIntraId === intra_id
          ? {
              inviterIntraId: lobby.inviterIntraId,
              inviterName: await this.usersService.getUsername(
                lobby.inviterIntraId,
              ),
              gamemode: lobby.gamemode,
            }
          : [],
      ),
    );
  }

  public async acceptInvitation(
    client: Socket,
    acceptedIntraId: number,
    clients: Map<number, Socket[]>,
  ) {
    console.log('In acceptInvitation(), acceptedIntraId is', acceptedIntraId);

    if (!(await this.usersService.hasUser(acceptedIntraId))) {
      throw new WsException('Could not find user');
    }

    const acceptedSockets = clients.get(acceptedIntraId);
    if (!acceptedSockets || acceptedSockets.length < 1) {
      throw new WsException('Accepted user is not online');
    }

    client.emit('inQueue', { inQueue: true });

    // TODO: Why does this only update every browser tab of the user when the server was just restarted?
    const invitations = await this.getInvitations(client.data.intra_id);
    clients.get(client.data.intra_id).forEach((socket) => {
      socket.emit('updateInvitations', invitations);
    });

    const lobby = this.intraIdToLobby.get(acceptedIntraId);

    await lobby.addClient(client);
    this.intraIdToLobby.set(client.data.intra_id, lobby);
  }

  public async declineInvitation(
    client: Socket,
    declinedIntraId: number,
    clients: Map<number, Socket[]>,
  ) {
    console.log('In declineInvitation(), declinedIntraId is', declinedIntraId);

    if (!(await this.usersService.hasUser(declinedIntraId))) {
      throw new WsException('Could not find user');
    }

    const declinedSockets = clients.get(declinedIntraId);
    if (!declinedSockets || declinedSockets.length < 1) {
      throw new WsException('Declined user is not online');
    }

    this.removeClient(declinedSockets[0]);

    // TODO: Why does this only update every browser tab of the user when the server was just restarted?
    clients.get(declinedIntraId).forEach((socket) => {
      socket.emit('inQueue', { inQueue: false });
    });

    const invitations = await this.getInvitations(client.data.intra_id);
    clients.get(client.data.intra_id).forEach((socket) => {
      socket.emit('updateInvitations', invitations);
    });
  }
}
