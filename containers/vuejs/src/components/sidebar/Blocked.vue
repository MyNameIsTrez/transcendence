<template>
  <div class="p-6">
    <template v-for="blockedUser in blockedUsers" :key="blockedUser.intraId">
      <Friend
        v-if="blockedUser.isOnline"
        :name="blockedUser.name"
        :isOnline="blockedUser.isOnline"
        :intraId="blockedUser.intraId"
        :isFriend="false"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Friend from './friends/Friend.vue'
import { ref } from 'vue'
import { get } from '../../httpRequests'

const blockedUsers = ref(await get('api/user/blocked'))
</script>
