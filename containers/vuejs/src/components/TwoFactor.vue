<template>
  <img :src="qr" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { get, post } from '../httpRequests'

const me = await get(`api/user/me`)
const isTwoFactorAuthenticationEnabled = me.isTwoFactorAuthenticationEnabled

const qr = ref(await post('2fa/generate', ''))
</script>
