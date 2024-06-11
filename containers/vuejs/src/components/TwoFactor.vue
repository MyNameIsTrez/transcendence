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
    <AlertPopup ref="alertPopup" :alertType="AlertType.ALERT_WARNING" :visible="alertVisible">
      Code is invalid
    </AlertPopup>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { get, post } from '../httpRequests'
import { useRouter } from 'vue-router'
import AlertPopup from './AlertPopup.vue'
import { AlertType } from '../types'

const alertPopup = ref()

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
      alertPopup.value.show()
    })
}

async function turn2faOn() {
  await post('2fa/turn-on', { twoFactorAuthenticationCode: authCode.value }).catch(() => {
    alertPopup.value.show()
  })
}

async function authenticateWith2fa() {
  await post('2fa/authenticate', { twoFactorAuthenticationCode: authCode.value })
    .then((newJWT) => {
      localStorage.setItem('jwt', newJWT)
      router.replace({ path: '/' })
    })
    .catch(() => {
      alertPopup.value.show()
    })
}
</script>
