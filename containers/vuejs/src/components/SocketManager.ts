import io from 'socket.io-client'
import { defineEmits } from 'vue'

const emit = defineEmits(['joinGame', 'gameOver', 'render'])

interface IgameResult {
  won: boolean
}

export const setupSocketManager = (render: (data: any) => void) => {
  const socket = io('ws://localhost:4242')
  socket.on('connect', () => {
    console.log('Connected')
  })
  socket.on('pong', (data: any) => {
    render(data)
    emit('render')
  })
  socket.on('gameOver', (data: IgameResult) => {
    emit('gameOver', data.won)
  })

  const joinGame = () => {
    console.log('Joining game')
    socket.emit('joinGame')
  }
  const disconnect = () => {
    socket.disconnect()
    console.log('Disconnected')
  }
  const emitMovePaddle = (code: string, keydown: boolean) => {
    let north: boolean | undefined
    if (!socket) {
      console.log('No socket')
      return
    }
    if (code === 'KeyW' || code === 'ArrowUp') {
      north = true
    } else if (code === 'KeyS' || code === 'ArrowDown') {
      north = false
    }
    if (north !== undefined) {
      socket.emit('movePaddle', { keydown: keydown, north: north })
    } else {
      console.log('No socket')
    }
  }
  return { joinGame, disconnect, emitMovePaddle }
}
