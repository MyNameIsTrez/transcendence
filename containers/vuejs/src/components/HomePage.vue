<template>
  <div class="flex flex-col overflow-hidden w-full lg:flex-row">
    <div
      class="grid flex-grow w-96 h-screen overflow-auto no-scrollbar bg-base-300 rounded-box place-items-stretch"
    >
      <Sidebar />
    </div>
    <div class="grid h-screen card bg-base-300 rounded-box place-items-center">
      <PongCanvas />
    </div>
    <div class="grid flex-grow w-96 h-screen card bg-base-300 rounded-box place-items-stretch">
      <Chat />
    </div>
  </div>
  <GameHeader />
</template>

<script setup lang="ts">
import Chat from './Chat.vue'
import GameHeader from './GameHeader.vue'
import PongCanvas from './PongCanvas.vue'
import Sidebar from './Sidebar.vue'

import { useRouter } from 'vue-router'
import { onUnmounted } from 'vue'
import { gameSocket, initGameSocket } from '../getSocket'

const router = useRouter()

const retrieveJwt = () => {
  const jwt = localStorage.getItem('jwt')
  console.log('In retrieveJwt with jwt ', jwt)
  if (!jwt) {
    console.error(
      "Expected a jwt in the localstorage, and the url doesn't start with /login, so redirecting to the login page"
    )
    router.replace({ path: '/login' })
  }
  return jwt
}

const jwt = retrieveJwt()

const authorization_string = `Bearer ${jwt}`
const opts = {
  extraHeaders: {
    Authorization: authorization_string
  }
}

initGameSocket(opts)

gameSocket.on('exception', (error) => {
  console.log('In gameSocket exception handler')
  console.error('exception', error)
  if (error.redirectToLoginPage) {
    console.log('In gameSocket, redirecting to /login')
    router.replace({ path: '/login' })
  }
})

onUnmounted(() => {
  console.log('In onUnmounted()')
  gameSocket.disconnect()
})
</script>
