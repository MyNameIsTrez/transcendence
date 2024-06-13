<template>
  <div class="p-6">
    <div class="grid">
      <span class="grid grid-flow-row-dense grid-cols-2">
        <div class="text text-base justify-self-start self-center text-yellow-200 w-64">
          {{ username }}
        </div>

        <button class="btn w-32 justify-self-end" onclick="settings.showModal()">Settings</button>

        <dialog id="settings" class="modal">
          <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
            <div class="modal-box w-auto justify-self-center">
              <!-- Adds a little close button in the top-right corner -->
              <form method="dialog">
                <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
              </form>

              <p class="py-4">Edit your name</p>
              <span class="flex justify-self-center">
                <input
                  type="text"
                  v-model="newUsername"
                  placeholder="New name"
                  class="input input-bordered w-full max-w-xs"
                  @keyup.enter="changeUsername"
                />
                <button class="btn" @click="changeUsername">Save</button>
              </span>

              <br />
              <p class="py-4">Upload new avatar</p>
              <input
                name="file"
                type="file"
                class="file-input file-input-bordered w-full max-w-md"
                accept="image/*"
                @change="uploadProfilePicture"
              />

              <div class="pt-5 grid">
                <router-link to="twofactor" class="btn place-self-center"
                  >{{ isTwoFactorAuthenticationEnabled ? 'Disable' : 'Enable' }} 2fa</router-link
                >
              </div>
            </div>
          </span>

          <!-- Allows clicking outside of the modal to close it -->
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </span>

      <br />
      <div class="flex justify-between">
        <div class="avatar justify-start">
          <div class="w-24 rounded">
            <img :src="profilePicture" />
          </div>
        </div>

        <div class="text">
          W/L ratio: <span class="text text-green-500">{{ wins }}</span
          >/<span class="text text-red-600">{{ losses }} </span>
        </div>
      </div>

      <div style="clear: both; padding-top: 50px">
        <!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
        <div class="collapse w-auto bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-xl text-center font-bold px-0">Match history</div>
          <div class="collapse-content">
            <!-- TODO: Add css padding between the MatchReports -->
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
              :myIntraId="intraId"
              :leftPlayerScore="match.leftScore"
              :rightPlayerScore="match.rightScore"
              :gamemode="match.gamemode"
            />
          </div>
        </div>
      </div>
      <br />
      <Achievements :intraId="intraId" />

      <br />
      <button class="btn w-auto text-xl" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import MatchReport from './profile/MatchReport.vue'
import Achievements from './achievements/Achievements.vue'
import { get, getImage, post } from '../../httpRequests'
import { inject, ref, type Ref } from 'vue'
import AlertPopup from '../AlertPopup.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!

const newUsername = ref('')

let me = await get(`api/user/me`)

const username = ref(me.username)
const wins = me.wins
const losses = me.losses
const intraId = me.intra_id
const profilePicture = ref(await getImage(`api/user/profilePicture/${me.intra_id}`))
const isTwoFactorAuthenticationEnabled = me.isTwoFactorAuthenticationEnabled

const matchHistory = await get(`api/user/matchHistory/${me.intra_id}`)

async function uploadProfilePicture(event: any) {
  let data = new FormData()
  data.append('name', 'profilePicture')
  data.append('file', event.target.files[0])
  await post('api/user/profilePicture', data)
    .then(async () => {
      profilePicture.value = await getImage(`api/user/profilePicture/${me.intra_id}`)
    })
    .catch((err) => {
      console.error('profilePicture error', err)
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function changeUsername() {
  await post('api/user/setUsername', { username: newUsername.value })
    .then(async () => {
      me = await get(`api/user/me`)
      username.value = me.username
      console.log('foo')
    })
    .catch((err) => {
      console.error('setUsername error', err)
      alertPopup.value.showWarning(err.response.data.message[0])
    })
}

function logout() {
  localStorage.removeItem('jwt')
  window.location.href = '/'
}
</script>
