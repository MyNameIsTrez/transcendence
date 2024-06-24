<template>
  <div class="flex flex-col p-6">
    <div class="grid grid-cols-[1fr_auto_1fr]">
      <h1 class="col-start-2 mt-3">Game invites</h1>
      <GameInvite
        v-for="invite in invitations"
        :key="invite.inviterIntraId"
        :inviterName="invite.inviterName"
        :inviterIntraId="invite.inviterIntraId"
        :gamemode="invite.gamemode"
      />

      <div class="tooltip tooltip-left ml-auto" data-tip="Search user">
        <button class="btn btn-primary btn-square self-auto" onclick="searchUser.showModal()">
          <span class="material-symbols-outlined">person_search</span>
        </button>

        <dialog id="searchUser" class="modal">
          <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
            <div class="modal-box w-auto justify-self-center pr-10">
              <!-- Adds a little close button in the top-right corner -->
              <form method="dialog">
                <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
              </form>

              <span class="flex justify-center">
                <input
                  type="text"
                  v-model="searchUserRef"
                  placeholder="Intra name"
                  class="input input-bordered w-full max-w-xs"
                  @keyup.enter="searchUser"
                />

                <button class="btn" @click="searchUser">Search</button>
              </span>
            </div>
          </span>

          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>

    <h1 class="text-center pt-2">Friend invites</h1>
    <Incoming
      v-for="request in incomingFriendRequests"
      :key="request.intraId"
      :name="request.name"
      :intraId="request.intraId"
    />

    <h1 class="text-center pt-5">Friends</h1>

    <template v-for="friend in friends" :key="friend.intraId">
      <Friend
        v-if="friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :intraId="friend.intraId"
      />
    </template>

    <template v-for="friend in friends" :key="friend.intraId">
      <Friend
        v-if="!friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :intraId="friend.intraId"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Friend from './friends/Friend.vue'
import Incoming from './friends/Incoming.vue'
import GameInvite from './friends/GameInvite.vue'
import { get } from '../../httpRequests'
import { inject, ref, type Ref } from 'vue'
import { Socket } from 'socket.io-client'
import AlertPopup from '../AlertPopup.vue'
import { useRouter } from 'vue-router'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const gameSocket: Socket = inject('gameSocket')!
const userSocket: Socket = inject('userSocket')!

const friends = ref(await get('api/user/friends'))

const searchUserRef = ref('')

const router = useRouter()

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

async function searchUser() {
  const intra_name = searchUserRef.value

  const encoded_intra_name = encodeURIComponent(intra_name)

  if (encoded_intra_name.length === 0) {
    alertPopup.value.showWarning('You need to enter an intra name')
    return
  }

  const intra_id = await get(`api/user/getIntraId/${encoded_intra_name}`).catch((err) => {
    console.error('searchUser error', err)
    alertPopup.value.showWarning(err.response.data.message)
  })

  router.replace({ path: `/user/${intra_id}` })
}

class IncomingFriendRequest {
  intraId: number
  name: string

  constructor(intraId: number, name: string) {
    this.intraId = intraId
    this.name = name
  }
}
const incomingFriendRequests = ref<IncomingFriendRequest[]>(
  await get('api/user/incomingFriendRequests')
)
userSocket.on('newIncomingFriendRequest', (incomingFriendRequest: IncomingFriendRequest) => {
  incomingFriendRequests.value.push(incomingFriendRequest)
})
</script>
