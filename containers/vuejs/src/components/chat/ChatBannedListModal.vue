<template>
  <dialog ref="modal" class="modal">
    <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
      <div class="modal-box w-[450px] justify-self-center">
        <!-- Adds a little close button in the top-right corner -->
        <form method="dialog">
          <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Banned user list</h3>

        <div
          ref="chatRef"
          class="flex flex-col bg-base-100 border rounded-md border-solid p-4 mt-4 overflow-y-auto h-[400px]"
        >
          <div v-for="(user, index) in bannedUsers" :key="index">
            <button
              :class="`${user.intra_id === selectedUser?.intra_id ? 'bg-base-200' : ''} hover:bg-base-300 w-full p-2`"
              @click="selectedUser = user"
            >
              <div class="flex flex-row gap-x-2">
                <router-link :to="`/user/${user.intra_id}`" @click="emit('onCloseBannedListModal')">
                  <div :class="`w-16 h-16 avatar`">
                    <img
                      class="rounded"
                      :src="profilePictures.get(user.intra_id)"
                      alt="Profile picture"
                    />
                  </div>
                </router-link>

                <div class="flex flex-col">
                  <div class="mt-2">{{ user.username }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        <div v-if="myInfo.admin && selectedUser" class="flex flex-row space-x-1 mt-1">
          <button class="flex-1 btn btn-warning" @click="unban">Unban</button>
        </div>
      </div>
    </span>

    <!-- Allows clicking outside of the modal to close it -->
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { Socket } from 'socket.io-client'
import { inject, ref, type Ref } from 'vue'
import { get, getImage, post } from '@/httpRequests'
import MyInfo from './MyInfoClass'
import AlertPopup from '../AlertPopup.vue'
import type Chat from './ChatClass'

type BannedUserInfo = {
  intra_id: number
  username?: string
  is_banned?: boolean
}

const chatSocket: Socket = inject('chatSocket')!
const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const currentChat: Ref<Chat | null> = inject('currentChat')!

defineExpose({
  show() {
    modal.value.showModal()
  },
  hide() {
    modal.value.close()
  }
})

const myInfo = ref<MyInfo>(await get(`api/chats/${currentChat.value?.chat_id}/me`))

const bannedUsers = ref<BannedUserInfo[]>(
  await get(`api/chats/${currentChat.value?.chat_id}/banned_users`)
)

const profilePictures = ref(new Map<BannedUserInfo['intra_id'], string>())
bannedUsers.value.forEach(
  async (user) =>
    await profilePictures.value.set(
      user.intra_id,
      await getImage(`api/user/profilePicture/${user.intra_id}`)
    )
)

chatSocket.on('addBannedUser', async (user: BannedUserInfo) => {
  if (!bannedUsers.value.some((other) => other.intra_id === user.intra_id)) {
    profilePictures.value.set(
      user.intra_id,
      await getImage(`api/user/profilePicture/${user.intra_id}`)
    )
    bannedUsers.value.push(user)
  }
})

chatSocket.on('removeUnbannedUser', (intra_id: number) => {
  const index = bannedUsers.value.findIndex((user) => user.intra_id === intra_id)
  if (index !== -1) {
    bannedUsers.value.splice(index, 1)
  }
})

const selectedUser = ref<BannedUserInfo>()

const modal = ref()

async function unban() {
  await post(`api/chats/${currentChat.value?.chat_id}/unban`, {
    intra_id: selectedUser.value?.intra_id
  }).catch((err) => {
    alertPopup.value.showWarning(err.response.data.message)
  })
}

const emit = defineEmits(['onCloseBannedListModal'])
</script>
