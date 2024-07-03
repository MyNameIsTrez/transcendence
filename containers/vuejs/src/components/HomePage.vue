<template>
  <div class="flex w-full">
    <div class="min-w-96 w-1/4 bg-base-300">
      <Sidebar />
    </div>
    <div class="w-full bg-base-300">
      <PongCanvas />
    </div>
    <div class="w-1/4 bg-base-300">
      <Chat />
    </div>
  </div>
</template>

<script setup lang="ts">
import Chat from './Chat.vue'
import PongCanvas from './PongCanvas.vue'
import Sidebar from './Sidebar.vue'
import { useRouter } from 'vue-router'
import { inject, onUnmounted, provide, type Ref } from 'vue'
import { io } from 'socket.io-client'
import AlertPopup from './AlertPopup.vue'

const router = useRouter()

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!

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
provide('chatSocket', chatSocket)
provide('userSocket', userSocket)

gameSocket.on('exception', (error) => {
  console.error('In gameSocket exception handler', error)
  if (error.redirectToLoginPage) {
    console.error('Redirecting to /login')
    router.replace({ path: '/login' })
  }
  alertPopup.value.showWarning(error.message)
})

chatSocket.on('exception', (error) => {
  console.error('In chatSocket exception handler', error)
  if (error.redirectToLoginPage) {
    console.error('Redirecting to /login')
    router.replace({ path: '/login' })
  }
  alertPopup.value.showWarning(error.message)
})

userSocket.on('exception', (error) => {
  console.error('In userSocket exception handler', error)
  if (error.redirectToLoginPage) {
    console.error('Redirecting to /login')
    router.replace({ path: '/login' })
  }
  alertPopup.value.showWarning(error.message)
})

onUnmounted(() => {
  gameSocket.disconnect()
  chatSocket.disconnect()
  userSocket.disconnect()
})
</script>
