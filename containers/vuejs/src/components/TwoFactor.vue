<template>
  <div class="grid place-items-center">
    <img :v-if="!isTwoFactorAuthenticationEnabled" :src="qr" />
    <p class="py-4">Enter authenticator code</p>
    <span class="flex justify-center">
      <input
        type="text"
        v-model="authCode"
        placeholder="6 digit code"
        class="input input-bordered w-full max-w-xs"
        @keyup.enter="sendAuthCode"
      />
      <button class="btn" @click="sendAuthCode">Send</button>
    </span>
    <div role="alert" :class="`alert alert-warning ${alertVisibility}`">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>Code is invalid</span>
    </div>
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

const alertVisibility = ref('invisible')

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
      alertVisibility.value = 'visible'
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    })
}

async function turn2faOn() {
  await post('2fa/turn-on', { twoFactorAuthenticationCode: authCode.value }).catch(() => {
    console.error('failed') // TODO: popup alert maken voor failed
    alertVisibility.value = 'visible'
    setTimeout(() => {
      alertVisibility.value = 'invisible'
    }, 3500)
  })
}

async function authenticateWith2fa() {
  await post('2fa/authenticate', { twoFactorAuthenticationCode: authCode.value })
    .then((newJWT) => {
      localStorage.setItem('jwt', newJWT)
      router.replace({ path: '/' })
    })
    .catch(() => {
      console.error('failed') // TODO: popup alert maken voor failed
      alertVisibility.value = 'visible'
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    })
}
</script>
