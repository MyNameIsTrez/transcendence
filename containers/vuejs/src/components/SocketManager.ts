import io from 'socket.io-client'
import * as socketIoClient from 'socket.io-client'

// TODO: Replace "any" with Data struct typedef?
export const setupSocketManager = (render: (data: any) => void) => {
  const socket = io('ws://localhost:4242')
  socket.on('connect', () => {
    console.log('Connected')
  })
  socket.on('pong', (data: any) => {
    render(data)
  })
  const joinMatch = () => {
    socket.emit('joinMatch')
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
  return { joinMatch, disconnect, emitMovePaddle }
}
