<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div class="w-28 avatar">
        <img class="rounded w-28" :src="`${profilePicture}`" alt="Album" />
      </div>
    </figure>
    <div class="card-body h-28 grid justify-items-stretch">
      <h2 class="text justify-self-start font-bold text-sm w-56">{{ name }}</h2>
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
  <br />
</template>

<script setup lang="ts">
import { post, getImage } from '../../../httpRequests'
import { inject, type Ref } from 'vue'
import AlertPopup from '../../AlertPopup.vue'
import getErrorMessage from '../../../getErrorMessage'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!

const props = defineProps({
  name: String,
  intraId: Number
})

const profilePicture = await getImage(`api/user/profilePicture/${props.intraId}`)

async function acceptFriendRequest() {
  await post('api/user/acceptFriendRequest', { sender_id: props.intraId }).catch((err) => {
    alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
  })
}

async function declineFriendRequest() {
  await post('api/user/declineFriendRequest', { sender_id: props.intraId }).catch((err) => {
    alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
  })
}
</script>
