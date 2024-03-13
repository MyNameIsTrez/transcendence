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
// gameSocket.emit('game')
const chatSocket = createSocketNamespace('chat')
// chatSocket.emit('chat')
// chatSocket.emit('')

// TODO: Move this to a logical file
const authenticate = (code: string) => {
  rootSocket.on('attemptLogin', (resp) => {
    // TODO: Check if response is 'True' or 'False', and show either 'Pong'-page or 'Login'-page
    console.log('response:')
    console.log(resp)
  })

  rootSocket.emit('code', { code })
}

const code = new URLSearchParams(window.location.search).get('code') || ''
console.log(`code: ${code}`)
authenticate(code)

export { disconnectSockets, gameSocket, chatSocket }
