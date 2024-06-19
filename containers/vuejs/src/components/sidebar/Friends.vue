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
                    v-model="sendFriendRequestRef"
                    placeholder="Type here"
                    class="input input-bordered w-full max-w-xs"
                    @keyup.enter="sendFriendRequest"
                  />
                  <button class="btn" @click="sendFriendRequest">Add</button>
                </span>
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

    <GameInvite
      v-for="invite in invitations"
      :key="invite.inviterIntraId"
      :inviterName="invite.inviterName"
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
      @update="reloadFriends"
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
import { inject, ref, type Ref } from 'vue'
import { Socket } from 'socket.io-client'
import AlertPopup from '../AlertPopup.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const gameSocket: Socket = inject('gameSocket')!
const userSocket: Socket = inject('userSocket')!

const friends = ref(await get('api/user/friends'))
const incomingFriendRequests = ref(await get('api/user/incomingFriendRequests'))

const sendFriendRequestRef = ref('')

const alertMessage = ref('Friend request sent')

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
const invitations = ref<Invitation[]>(await get('api/game/invitations'))
gameSocket.on('updateInvitations', (invites: Invitation[]) => {
  invitations.value = invites
})

async function reloadFriends() {
  friends.value = await get('api/user/friends')
  incomingFriendRequests.value = await get('api/user/incomingFriendRequests')
}

async function sendFriendRequest() {
  await post('api/user/sendFriendRequest', { intra_name: sendFriendRequestRef.value })
    .then(() => {
      alertMessage.value = alertPopup.value.showSuccess('Friend request sent')
    })
    .catch((err) => {
      console.error('sendFriendRequest error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}

class IncomingFriendRequest {
  intraId: number
  name: string

  constructor(intraId: number, name: string) {
    this.intraId = intraId
    this.name = name
  }
}
userSocket.on('newIncomingFriendRequest', (incomingFriendRequest: IncomingFriendRequest) => {
  incomingFriendRequests.value.push(incomingFriendRequest)
})
</script>
