<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div class="w-28 avatar">
        <img class="rounded w-28" :src="`${profilePicture}`" alt="Album" />
      </div>
    </figure>
    <div class="card-body h-28 grid justify-items-stretch">
        <h2 class="text justify-self-start font-bold text-sm w-56">{{ name }}</h2> <!-- TODO: kleinere width zetten en padding van card body fixen -->
        <div class="justify-self-end">
          <div class="btn m-1 btn-success w-8 h-8 min-h-0" @click="acceptFriendRequest">
            <span class="material-symbols-outlined" style="font-size: 20px">person_check</span>
          </div>
          <div class="btn m-1 btn-error w-8 h-8 min-h-0" @click="declineFriendRequest">
            <span class="material-symbols-outlined" style="font-size: 20px">person_remove</span>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import type { profile } from 'console'; //TODO: waarschijnlijk weghalen
import { post, getImage } from '../../../httpRequests'

const props = defineProps({
  name: String,
  intraId: Number
})

const profilePicture = await getImage(`user/profilePicture/${props.intraId}.png`)

async function acceptFriendRequest() {
  console.log('test_id: ', props.intraId)
  post('user/acceptFriendRequest', { sender_id: props.intraId }).then(() => location.reload())
}

async function declineFriendRequest() {
  console.log('test_id: ', props.intraId)
  post('user/declineFriendRequest', { sender_id: props.intraId }).then(() => location.reload())
}
</script>
