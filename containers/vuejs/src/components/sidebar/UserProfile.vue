<template>
  <div class="p-6">
    <div class="grid justify-center">
      <span class="grid grid-cols-2">
        <div class="text text-base justify-self-start self-center text-yellow-200 w-64">
          {{ username }}
        </div>

        <button
          v-if="isFriendRequestedRef"
          :class="`btn btn-square btn-warning justify-self-end`"
          @click="revokeFriendRequest"
        >
          <span class="material-symbols-outlined">person_cancel</span>
        </button>
        <button
          v-if="isFriendRef"
          :class="`btn btn-square btn-error justify-self-end`"
          @click="removeFriend"
        >
          <span class="material-symbols-outlined">person_remove</span>
        </button>
        <button
          v-if="!isFriendRef && !isFriendRequestedRef"
          :class="`btn btn-square btn-primary justify-self-end`"
          @click="sendFriendRequest"
        >
          <span class="material-symbols-outlined">person_add</span>
        </button>
      </span>
      <div class="flex justify-between mt-6">
        <div class="avatar justify-start">
          <div class="w-24 rounded">
            <img :src="profilePicture" />
          </div>
        </div>
        <div>
          <div class="text">
            W/L ratio: <span class="text text-green-500">{{ wins }}</span
            >/<span class="text text-red-600">{{ losses }}</span>
          </div>
          <button class="btn justify-self-end w-60 mt-6" @click="inviteToGame">
            Invite to game
          </button>
        </div>
      </div>

      <div style="clear: both; padding-top: 50px">
        <div class="collapse w-auto bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-xl text-center font-bold px-0">Match history</div>
          <div class="collapse-content">
            <MatchReport
              v-for="match in matchHistory"
              :key="match.id"
              :leftPlayerName="match.players[0].username"
              :rightPlayerName="match.players[1].username"
              :leftPlayerDisconnected="
                match.disconnectedPlayer &&
                match.players[0].intra_id === match.disconnectedPlayer.intra_id
              "
              :rightPlayerDisconnected="
                match.disconnectedPlayer &&
                match.players[1].intra_id === match.disconnectedPlayer.intra_id
              "
              :leftPlayerIntraId="match.players[0].intra_id"
              :myIntraId="otherUser.intra_id"
              :leftPlayerScore="match.leftScore"
              :rightPlayerScore="match.rightScore"
              :gamemode="match.gamemode"
            />
          </div>
        </div>
      </div>
      <Achievements :intraId="intra_id" class="mt-6" />

      <button class="btn text-xl mt-6" @click="handleBlock">
        {{ blocked ? 'Unblock' : 'Block' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import MatchReport from './profile/MatchReport.vue'
import Achievements from './achievements/Achievements.vue'
import { get, getImage, post } from '../../httpRequests'
import { Socket } from 'socket.io-client'
import { computed, inject, ref, watch, type Ref } from 'vue'
import AlertPopup from '../AlertPopup.vue'
import { onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteUpdate(async (to) => {
  let me = await get(`api/user/me`)
  if (to.params.intraId === me.intra_id.toString()) {
    return '/'
  }
})

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const gameSocket: Socket = inject('gameSocket')!

const props = defineProps({ intraId: String })
const intra_id = computed(() => parseInt(props.intraId!))

const otherUser = ref(await get(`api/user/other/${intra_id.value}`))
const username = ref(otherUser.value.username)
const wins = ref(otherUser.value.wins)
const losses = ref(otherUser.value.losses)
const profilePicture = ref(await getImage(`api/user/profilePicture/${intra_id.value}`))
const matchHistory = ref(await get(`api/user/matchHistory/${intra_id.value}`))

const blocked = ref(await get(`api/user/hasBlocked/${intra_id.value}`))

const friends: Ref<Friend[]> = ref(await get('api/user/friends'))

const isFriendRef = ref(
  friends.value.findIndex((item) => item.intraId === otherUser.value.intra_id) !== -1
)
const outgoingFriendRequests = ref<OutgoingFriendRequest[]>(
  await get('api/user/outgoingFriendRequests')
)

const isFriendRequestedRef = ref(
  outgoingFriendRequests.value.findIndex(
    (request) => request.intraId === otherUser.value.intra_id
  ) !== -1
)

watch(intra_id, async (new_intra_id) => {
  otherUser.value = await get(`api/user/other/${new_intra_id}`)
  username.value = otherUser.value.username
  wins.value = otherUser.value.wins
  losses.value = otherUser.value.losses
  profilePicture.value = await getImage(`api/user/profilePicture/${new_intra_id}`)
  matchHistory.value = await get(`api/user/matchHistory/${new_intra_id}`)

  blocked.value = await get(`api/user/hasBlocked/${new_intra_id}`)
  friends.value = await get('api/user/friends')

  isFriendRef.value =
    friends.value.findIndex((item) => item.intraId === otherUser.value.intra_id) !== -1
  outgoingFriendRequests.value = await get('api/user/outgoingFriendRequests')

  isFriendRequestedRef.value =
    outgoingFriendRequests.value.findIndex(
      (request) => request.intraId === otherUser.value.intra_id
    ) !== -1
})

class Friend {
  name: string
  isOnline: boolean
  intraId: number

  constructor(name: string, isOnline: boolean, intraId: number) {
    this.name = name
    this.isOnline = isOnline
    this.intraId = intraId
  }
}

class OutgoingFriendRequest {
  intraId: number
  name: string

  constructor(intraId: number, name: string) {
    this.intraId = intraId
    this.name = name
  }
}

function inviteToGame() {
  gameSocket.emit('createPrivateLobby', {
    invitedUser: intra_id.value,
    gamemode: localStorage.getItem('gamemode')
  })
}

async function handleBlock() {
  const url = 'api/user/' + (blocked.value ? 'unblock' : 'block')

  await post(url, { intra_id: intra_id.value })
    .then(() => (blocked.value = !blocked.value))
    .catch((err) => {
      console.error('handleBlock error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function revokeFriendRequest() {
  await post('api/user/revokeFriendRequest', { friend_id: intra_id.value })
    .then(() => {
      isFriendRequestedRef.value = false
    })
    .catch((err) => {
      console.error('revokeFriendRequest error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function removeFriend() {
  await post('api/user/removeFriend', { friend_id: intra_id.value })
    .then(() => {
      isFriendRef.value = false
    })
    .catch((err) => {
      console.error('removeFriend error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function sendFriendRequest() {
  await post('api/user/sendFriendRequest', { receiver_intra_id: otherUser.value.intra_id })
    .then(() => {
      alertPopup.value.showSuccess('Friend request sent')
      isFriendRequestedRef.value = true
    })
    .catch((err) => {
      console.error('sendFriendRequest error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}
</script>
