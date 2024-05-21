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

const me = await get(`api/user/me`)
const isTwoFactorAuthenticationEnabled = me.isTwoFactorAuthenticationEnabled

const qr = ref('')
if (!isTwoFactorAuthenticationEnabled) {
  qr.value = await post('2fa/generate', '')
}

function sendAuthCode() {
  post('2fa/turn-on', { twoFactorAuthenticationCode: authCode.value })
    .then(() => {
      console.log('success')
      return post('2fa/authenticate', { twoFactorAuthenticationCode: authCode.value })
    })
    .then((newJWT) => {
      console.log('authentication success')
      localStorage.setItem('jwt', newJWT)
      router.replace({ path: '/' })
    })
    .catch(() => {
      console.log('failed') //TODO: popup alert maken voor failed
    })
}
</script>
