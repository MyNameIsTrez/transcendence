<template>
  <div class="p-6">
    <div class="grid justify-center">
      <span class="grid grid-cols-2">
        <div class="text text-lg justify-self-start text-yellow-200">{{ username }}</div>
        <!-- The button to open modal -->
        <button class="btn w-24 justify-self-end" onclick="my_modal_7.showModal()">Edit</button>

        <!-- Put this part before </body> tag -->
        <dialog id="my_modal_7" class="modal place-content-center">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ alertMessage }}</span>
          </div>
          <div class="modal-box w-auto">
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
			<p class="text-center text-gray-400" style="padding-top: 20px">Press [ESC] to close</p>
          </div>
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
          W/L ratio: <span class="text text-green-500">121</span>/<span class="text text-red-600"
            >1</span
          >
        </div>
      </div>

      <div style="clear: both; padding-top: 50px">
        <!-- <div tabindex="0" class="collapse w-96 bg-base-200"> -->
        <div class="collapse w-96 bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-xl text-left">Match history</div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import MatchReport from './profile/MatchReport.vue'
// import Achievements from './profile/Achievements.vue'
import Achievements from './achievements/Achievements.vue'
import { get, getImage, post } from '../../httpRequests'
import { ref } from 'vue'

const username = await get('user/username')
const intraId = await get('user/intraId')
const profilePicture = await getImage(`user/profilePicture/${intraId}.png`)

const newUsername = ref('')

function uploadProfilePicture(event: any) {
  let data = new FormData()
  data.append('name', 'profilePicture')
  data.append('file', event.target.files[0])
  post('user/profilePicture', data).then(() => location.reload())
}

const alertVisibility = ref('invisible')

const alertMessage = ref('Name change failed')

function checkName() {
  if (newUsername.value != '') {
    const checking = newUsername.value
    for (let i = 0; i < checking.length; i++) {
      if (i >= 16) {
        alertMessage.value = 'Name exceeds character limit of 16'
        return false
      }
      if (checking.charCodeAt(i) < 32 || checking.charCodeAt(i) > 122) {
        alertMessage.value = 'Name contains an illegal character'
        return false
      }
      console.log(checking.charAt(i), checking.charCodeAt(i))
    }
  }
  return true
}

function changeUsername() {
  if (newUsername.value != '') {
    if (checkName()) {
      post('user/username', { username: newUsername.value }).then(() => location.reload())
    } else {
      console.log('invalid username')
      alertVisibility.value = 'visible'
      setTimeout(() => {
        alertVisibility.value = 'invisible'
      }, 3500)
    }
  }
}
</script>

<style lang="scss" scoped></style>
