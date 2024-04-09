<script setup lang="ts">
import { onUnmounted } from 'vue'
import io from 'socket.io-client'
import { useRouter } from 'vue-router'
import axios from 'axios'

function extractJwtFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const jwt = urlParams.get('jwt')
  if (jwt) {
    localStorage.setItem('jwt', jwt)
  }
  router.replace({ path: '/' }) // Trims the jwt parameter from the URL
}

function retrieveJwt() {
  const jwt = localStorage.getItem('jwt')
  if (!jwt) {
    console.error('Expected a jwt in the localstorage; redirecting to login page')
    redirectToLoginPage()
  }
  return jwt
}

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
      localStorage.removeItem('jwt')
      redirectToLoginPage()
    })
}

async function getUsername() {
  console.log(`username: ${await get('user/username')}`)
}

function joinGame() {
  console.log('in joinGame()')
  gameSocket.emit('joinGame', 'deadbeef')
}

const router = useRouter()

extractJwtFromUrl()

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

gameSocket.on('game', (data) => {
  console.log('game', data)
})
</script>

<template>
  <button @click="getUsername">Get username</button>
  <button @click="joinGame">Join game</button>
</template>
