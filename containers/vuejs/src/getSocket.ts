import { io, Socket } from 'socket.io-client'

export let gameSocket: Socket

export const initGameSocket = (opts: any) => {
  gameSocket = getSocket('/game', opts)
}

const getSocket = (namespace: string, opts: any) => {
  const url = import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_BACKEND_PORT
  return io(url + namespace, opts)
}
