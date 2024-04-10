import { io, Socket } from 'socket.io-client'

let gameSocket: Socket
let chatSocket: Socket

const initGameSocket = (opts: any) => {
  gameSocket = getSocket('/game', opts)
}

const initChatSocket = (opts: any) => {
  chatSocket = getSocket('/chat', opts)
}

const getSocket = (namespace: string, opts: any) => {
  const url = import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_BACKEND_PORT
  return io(url + namespace, opts)
}

export { gameSocket, chatSocket, initGameSocket, initChatSocket }
