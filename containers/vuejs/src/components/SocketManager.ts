import io from 'socket.io-client'

interface SocketInstance {
  [namespace: string]: SocketIOClient.Socket | undefined
}

const sockets: SocketInstance = {}

const getSocketIOInstance = (namespace: string): SocketIOClient.Socket | undefined => {
  console.log('getSocketIOInstance called')
  console.log('namespace: ', namespace)
  if (!sockets[namespace]) {
    sockets[namespace] = io(import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_PORT)
  }
  return sockets[namespace]
}

const disconnectSocketIO = (namespace: string): void => {
  if (sockets[namespace]) {
    sockets[namespace]?.disconnect()
    delete sockets[namespace]
  }
}

export { getSocketIOInstance, disconnectSocketIO }

interface IgameResult {
  won: boolean
}
