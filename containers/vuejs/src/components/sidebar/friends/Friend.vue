<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div :class="`w-28 avatar ${isOnline ? 'online' : 'offline'}`">
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
        <button class="btn m-1 btn-error w-8 h-8 min-h-0" @click="removeFriend">
          <span class="material-symbols-outlined" style="font-size: 20px">person_remove</span>
        </button>
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

const emit = defineEmits(['update'])

const profilePicture = await getImage(`api/user/profilePicture/${props.intraId}`)

async function removeFriend() {
  await post('api/user/removeFriend', { friend_id: props.intraId }).then(() => {
    emit('update')
  })
}
</script>
