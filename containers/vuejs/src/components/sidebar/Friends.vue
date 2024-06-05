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
          <button class="btn btn-primary btn-square self-auto" onclick="addFriend.showModal()">
            <span class="material-symbols-outlined">person_add</span>
          </button>
          <dialog id="addFriend" class="modal">
            <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
              <div class="modal-box w-auto justify-self-center">
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
                    @keyup.enter="sendFriendRequest"
                  />
                  <button class="btn" @click="sendFriendRequest">Add</button>
                </span>
              </div>
              <AlertPopup
                :alertType="alertType"
                :visible="alertVisible"
                :alertMessage="alertMessage"
              />
            </span>
            <form method="dialog" class="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </div>
    <h1 class="text-center">-- Game invites --</h1>

    <GameInvite
      v-for="invite in invitations"
      :key="invite.inviterIntraId"
      :name="invite.inviterName"
      :inviterIntraId="invite.inviterIntraId"
      :gamemode="invite.gamemode"
    />

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
    <Incoming
      v-for="request in incomingFriendRequests"
      :key="request.intraId"
      :name="request.name"
      :intraId="request.intraId"
    />
  </div>
</template>

<script setup lang="ts">
import Friend from './friends/Friend.vue'
import Incoming from './friends/Incoming.vue'
import GameInvite from './friends/GameInvite.vue'
import { get, post } from '../../httpRequests'
import { inject, ref } from 'vue'
import { Socket } from 'socket.io-client'
import AlertPopup from '../AlertPopup.vue'
import { AlertType } from '../../types'

const gameSocket: Socket = inject('gameSocket')!
const userSocket: Socket = inject('userSocket')!

const friends = await get('api/user/friends')

const friendSearch = ref('')

const alertVisible = ref(false)

const alertType = ref(AlertType.ALERT_SUCCESS)

const alertMessage = ref('Friend request sent')

const isError = ref(true)

class Invitation {
  inviterIntraId: number
  inviterName: string
  gamemode: string

  constructor(inviterIntraId: number, inviterName: string, gamemode: string) {
    this.inviterIntraId = inviterIntraId
    this.inviterName = inviterName
    this.gamemode = gamemode
  }
}
const invitations = ref<Invitation[]>([])
gameSocket.on('updateInvitations', (invites: Invitation[]) => {
  invitations.value = invites
})

class IncomingFriendRequest {
  intraId: number
  name: string

  constructor(intraId: number, name: string) {
    this.intraId = intraId
    this.name = name
  }
}
const incomingFriendRequests = ref<IncomingFriendRequest[]>([])
userSocket.on('updateIncomingFriendRequests', (requests: IncomingFriendRequest[]) => {
  console.log('in updateIncomingFriendRequests')
  incomingFriendRequests.value = requests
})
userSocket.emit('updateIncomingFriendRequests')

function reloadFriends() {
  location.reload()
}

async function sendFriendRequest() {
  await post('api/user/sendFriendRequest', { intra_name: friendSearch.value })
    .then(() => {
      alertType.value = AlertType.ALERT_SUCCESS
      alertMessage.value = 'Friend request sent'
      alertVisible.value = true
      isError.value = false
      setTimeout(() => {
        alertVisible.value = false
      }, 3500)
    })
    .catch((err) => {
      console.error('sendFriendRequest error', err)
      alertType.value = AlertType.ALERT_WARNING
      alertMessage.value = err.response.data.message
      alertVisible.value = true
      isError.value = true
      setTimeout(() => {
        alertVisible.value = false
      }, 3500)
    })
}
</script>
