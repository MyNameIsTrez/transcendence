<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div class="w-28 avatar">
        <img class="rounded" :src="`${image}`" alt="Album" />
      </div>
    </figure>
    <div class="card-body h-28">
      <div style="clear: both">
        <h2 style="float: left; padding-top: 10px" class="text justify-self-start font-bold text-sm w-36">{{ name }}</h2>
        <div style="float: right" class="dropdown dropdown-bottom dropdown-end">
          <button class="btn m-1 btn-success w-8 h-8 min-h-0" @click="acceptFriendRequest">
            <span class="material-symbols-outlined" style="font-size: 20px">person_check</span>
          </button>
          <button class="btn m-1 btn-error w-8 h-8 min-h-0" @click="declineFriendRequest">
            <span class="material-symbols-outlined" style="font-size: 20px">person_remove</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { post } from '../../../httpRequests'

const props = defineProps({
  name: String,
  image: String,
  intraId: Number
})

async function acceptFriendRequest() {
  console.log('test_id: ', props.intraId)
  post('user/acceptFriendRequest', { sender_id: props.intraId }).then(() => location.reload())
}

async function declineFriendRequest() {
  console.log('test_id: ', props.intraId)
  post('user/declineFriendRequest', { sender_id: props.intraId }).then(() => location.reload())
}
</script>
