<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div class="w-28 avatar">
        <img class="rounded" :src="`${image}`" alt="Album" />
      </div>
    </figure>
    <div class="card-body h-28">
      <div style="clear: both">
        <h2 style="float: left; padding-top: 10px" class="card-title">{{ name }}</h2>
        <div style="float: right" class="dropdown dropdown-bottom dropdown-end">
          <button class="btn m-1 btn-success btn-square" @click="acceptFriendRequest">
            <span class="material-symbols-outlined" style="font-size: 30px">person_check</span>
          </button>
          <button class="btn m-1 btn-error btn-square" @click="declineFriendRequest">
            <span class="material-symbols-outlined" style="font-size: 30px">person_remove</span>
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
  post('user/acceptFriendRequest', { sender_id: props.intraId })
}

async function declineFriendRequest() {
  console.log('test_id: ', props.intraId)
  post('user/declineFriendRequest', { sender_id: props.intraId })
}
</script>
