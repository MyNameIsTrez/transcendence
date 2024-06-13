<template>
  <ul class="text-center">
    <br />
    <li>
      <a
        :href="
          'https://api.intra.42.fr/oauth/authorize?client_id=' +
          intra_client_id +
          '&redirect_uri=' +
          address +
          '%3A' +
          backend_port +
          '%2Flogin&response_type=code'
        "
        >Log in</a
      >
    </li>
    <br />
    <li>
      <a :href="address + ':' + backend_port + '/loginFoo'">Log in as the debug user</a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

function extractJwtFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const jwt = urlParams.get('jwt')
  if (jwt) {
    localStorage.setItem('jwt', jwt)
    return true
  }
  return false
}

const router = useRouter()

const intra_client_id = import.meta.env.VITE_INTRA_CLIENT_ID
const address = encodeURI(import.meta.env.VITE_ADDRESS)
const backend_port = import.meta.env.VITE_BACKEND_PORT

if (extractJwtFromUrl()) {
  router.replace({ path: '/' })
}
</script>
