<template>
  <div class="p-6">
    <div class="grid justify-center">
      <span class="grid grid-cols-2">
        <div class="text text-base justify-self-start self-center text-yellow-200 w-64">
          {{ username }}
        </div>

        <button v-if="isFriendRef" :class="`btn btn-square btn-error justify-self-end`">
          <span @click="removeFriend" class="material-symbols-outlined">person_remove</span>
        </button>
        <button v-else :class="`btn btn-square btn-primary justify-self-end`">
          <span @click="sendFriendRequest" class="material-symbols-outlined">person_add</span>
        </button>
      </span>
      <br />
      <div class="flex justify-between">
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
          <br />
          <button class="btn justify-self-end w-60" @click="inviteToGame">Invite to game</button>
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
              :myIntraId="user.intra_id"
              :leftPlayerScore="match.leftScore"
              :rightPlayerScore="match.rightScore"
              :gamemode="match.gamemode"
            />
          </div>
        </div>
      </div>
      <br />
      <Achievements :intraId="intra_id" />

      <br />
      <button class="btn text-xl" @click="handleBlock">
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
import { inject, ref, type Ref } from 'vue'
import AlertPopup from '../AlertPopup.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const gameSocket: Socket = inject('gameSocket')!

const props = defineProps({ intraId: String })
const intra_id = parseInt(props.intraId!)

const user = await get(`api/user/other/${intra_id}`)
const username = user.username
const wins = user.wins
const losses = user.losses
const profilePicture = await getImage(`api/user/profilePicture/${intra_id}`)
const matchHistory = await get(`api/user/matchHistory/${intra_id}`)

const blocked = ref(await get(`api/user/hasBlocked/${intra_id}`))

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

const friends: Ref<Friend[]> = ref(await get('api/user/friends'))
const isFriendRef = ref(friends.value.findIndex((item) => item.intraId === user.intra_id) !== -1)

function inviteToGame() {
  gameSocket.emit('createPrivateLobby', {
    invitedUser: intra_id,
    gamemode: localStorage.getItem('gamemode')
  })
}

async function handleBlock() {
  const url = 'api/user/' + (blocked.value ? 'unblock' : 'block')

  await post(url, { intra_id })
    .then(() => (blocked.value = !blocked.value))
    .catch((err) => {
      console.error('handleBlock error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function sendFriendRequest() {
  await post('api/user/sendFriendRequest', { intra_name: user.intra_name })
    .then(() => {
      alertPopup.value.showSuccess('Friend request sent')
    })
    .catch((err) => {
      console.error('sendFriendRequest error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function removeFriend() {
  await post('api/user/removeFriend', { friend_id: intra_id })
    .then(() => {
      isFriendRef.value = false
    })
    .catch((err) => {
      console.error('removeFriend error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}
</script>
