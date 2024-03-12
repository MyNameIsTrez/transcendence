import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket
} from '@nestjs/websockets'
import { Socket } from 'socket.io'
import { Server } from 'http'
import { Pong } from './pong'

// The cors setting prevents this error:
// "Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource"
@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway {
  @WebSocketServer()
  server!: Server

  games: Array<Pong> = []
  id_to_game = new Map<string, Pong>()

  handleConnection(client: Socket) {
    console.log('Handle connection called')
  }

  handleDisconnect(client: Socket) {
    console.log('Something tried to disconnect')
    const game = this.id_to_game.get(client.id)
    if (game === undefined) {
      console.log(`id_to_game.get has gone terribly wrong in handle disconnect`)
    } else if (game._leftPlayer._socket !== null && game._leftPlayer._socket.id === client.id) {
      game._rightPlayer._socket?.emit(`gameOver`, 1)
      for (let i = 0; i < this.games.length; i++) {
        if (this.games[i] === game) {
          this.games.splice(i, 1) // Do I need to do anything else to propely delete the game? I understand that TS hsa a garbage collector but I just want to make sure - Victor
          console.log(`Player 1 has left lobby ${i}, lobby has been disbanded`)
          break
        }
      }
    } else if (game._rightPlayer._socket !== null && game._rightPlayer._socket.id === client.id) {
      // This can be an `else` but this leaves flexibility for spectators
      game._leftPlayer._socket?.emit(`gameOver`, 1)
      for (let i = 0; i < this.games.length; i++) {
        if (this.games[i] === game) {
          this.games.splice(i, 1) // Do I need to do anything else to propely delete the game? I understand that TS hsa a garbage collector but I just want to make sure - Victor
          console.log(`Player 2 has left lobby ${i}, lobby has been disbanded`)
          break
        }
      }
    }
  }

  afterInit() {
    // Main loop of games
    const interval_ms = 1000 / 60
    setInterval(() => {
      for (let i = 0; i < this.games.length && this.games[i]._rightPlayer._socket != null; i++) {
        const game = this.games[i]
        game.updateElements()
        if (game.checkGameOver()) {
          const leftResult = game.getLeftResult()
          const rightResult = game.getRightResult()
          game._leftPlayer._socket?.emit(`gameOver`, leftResult)
          game._rightPlayer._socket?.emit(`gameOver`, rightResult)
          this.games.splice(i, 1) //TODO: Does this not fuck with memory? - Saladin?
        } else {
          const data = game.getData()
          game._leftPlayer._socket?.emit(`pong`, data)
          game._rightPlayer._socket?.emit(`pong`, data)
        }
      }
    }, interval_ms)
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data
  }

  @SubscribeMessage('joinGame')
  async joinGame(@ConnectedSocket() client: Socket) {
    const games_count = this.games.length

    // If a player could join an existing lobby -> join it
    if (games_count !== 0 && this.games[games_count - 1]._rightPlayer._socket === null) {
      this.games[games_count - 1]._rightPlayer._socket = client
      this.id_to_game.set(client.id, this.games[games_count - 1])
      this.games[games_count - 1]._leftPlayer._socket?.emit(`gameStart`)
      this.games[games_count - 1]._rightPlayer._socket?.emit(`gameStart`)

      console.log(`Player 2 has joined lobby ${games_count - 1}`)
    } else {
      // If a player could not join an existing lobby -> create a new lobby
      this.games.push(new Pong())
      this.games[games_count]._leftPlayer._socket = client
      this.id_to_game.set(client.id, this.games[games_count])
      console.log(`Player 1 has created lobby ${games_count}`)
    }
  }

  @SubscribeMessage('movePaddle')
  async movePaddle(
    @ConnectedSocket() client: Socket,
    @MessageBody('keydown') keydown: boolean,
    @MessageBody('north') north: boolean
  ) {
    const game = this.id_to_game.get(client.id)
    if (game === undefined) {
      console.log(`id_to_game.get has gone terribly wrong in movePaddle`)
    } else if (game._leftPlayer._socket !== null && game._leftPlayer._socket.id === client.id) {
      game.movePaddle(game._leftPlayer.paddle, keydown, north)
    } else if (game._rightPlayer._socket !== null && game._rightPlayer._socket.id === client.id) {
      // This can be an `else` but this leaves flexibility for spectators
      game.movePaddle(game._rightPlayer.paddle, keydown, north)
    }
  }
}
