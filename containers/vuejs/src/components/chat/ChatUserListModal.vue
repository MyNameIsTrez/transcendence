<template>
  <dialog ref="modal" class="modal">
    <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
      <div class="modal-box w-[450px] justify-self-center">
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
            <button
              :class="`${user.intra_id === selectedUser?.intra_id ? 'bg-base-200' : ''} hover:bg-base-300 w-full p-2`"
              @click="selectedUser = user"
            >
              <div class="flex flex-row gap-x-2">
                <router-link :to="`/user/${user.intra_id}`" @click="emit('onCloseUserListModal')">
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

                  <div class="flex flex-row">
                    <span v-if="user.is_owner" class="material-symbols-outlined"> diamond </span>
                    <span v-else-if="user.is_admin" class="material-symbols-outlined"> gavel </span>

                    <span v-if="user.is_mute" class="material-symbols-outlined"> volume_off </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
        <div v-if="props.myInfo?.admin && selectedUser" class="flex flex-row space-x-1 mt-1">
          <button
            v-if="!selectedUser.is_mute"
            class="flex-1 btn btn-warning"
            @click="chatMuteModal.$.exposed.show()"
          >
            Mute
          </button>
          <button v-else class="flex-1 btn btn-warning" @click="unmute">Unmute</button>
          <button class="flex-1 btn btn-warning" @click="kick">Kick</button>
          <button class="flex-1 btn btn-warning" @click="ban">Ban</button>
          <button
            v-if="props.myInfo?.owner && !selectedUser.is_admin"
            class="flex-1 btn btn-warning"
            @click="admin"
          >
            Admin
          </button>
          <button
            v-if="props.myInfo?.owner && selectedUser.is_admin"
            class="flex-1 btn btn-warning"
            @click="unadmin"
          >
            Unadmin
          </button>
        </div>
      </div>
    </span>

    <!-- Allows clicking outside of the modal to close it -->
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
    <ChatMuteModal
      ref="chatMuteModal"
      @onCloseMuteModal="chatMuteModal.$.exposed.hide()"
      @onMute="mute"
    ></ChatMuteModal>
  </dialog>
</template>

<script setup lang="ts">
import type { Socket } from 'socket.io-client'
import { inject, ref, type PropType, type Ref } from 'vue'
import { get, getImage, post } from '@/httpRequests'
import Chat from './ChatClass'
import MyInfo from './MyInfoClass'
import AlertPopup from '../AlertPopup.vue'
import ChatMuteModal from './ChatMuteModal.vue'

type UserInfo = {
  intra_id: number
  username?: string
  is_owner?: boolean
  is_admin?: boolean
  is_mute?: boolean
}

const chatMuteModal = ref()

const chatSocket: Socket = inject('chatSocket')!
const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const currentChat: Ref<Chat | null> = inject('currentChat')!

const props = defineProps({
  myInfo: Object as PropType<MyInfo>
})

defineExpose({
  show() {
    modal.value.showModal()
  },
  hide() {
    modal.value.close()
  }
})

const users = ref<UserInfo[]>(await get(`api/chats/${currentChat.value?.chat_id}/users`))

const profilePictures = ref(new Map<UserInfo['intra_id'], string>())
users.value.forEach(
  async (user) =>
    await profilePictures.value.set(
      user.intra_id,
      await getImage(`api/user/profilePicture/${user.intra_id}`)
    )
)

chatSocket.on('addUser', async (user: UserInfo) => {
  if (!users.value.some((other) => other.intra_id === user.intra_id)) {
    profilePictures.value.set(
      user.intra_id,
      await getImage(`api/user/profilePicture/${user.intra_id}`)
    )
    users.value.push(user)
  }
})

chatSocket.on('removeUser', (intra_id: number) => {
  const index = users.value.findIndex((user) => user.intra_id === intra_id)
  if (index !== -1) {
    users.value.splice(index, 1)
  }
})

chatSocket.on('editUserInfo', (info: UserInfo) => {
  const user = users.value.find((user) => user.intra_id === info.intra_id)
  if (user === undefined) {
    return
  }
  if (info.is_owner !== undefined) {
    user.is_owner = info.is_owner
  }
  if (info.is_admin !== undefined) {
    user.is_admin = info.is_admin
  }
  if (info.is_mute !== undefined) {
    user.is_mute = info.is_mute
  }
})

const selectedUser = ref<UserInfo>()

const modal = ref()

async function mute(endDate: Date) {
  await post(`api/chats/${currentChat.value?.chat_id}/mute`, {
    intra_id: selectedUser.value?.intra_id,
    endDate
  }).catch((err) => {
    alertPopup.value.showWarning(err.response.data.message)
  })
}

async function unmute() {
  await post(`api/chats/${currentChat.value?.chat_id}/unmute`, {
    intra_id: selectedUser.value?.intra_id
  }).catch((err) => {
    alertPopup.value.showWarning(err.response.data.message)
  })
}

async function kick() {
  await post(`api/chats/${currentChat.value?.chat_id}/kick`, {
    intra_id: selectedUser.value?.intra_id
  })
    .then(() => (selectedUser.value = undefined))
    .catch((err) => {
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function ban() {
  await post(`api/chats/${currentChat.value?.chat_id}/ban`, {
    intra_id: selectedUser.value?.intra_id
  })
    .then(() => (selectedUser.value = undefined))
    .catch((err) => {
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function admin() {
  await post(`api/chats/${currentChat.value?.chat_id}/admin`, {
    intra_id: selectedUser.value?.intra_id
  }).catch((err) => {
    alertPopup.value.showWarning(err.response.data.message)
  })
}

async function unadmin() {
  await post(`api/chats/${currentChat.value?.chat_id}/unadmin`, {
    intra_id: selectedUser.value?.intra_id
  }).catch((err) => {
    alertPopup.value.showWarning(err.response.data.message)
  })
}

const emit = defineEmits(['onCloseUserListModal'])
</script>
