<template>
  <div class="p-6">
    <div class="grid justify-center">
      <span class="grid grid-flow-row-dense grid-cols-2">
        <div class="text text-base justify-self-start self-center text-yellow-200 w-64">
          {{ username }}
        </div>
        <!-- The button to open modal -->
        <button class="btn w-32 justify-self-end" onclick="my_modal_7.showModal()">Settings</button>

        <dialog id="my_modal_7" class="modal">
          <span class="place-content-center" style="grid-column-start: 1; grid-row-start: 1">
            <div class="modal-box w-auto">
              <!-- Adds a little close button in the top-right corner -->
              <form method="dialog">
                <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
              </form>

              <p class="py-4">Edit your name</p>
              <span class="flex justify-center">
                <input
                  type="text"
                  v-model="newUsername"
                  placeholder="New name"
                  class="input input-bordered w-full max-w-xs"
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
            </div>
            <div role="alert" :class="`alert alert-warning ${alertVisibility}`">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{{ alertMessage }}</span>
            </div>
          </span>
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
            <MatchReport
              player="mforstho"
              opponent="safoh"
              :p1Score="10"
              :p2Score="7"
              v-bind:playerWon="true"
            />
            <br />
            <MatchReport
              player="mforstho"
              opponent="safoh"
              :p1Score="5"
              :p2Score="10"
              v-bind:playerWon="false"
            />
            <br />
            <MatchReport
              player="mforstho"
              opponent="safoh"
              :p1Score="10"
              :p2Score="3"
              v-bind:playerWon="true"
            />
          </div>
        </div>
      </div>
      <br />
      <Achievements />

      <br />
      <button class="btn w-auto text-xl" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import MatchReport from './profile/MatchReport.vue'
import Achievements from './achievements/Achievements.vue'
import { get, getImage, post } from '../../httpRequests'
import { ref } from 'vue'

const me = await get(`user/me`)
const username = me.username
const wins = me.wins
const losses = me.losses
const profilePicture = await getImage(`user/profilePicture/${me.intra_id}.png`)

const newUsername = ref('')

function uploadProfilePicture(event: any) {
  let data = new FormData()
  data.append('name', 'profilePicture')
  data.append('file', event.target.files[0])
  post('user/profilePicture', data).then(() => location.reload())
}

const alertVisibility = ref('invisible')

const alertMessage = ref('Name change failed')

function changeUsername() {
  post('user/setUsername', { username: newUsername.value })
    .then(() => location.reload())
    .catch((err) => {
      console.log('catch test', err.response.data.message)
      alertMessage.value = err.response.data.message[0]
      alertVisibility.value = 'visible'
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    })
}

function logout() {
  localStorage.removeItem('jwt')
  window.location.href = '/'
}
</script>

<style lang="scss" scoped></style>
