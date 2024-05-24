<template>
  <ul class="text-center">
    <br />
    <li>
      <a
        :href="
          'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-687341ddad62ca71f252d1088176c46c196e91ce842a42462761637728776f8a&redirect_uri=' +
          address +
          '%3A' +
          backend_port +
          '%2Flogin&response_type=code'
        "
        >Login</a
      >
    </li>
    <br />
    <li><a :href="address + ':' + backend_port + '/loginFoo'">Login as the user 'foo'</a></li>
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

const address = encodeURI(import.meta.env.VITE_ADDRESS)
const backend_port = import.meta.env.VITE_BACKEND_PORT

if (extractJwtFromUrl()) {
  router.replace({ path: '/' })
}
</script>
