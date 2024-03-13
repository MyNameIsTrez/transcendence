import io from 'socket.io-client'

interface SocketInstance {
  [namespace: string]: SocketIOClient.Socket | undefined
}
const sockets: SocketInstance = {}

const getSocketIOInstance = (namespace: string): SocketIOClient.Socket | undefined => {
  if (!sockets['ws://localhost:4242/']) {
    console.log(`created root`)
    sockets['ws://localhost:4242/'] = io('ws://localhost:4242/')
  }
  if (!sockets[namespace]) {
    console.log(`created ${namespace}`)
    sockets[namespace] = io(`ws://localhost:4242/${namespace}`)
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
