<template>
  <div class="p-6">
    <div class="grid grid-cols-2 justify-items-stretch">
      <div class="justify-self-start">
        <div class="tooltip tooltip-right" data-tip="Reload friends">
          <button class="btn btn-primary btn-square self-auto" @click="reloadFriends">
            <span class="material-symbols-outlined">autorenew</span>
          </button>
        </div>
      </div>
      <div class="justify-self-end">
        <div class="tooltip tooltip-left" data-tip="Add friend">
          <button class="btn btn-primary btn-square self-auto" onclick="my_modal_2.showModal()">
            <span class="material-symbols-outlined">person_add</span>
          </button>
          <dialog id="my_modal_2" class="modal place-content-center">
            <div role="alert" :class="`alert ${alertColor} ${alertVisibility}`">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ alertMessage }}</span>
            </div>
            <div class="modal-box w-auto">
              <p class="py-4">Add a friend</p>
              <span class="flex justify-center">
                <input
                  type="text"
                  v-model="friendSearch"
                  placeholder="Type here"
                  class="input input-bordered w-full max-w-xs"
                />
                <button class="btn" @click="addFriend">Add</button>
              </span>
			  <p class="text-center text-gray-400" style="padding-top: 20px">Press [ESC] to close</p>
            </div>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </div>
    <h1 class="text-center">---- Online ----</h1>
    <template v-for="friend in friends">
      <Friend
        v-if="friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :image="friend.profilePicture"
        :intraId="friend.intraId"
      />
    </template>
    <h1 class="text-center">---- Offline ----</h1>
    <template v-for="friend in friends">
      <Friend
        v-if="!friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :image="friend.profilePicture"
        :intraId="friend.intraId"
      />
    </template>
    <h1 class="text-center">---- Incoming ----</h1>
    <Incoming
      v-for="request in incomingRequests"
      :name="request.name"
      :image="request.profilePicture"
      :intraId="request.intraId"
    />
  </div>
</template>

<script setup lang="ts">
import Friend from './friends/Friend.vue'
import Incoming from './friends/Incoming.vue'
import { get, getImage, post } from '../../httpRequests'
import { ref } from 'vue'

const friends = await get('user/friends')
const incomingRequests = await get('user/incomingFriendRequests')

const friendSearch = ref('')

const alertVisibility = ref('invisible')

const alertColor = ref('alert-success')

const alertMessage = ref('Friend request sent')

function reloadFriends() {
  console.log('reloaded')
  location.reload()
}

async function addFriend() {
  console.log(friendSearch.value)
  const foundUser = await post('user/sendFriendRequest', { intra_name: friendSearch.value }) //TODO: waarschijnlijk dit niet meer in een variabele stoppen
    .then((resp) => { //TODO: waarschijnlijk "resp" weghalen
      alertColor.value = 'alert-success'
      alertMessage.value = 'Friend request sent'
      alertVisibility.value = 'visible'
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    })
    .catch((err) => {
      console.log('catch test', err.response.data.message)
      alertColor.value = 'alert-warning'
      alertMessage.value = err.response.data.message
      alertVisibility.value = 'visible'
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    })
}
</script>
