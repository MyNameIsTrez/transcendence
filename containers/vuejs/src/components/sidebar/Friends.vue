<template>
  <div class="p-6">
    <div class="flex justify-end">
      <div class="tooltip tooltip-left" data-tip="Add friend">
        <button class="btn btn-primary btn-square self-auto" onclick="my_modal_2.showModal()">
          <span class="material-symbols-outlined">person_add</span>
        </button>
        <dialog id="my_modal_2" class="modal">
          <div class="modal-box">
            <p class="py-4">Add a friend</p>
            <span class="flex justify-center">
              <input
                type="text"
                v-model="friendSearch"
                placeholder="Type here"
                class="input input-bordered w-full max-w-xs"
              />
              <button class="btn" @click="addFriend">Add</button>
            </span>
            <p class="text pt-6">{{ addMessage }}</p>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
    <h1 class="text-center">---- Online ----</h1>
    <template v-for="friend in friends">
      <Friend
        v-if="friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :image="friend.profilePicture"
      />
    </template>
    <h1 class="text-center">---- Offline ----</h1>
    <template v-for="friend in friends">
      <Friend
        v-if="!friend.isOnline"
        :name="friend.name"
        :isOnline="friend.isOnline"
        :image="friend.profilePicture"
      />
    </template>
    <h1 class="text-center">---- Incoming ----</h1>
    <Incoming
	v-for="request in incomingRequests"
      :name="request.name"
      :image="request.profilePicture"
    />
  </div>
</template>

<script setup lang="ts">
import Friend from './friends/Friend.vue'
import Incoming from './friends/Incoming.vue'
import { get, getImage, post } from '../../httpRequests'
import { ref } from 'vue'

const friends = await get('user/friends')
const incomingRequests = await get('user/incomingFriendRequests')

const friendSearch = ref('')

// const props = defineProps({
// 	addMessage: String,
// })

var addMessage = ''

async function addFriend() {
  console.log(friendSearch.value)
  const foundUser = await post('user/sendFriendRequest', { intra_name: friendSearch.value }).then((resp) => {
    console.log(resp)
    if (resp != '') {
      addMessage = 'Friend request sent'
    } else {
      addMessage = 'User not found'
    }
  })
  //   addMessage = 'test'
}

// const friends = [
//   {
//     name: 'sbos',
//     isOnline: true,
//     profilePicture: 'https://cdn.intra.42.fr/users/9a7a6d2e4ef5139c2bc8bb5271f7e3cc/sbos.jpg'
//   },
//   {
//     name: 'vbenneko',
//     isOnline: false,
//     profilePicture: 'https://cdn.intra.42.fr/users/0519bc4a463d666788591a6fcb3dc296/vbenneko.jpg'
//   }
// ]

console.log('friends', friends)
// function displayFriends() {}
</script>
