<template>
  <dialog ref="modal" class="modal">
    <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
      <div class="modal-box w-auto justify-self-center">
        <!-- Adds a little close button in the top-right corner -->
        <form method="dialog">
          <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">User list</h3>

        <div
          ref="chatRef"
          class="flex flex-col bg-base-100 border rounded-md border-solid p-4 mt-4 overflow-y-auto h-[400px]"
        >
          <div v-for="(user, index) in users" :key="index">
            <!-- <router-link :to="`/user/${user.intra_id}`"> -->
            <button
              :class="`${user.intra_id === selectedIntraId ? 'bg-base-200' : ''} hover:bg-base-300 w-full p-2`"
              @click="selectedIntraId = user.intra_id"
            >
              <div class="flex flex-row gap-x-2">
                <div :class="`w-16 h-16 avatar`">
                  <img
                    class="rounded"
                    :src="profilePictures.get(user.intra_id)"
                    alt="Profile picture"
                  />
                </div>

                <div class="flex flex-col">
                  <div class="mt-2">{{ user.username }}</div>

                  <div class="flex flex-row">
                    <span v-if="user.is_owner" class="material-symbols-outlined"> diamond </span>
                    <span v-else-if="user.is_admin" class="material-symbols-outlined"> gavel </span>

                    <span v-if="user.is_mute" class="material-symbols-outlined"> volume_off </span>
                  </div>
                </div>
              </div>
            </button>
            <!-- </router-link> -->
          </div>
        </div>
        <div v-if="myInfo.admin" class="flex flex-row">
          <button class="flex-1 w-0 btn btn-warning">Mute</button>
          <button class="flex-1 w-0 btn btn-warning">Kick</button>
          <button class="flex-1 w-0 btn btn-warning">Ban</button>
          <button class="flex-1 w-0 btn btn-warning">Admin</button>
        </div>
      </div>
    </span>

    <!-- TODO: Draw google icons for these actions at the bottom of the list
		1. Kick
		2. Ban
		3. Mute
		4. Admin
	  -->

    <!-- Allows clicking outside of the modal to close it -->
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { Socket } from 'socket.io-client'
import { inject, ref, type PropType, type Ref } from 'vue'
import { get, getImage, post } from '@/httpRequests'
import Chat from './ChatClass'
import MyInfo from './MyInfoClass'
import AlertPopup from '../AlertPopup.vue'

type UserInfo = {
  intra_id: number
  username: string
  is_owner: boolean
  is_admin: boolean
  is_mute: boolean
}

const chatSocket: Socket = inject('chatSocket')!
const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!

const props = defineProps({
  currentChat: Object as PropType<Chat>
})

defineExpose({
  show() {
    modal.value.showModal()
  },
  hide() {
    modal.value.close()
  }
})

const myInfo = ref<MyInfo>(await get(`api/chats/${props.currentChat?.chat_id}/me`))
const users = ref<UserInfo[]>(await get(`api/chats/${props.currentChat?.chat_id}/users`))

// TODO: Remove this
// for (let i = 0; i < 100; i++) {
//   users.value.push(users.value[0])
// }

const profilePictures = ref(new Map<UserInfo['intra_id'], string>())
users.value.forEach(
  async (user) =>
    await profilePictures.value.set(
      user.intra_id,
      await getImage(`api/user/profilePicture/${user.intra_id}`)
    )
)

const selectedIntraId = ref()

const modal = ref()

async function mute() {
  await post(`api/chats/${props.currentChat?.chat_id}/mute`, { intra_id: selectedIntraId }).then(
    (res) => {
      users.value.forEach((user) => {
        if (user.intra_id === res.intra_id) {
          user.mute = res.mute
        }
      })
    }
  ) // TODO: Add a .catch() with error popup
}

async function kick() {
  await post(`api/chats/${props.currentChat?.chat_id}/kick`, { intra_id: selectedIntraId }).then(
    (res) => {
      users.value.filter((user) => user.intra_id === res.intra_id)
    }
  ) // TODO: Add a .catch() with error popup
}

async function ban() {
  await post(`api/chats/${props.currentChat?.chat_id}/ban`, { intra_id: selectedIntraId }).then(
    (res) => {
      users.value.filter((user) => user.intra_id === res.intra_id)
    }
  ) // TODO: Add a .catch() with error popup
}

async function admin() {
  await post(`api/chats/${props.currentChat?.chat_id}/admin`, { intra_id: selectedIntraId }).then(
    (res) => {
      users.value.forEach((user) => {
        if (user.intra_id === res.intra_id) {
          user.admin = res.admin
        }
      })
    }
  ) // TODO: Add a .catch() with error popup
}

const emit = defineEmits(['onCloseUserListModal'])
</script>
