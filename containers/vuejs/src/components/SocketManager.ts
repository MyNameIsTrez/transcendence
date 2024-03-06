import io from 'socket.io-client'

interface SocketInstance {
  [namespace: string]: SocketIOClient.Socket | undefined
}
const sockets: SocketInstance = {}

const initializeSocketIO = (namespace: string): void => {
  console.log('initializeSocketIO called')
  console.log('namespace: ', namespace)
  if (!sockets[namespace]) {
    sockets[namespace] = io('ws://localhost:4242')
  }
}

const getSocketIOInstance = (namespace: string): SocketIOClient.Socket | undefined => {
  return sockets[namespace]
}
const disconnectSocketIO = (namespace: string): void => {
  if (sockets[namespace]) {
    sockets[namespace]?.disconnect()
    delete sockets[namespace]
  }
}

export { initializeSocketIO, getSocketIOInstance, disconnectSocketIO }

interface IgameResult {
  won: boolean
}
