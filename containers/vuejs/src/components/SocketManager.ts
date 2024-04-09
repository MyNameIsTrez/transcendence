import io from 'socket.io-client'

const retrieveJwt = () => {
  const jwt = localStorage.getItem('jwt')
  if (!jwt) {
    console.error('Expected a jwt in the localstorage; redirecting to login page')
    // router.replace({ path: '/login' }) // TODO: This needs to be put back!
  }
  return jwt
}

const disconnectSockets = (): void => {
  gameSocket.disconnect()
  chatSocket.disconnect()
}

const jwt = retrieveJwt()

const authorization_string = `Bearer ${jwt}`
const opts = {
  extraHeaders: {
    Authorization: authorization_string
  }
}

const url = import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_BACKEND_PORT

const gameSocket = io(url + '/game', opts)
const chatSocket = io(url + '/chat', opts)

gameSocket.on('exception', (error) => {
  console.error('exception', error)
  if (error.redirectToLoginPage) {
    // router.replace({ path: '/login' }) // TODO: This needs to be put back!
  }
})
chatSocket.on('exception', (error) => {
  console.error('exception', error)
  if (error.redirectToLoginPage) {
    // router.replace({ path: '/login' }) // TODO: This needs to be put back!
  }
})

export { gameSocket, chatSocket, disconnectSockets }
