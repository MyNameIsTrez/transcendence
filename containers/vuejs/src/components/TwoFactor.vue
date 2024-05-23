<template>
  <div class="grid place-items-center">
    <img :v-if="!isTwoFactorAuthenticationEnabled" :src="qr" />
    <p class="py-4">Enter authenticator code</p>
    <span class="flex justify-center">
      <input
        type="text"
        v-model="authCode"
        placeholder="Code"
        class="input input-bordered w-full max-w-xs"
        @keyup.enter="sendAuthCode"
      />
      <button class="btn" @click="sendAuthCode">Send</button>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { get, post } from '../httpRequests'
import { useRouter } from 'vue-router'

const router = useRouter()

const authCode = ref('')

const urlParams = new URLSearchParams(window.location.search)
const jwt = urlParams.get('jwt')
if (jwt) {
  localStorage.setItem('jwt', jwt)
}

const isTwoFactorAuthenticationEnabled = await get(`2fa/isEnabled`)

const qr = ref('')
if (!isTwoFactorAuthenticationEnabled) {
  qr.value = await post('2fa/generate', '')
}

async function sendAuthCode() {
  if (!jwt && isTwoFactorAuthenticationEnabled) {
    turn2faOff()
  } else {
    if (!isTwoFactorAuthenticationEnabled) {
      turn2faOn()
    }
    authenticateWith2fa()
  }
}

async function turn2faOff() {
  await post('2fa/turn-off', { twoFactorAuthenticationCode: authCode.value })
    .then((newJWT) => {
      localStorage.setItem('jwt', newJWT)
      router.replace({ path: '/' })
    })
    .catch(() => {
      console.error('failed') // TODO: popup alert maken voor failed
    })
}

async function turn2faOn() {
  await post('2fa/turn-on', { twoFactorAuthenticationCode: authCode.value }).catch(() => {
    console.error('failed') // TODO: popup alert maken voor failed
  })
}

async function authenticateWith2fa() {
  await post('2fa/authenticate', { twoFactorAuthenticationCode: authCode.value })
    .then((newJWT) => {
      console.log('authentication success')
      localStorage.setItem('jwt', newJWT)
      router.replace({ path: '/' })
    })
    .catch(() => {
      console.error('failed') // TODO: popup alert maken voor failed
    })
}
</script>
