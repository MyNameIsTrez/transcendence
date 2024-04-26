<template>
  <a
    href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-687341ddad62ca71f252d1088176c46c196e91ce842a42462761637728776f8a&redirect_uri=http%3A%2F%2Flocalhost%3A4242%2Flogin&response_type=code"
    >Login</a
  >
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

/* TODO:
The commented line their purpose was to automatically redirect us away from
the login page if you were already logged in, but this would break our implementation of 2fa.

A solution would be to have the 2fa callback page be on a different
route but that would require another front-end page.

If more questions, please contact back-end or leave a voicemail :)
*/
// if (localStorage.getItem('jwt') || extractJwtFromUrl()) {
if (extractJwtFromUrl()) {
  router.replace({ path: '/' })
}
</script>
