<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div class="w-28 avatar">
        <img class="rounded w-28" :src="`${profilePicture}`" alt="Album" />
      </div>
    </figure>
    <div class="card-body h-28 grid justify-items-stretch pt-3">
      <h2 class="text justify-self-start font-bold text-sm">{{ inviterName }}</h2>
      <div class="grid">
        <div class="text text-xs text-purple-400">{{ gamemode }} game</div>
        <div class="place-self-end pt-1.5">
          <div class="btn m-1 btn-success w-8 h-8 min-h-0" @click="acceptGameInvite">
            <span class="material-symbols-outlined" style="font-size: 20px">person_check</span>
          </div>
          <div class="btn m-1 btn-error w-8 h-8 min-h-0" @click="declineGameInvite">
            <span class="material-symbols-outlined" style="font-size: 20px">person_remove</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImage } from '../../../httpRequests'
import { Socket } from 'socket.io-client'
import { inject } from 'vue'

const gameSocket: Socket = inject('gameSocket')!

const props = defineProps({
  inviterIntraId: Number,
  inviterName: String,
  gamemode: String
})

const profilePicture = await getImage(`api/user/profilePicture/${props.inviterIntraId}`)

async function acceptGameInvite() {
  gameSocket.emit('acceptInvitation', { acceptedIntraId: props.inviterIntraId })
}

async function declineGameInvite() {
  gameSocket.emit('declineInvitation', { declinedIntraId: props.inviterIntraId })
}
</script>
