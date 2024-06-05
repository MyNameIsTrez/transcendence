<template>
  <div class="card lg:card-side bg-base-200">
    <router-link :to="{ path: `user/${intraId}` }">
      <figure>
        <div :class="`w-28 avatar ${isOnline ? 'online' : 'offline'}`">
          <img class="rounded" :src="`${profilePicture}`" alt="Album" />
        </div>
      </figure>
    </router-link>
    <div class="card-body w-64 h-28 grid justify-items-stretch">
      <h2 class="text justify-self-start font-bold text-sm w-56">
        <router-link :to="{ path: `user/${intraId}` }">{{ name }}</router-link>
      </h2>
      <div class="btn m-1 btn-error w-8 h-8 min-h-0 justify-self-end" @click="removeFriend">
        <span class="material-symbols-outlined" style="font-size: 20px">taunt</span>
      </div>
    </div>
  </div>
  <br />
</template>

<script setup lang="ts">
import { post, getImage } from '../../../httpRequests'

const props = defineProps({
  name: String,
  isOnline: Boolean,
  intraId: Number
})

const profilePicture = await getImage(`api/user/profilePicture/${props.intraId}.png`)

async function removeFriend() {
  post('api/user/removeFriend', { friend_id: props.intraId }).then(() => location.reload())
}
</script>
