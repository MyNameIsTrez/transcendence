<script setup lang="ts">
import { onUnmounted } from 'vue'
import io from 'socket.io-client'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

function redirectToLoginPage() {
  router.replace({ path: '/login' })
}

async function get(path: string) {
  const jwt = localStorage.getItem('jwt')
  return await axios
    .get(`http://localhost:4242/api/${path}`, { headers: { Authorization: `Bearer ${jwt}` } })
    .then((response) => {
      return response.data
    })
    .catch(() => {
      redirectToLoginPage()
    })
}

async function getUsername() {
  console.log(`username: ${await get('user/username')}`)
}

const jwt = localStorage.getItem('jwt')
if (!jwt) {
  console.error('Expected a jwt in the localstorage')
  redirectToLoginPage()
}

const authorization_string = `Bearer ${jwt}`
const opts = {
  extraHeaders: {
    Authorization: authorization_string
  }
}

const url = import.meta.env.VITE_ADDRESS + ':' + import.meta.env.VITE_BACKEND_PORT

const gameSocket = io(url + '/game', opts)
const chatSocket = io(url + '/chat', opts)

onUnmounted(() => {
  gameSocket.disconnect()
  chatSocket.disconnect()
})

gameSocket.on('exception', (error) => {
  console.error('exception', error)
  if (error.redirectToLoginPage) {
    redirectToLoginPage()
  }
})
chatSocket.on('exception', (error) => {
  console.error('exception', error)
  if (error.redirectToLoginPage) {
    redirectToLoginPage()
  }
})

function joinGame() {
  console.log('in joinGame()')
  gameSocket.emit('joinGame', 'deadbeef')
}

gameSocket.on('game', (data) => {
  console.log('game', data)
})
</script>

<template>
  <button @click="getUsername">Get username</button>
  <button @click="joinGame">Join game</button>
</template>
