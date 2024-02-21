import io from 'socket.io-client'
import * as socketIoClient from 'socket.io-client'

export const setupGameSocket = (render: (data: any) => void) => {
  let socket: socketIoClient.Socket | null = null
  const connect = () => {
    if (!socket) {
      socket = io('ws://localhost:4242')
    }
    if (socket) {
      socket.on('connect', () => {
        console.log('Connected')
      })
      socket.on('pong', (data: any) => {
        render(data)
        console.log(data)
      })
      socket.on('disconnect', () => {
        disconnect()
        console.log('Disconnected')
      })
      document.addEventListener('keydown', (event) => {
        const keyName = event.key
        console.log(keyName)
        if (socket) {
          socket.emit('pressed', keyName)
        } else {
          console.log('No socket')
        }
      })
      document.addEventListener('keyup', (event) => {
        const keyName = event.key
        console.log(keyName)
        if (socket) {
          socket.emit('released', keyName)
        } else {
          console.log('No socket')
        }
      })
    }
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
      socket.emit('movePaddle', { code, keydown })
    } else {
      console.log('No socket')
    }
  }
  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      console.log('Disconnected')
    } else {
      console.log('No socket')
    }
  }
  return { connect, disconnect, emitMovePaddle }
}
