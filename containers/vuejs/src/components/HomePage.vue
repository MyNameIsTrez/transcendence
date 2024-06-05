<template>
  <div class="flex flex-col overflow-hidden w-full lg:flex-row">
    <div class="flex-grow w-96 h-screen overflow-auto no-scrollbar bg-base-300 rounded-box">
      <Sidebar />
    </div>
    <div class="grid h-screen card bg-base-300 rounded-box place-items-center">
      <PongCanvas :game-socket="gameSocket" />
    </div>
    <div class="flex-grow w-96 h-screen card bg-base-300 rounded-box place-items-stretch">
      <Chat :chat-socket="chatSocket" />
    </div>
  </div>
  <GameHeader :game-socket="gameSocket" />
</template>

<script setup lang="ts">
import Chat from './Chat.vue'
import GameHeader from './GameHeader.vue'
import PongCanvas from './PongCanvas.vue'
import Sidebar from './Sidebar.vue'

import { useRouter } from 'vue-router'
import { onUnmounted, provide } from 'vue'
import { io } from 'socket.io-client'

const router = useRouter()

const retrieveJwt = () => {
  const jwt = localStorage.getItem('jwt')
  if (!jwt) {
    console.error(
      "Expected a jwt in the localstorage, and the url doesn't start with /login, so redirecting to the login page"
    )
    router.replace({ path: '/login' })
  }
  return jwt
}

const getSocket = (namespace: string, opts: any) => {
  const url = import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_BACKEND_PORT
  return io(url + namespace, opts)
}

const jwt = retrieveJwt()

const authorization_string = `Bearer ${jwt}`
const opts = {
  extraHeaders: {
    Authorization: authorization_string
  }
}

const gameSocket = getSocket('/game', opts)
const chatSocket = getSocket('/chat', opts)
const userSocket = getSocket('/user', opts)

provide('gameSocket', gameSocket)
provide('userSocket', userSocket)

gameSocket.on('exception', (error) => {
  console.error('In gameSocket exception handler', error)
  if (error.redirectToLoginPage) {
    console.error('Redirecting to /login')
    router.replace({ path: '/login' })
  }
})

chatSocket.on('exception', (error) => {
  console.error('In chatSocket exception handler', error)
  if (error.redirectToLoginPage) {
    console.error('Redirecting to /login')
    router.replace({ path: '/login' })
  }
})

userSocket.on('exception', (error) => {
  console.error('In userSocket exception handler', error)
  if (error.redirectToLoginPage) {
    console.error('Redirecting to /login')
    router.replace({ path: '/login' })
  }
})

onUnmounted(() => {
  gameSocket.disconnect()
  chatSocket.disconnect()
  userSocket.disconnect()
})
</script>
