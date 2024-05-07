<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div :class="`w-28 avatar ${isOnline ? 'online' : 'offline'}`">
        <img class="rounded" :src="`${profilePicture}`" alt="Album" />
      </div>
    </figure>
    <div class="card-body w-64 h-28 grid justify-items-stretch">
      <h2 class="text justify-self-start font-bold text-sm w-56">{{ name }}</h2>
      <div class="dropdown justify-self-end dropdown-bottom dropdown-end">
        <div tabindex="0" role="button" class="m-1 btn btn-primary w-8 h-8 min-h-0">
          <span class="material-symbols-outlined" style="font-size: 20px">settings</span>
        </div>
        <ul
          tabindex="0"
          class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-max"
        >
          <li><router-link to="FriendProfile">View profile</router-link></li>
          <li><a>Invite to game</a></li>
          <li><a>Open chat</a></li>
          <li><a @click="removeFriend">Remove friend</a></li>
        </ul>
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

const profilePicture = await getImage(`user/profilePicture/${props.intraId}.png`)

async function removeFriend() {
  console.log('friend_id: ', props.intraId)
  post('user/removeFriend', { friend_id: props.intraId }).then(() => location.reload())
}
</script>

<!--
	<div class="card-body h-28">
      <div style="clear: both">
        <h2 style="float: left; padding-top: 10px" class="text font-bold text-sm w-36">
          {{ name }}
        </h2>

        <div style="float: right" class="dropdown dropdown-bottom dropdown-end">
			<div tabindex="0" role="button" class="m-1 btn btn-primary w-8 h-8 min-h-0">
			  <span class="material-symbols-outlined" style="font-size: 20px">settings</span>
			</div>
			<ul
			  tabindex="0"
			  class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-max"
			>
			  <li><router-link to="FriendProfile">View profile</router-link></li>
			  <li><a>Invite to game</a></li>
			  <li><a>Open chat</a></li>
			  <li><a @click="removeFriend">Remove friend</a></li>
			</ul>
		  </div>
		</div>
	  </div>
-->
