<template>
  <!-- RouterView is required to have route components like LoginView be rendered -->
  <RouterView />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onUnmounted } from 'vue'
import { gameSocket, chatSocket, initGameSocket, initChatSocket } from './components/getSocket'

const router = useRouter()

const retrieveJwt = () => {
  const jwt = localStorage.getItem('jwt')
  // TODO: Less janky startsWith() solution pls
  if (!jwt && !window.location.href.startsWith('http://localhost:2424/login')) {
    console.error('Expected a jwt in the localstorage; redirecting to login page')
    router.replace({ path: '/login' })
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

initGameSocket(opts)
initChatSocket(opts)

gameSocket.on('exception', (error) => {
  console.error('exception', error)
  if (error.redirectToLoginPage) {
    router.replace({ path: '/login' })
  }
})
chatSocket.on('exception', (error) => {
  console.error('exception', error)
  if (error.redirectToLoginPage) {
    router.replace({ path: '/login' })
  }
})

onUnmounted(() => {
  disconnectSockets()
})
</script>

<!-- TODO: Is this still used? -->
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  font-family: 'Press Start 2P', cursive;
}
</style>
