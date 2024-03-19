import io from 'socket.io-client'

const disconnectSockets = (): void => {
  chatSocket.disconnect()
  gameSocket.disconnect()
  rootSocket.disconnect()
}

const createSocketNamespace = (namespace: string) => {
  return io(import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_PORT + '/' + namespace)
}

const rootSocket = createSocketNamespace('')
const gameSocket = createSocketNamespace('game')
const chatSocket = createSocketNamespace('chat')

export { disconnectSockets, gameSocket, chatSocket, rootSocket }
