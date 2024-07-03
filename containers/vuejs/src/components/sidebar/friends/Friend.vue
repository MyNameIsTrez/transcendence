<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div
        :class="`w-28 avatar ${isOnline === friendStatus.ONLINE ? 'online' : isOnline === friendStatus.GAMING ? 'gaming' : 'offline'}`"
      >
        <router-link :to="{ path: `user/${intraId}` }">
          <img class="rounded" :src="`${profilePicture}`" />
        </router-link>
      </div>
    </figure>
    <div class="card-body w-64 h-28">
      <h2 class="text justify-self-start font-bold text-sm">
        <router-link :to="{ path: `user/${intraId}` }">{{ name }}</router-link>
      </h2>
      <div class="card-actions justify-end">
        <router-link :to="{ path: `user/${intraId}` }">
          <button class="btn m-1 btn-success w-8 h-8 min-h-0">
            <span class="material-symbols-outlined" style="font-size: 20px">account_circle</span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { getImage } from '../../../httpRequests'

enum friendStatus {
  OFFLINE,
  ONLINE,
  GAMING
}

const props = defineProps({
  name: String,
  isOnline: Object as PropType<friendStatus>,
  intraId: Number
})

console.log(props.isOnline)

const profilePicture = await getImage(`api/user/profilePicture/${props.intraId}`)
</script>
<style>
.avatar.gaming:before {
  content: '';
  position: absolute;
  z-index: 10;
  display: block;
  border-radius: 9999px;
  --tw-bg-opacity: 1;
  /* background-color: var(--fallback-su, oklch(var(--su) / var(--tw-bg-opacity))); */
  background-color: blue;
  outline-style: solid;
  outline-width: 2px;
  outline-color: var(--fallback-b1, oklch(var(--b1) / 1));
  width: 15%;
  height: 15%;
  top: 7%;
  right: 7%;
}
</style>
