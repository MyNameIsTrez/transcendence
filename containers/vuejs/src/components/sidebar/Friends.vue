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
          <dialog id="my_modal_2" class="modal">
            <span class="place-content-center" style="grid-column-start: 1; grid-row-start: 1">
              <div class="modal-box w-auto">
                <!-- Adds a little close button in the top-right corner -->
                <form method="dialog">
                  <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
                </form>

                <p class="py-4">Add a friend</p>
                <span class="flex justify-center">
                  <input
                    type="text"
                    v-model="friendSearch"
                    placeholder="Type here"
                    class="input input-bordered w-full max-w-xs"
                    @keyup.enter="addFriend"
                  />
                  <button class="btn" @click="addFriend">Add</button>
                </span>
              </div>
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
                    :d="`${isError ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}`"
                  />
                </svg>
                <span>{{ alertMessage }}</span>
              </div>
            </span>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </div>
    <h1 class="text-center">-- Game invites --</h1>
    <GameInvite name="Milan Forsthovel" :intraId="91418" gamemode="Special" />
    <!-- TODO: zelfde zoals hieronder met een v-for door de invites loopen -->
    <h1 class="text-center pt-2">----- Online -----</h1>
    <template v-for="friend in friends" :key="friend.intraId">
      <Friend
        v-if="friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :intraId="friend.intraId"
      />
    </template>
    <h1 class="text-center pt-2">----- Offline -----</h1>
    <template v-for="friend in friends" :key="friend.intraId">
      <Friend
        v-if="!friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :intraId="friend.intraId"
      />
    </template>
    <h1 class="text-center pt-2">---- Incoming ----</h1>
    <Incoming v-for="request in incomingRequests" :name="request.name" :intraId="request.intraId" />
  </div>
</template>

<script setup lang="ts">
import Friend from './friends/Friend.vue'
import Incoming from './friends/Incoming.vue'
import GameInvite from './friends/GameInvite.vue'
import { get, post } from '../../httpRequests'
import { ref } from 'vue'

const friends = await get('api/user/friends')
const incomingRequests = await get('api/user/incomingFriendRequests')

// const incomingGameInvites = await get('api/user/incomingGamesInvites') //TODO: aanpassen aan de hand van wat Victor maakt

const friendSearch = ref('')

const alertVisibility = ref('invisible')

const alertColor = ref('alert-success')

const alertMessage = ref('Friend request sent')

const isError = ref(true)

function reloadFriends() {
  location.reload()
}

async function addFriend() {
  await post('api/user/sendFriendRequest', { intra_name: friendSearch.value })
    .then(() => {
      alertColor.value = 'alert-success'
      alertMessage.value = 'Friend request sent'
      alertVisibility.value = 'visible'
      isError.value = false
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    })
    .catch((err) => {
      console.error('sendFriendRequest error', err)
      alertColor.value = 'alert-warning'
      alertMessage.value = err.response.data.message
      alertVisibility.value = 'visible'
      isError.value = true
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    })
}
</script>
