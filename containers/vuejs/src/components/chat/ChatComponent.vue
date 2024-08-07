<template>
  <div class="flex flex-col gap-y-2">
    <div class="flex">
      <button :class="'btn btn-accent'" @click="emit('onCloseChat')">
        <span class="material-symbols-outlined"> arrow_back </span>
      </button>
      <button
        v-if="currentChat?.visibility !== Visibility.DM"
        :class="'btn btn-primary ml-auto'"
        @click="chatUserListModal.$.exposed.show()"
      >
        <span class="material-symbols-outlined"> group </span>
      </button>
      <button
        v-if="currentChat?.visibility !== Visibility.DM && myInfo.admin"
        :class="'btn btn-error'"
        @click="chatBannedListModal.$.exposed.show()"
      >
        <span class="material-symbols-outlined"> group_remove </span>
      </button>
      <button
        v-if="currentChat?.visibility !== Visibility.DM"
        :class="'btn btn-warning'"
        @click="chatSettingsModal.$.exposed.show()"
      >
        <span class="material-symbols-outlined"> settings </span>
      </button>
    </div>

    {{ currentChat?.name }}

    <div
      ref="chatRef"
      class="h-[700px] flex flex-col gap-y-2 bg-base-100 rounded-box p-2 overflow-y-auto break-all"
    >
      <div v-for="(message, index) in chatHistory" :key="index">
        <div v-if="blocked.has(message.sender)">Blocked user's message</div>
        <div v-else class="flex flex-row gap-x-2">
          <div>
            <div :class="`w-16 h-16 avatar mask mask-squircle`">
              <router-link :to="`/user/${message.sender}`">
                <img
                  class="rounded"
                  :src="`${profilePictures.get(message.sender)}`"
                  alt="Profile picture"
                />
              </router-link>
            </div>
          </div>

          <div class="flex flex-row items-baseline gap-x-2">
            <div class="flex flex-col">
              <div class="flex flex-row items-baseline gap-x-2">
                <div class="font-bold">{{ message.sender_name }}</div>
                <div class="text-xs text-gray-300">
                  {{ message.date.toLocaleTimeString([], { timeStyle: 'short' }) }}
                </div>
              </div>

              <div class="text-gray-200 text-sm">{{ message.body }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!muted">
      <input
        v-model="sentMessageRef"
        placeholder="Message..."
        @keyup.enter="sendMessage"
        class="w-full rounded-lg p-2 text-gray-800 bg-gray-200"
      />
    </div>
    <ChatUserListModal
      ref="chatUserListModal"
      @onCloseUserListModal="chatUserListModal.$.exposed.hide()"
      :myInfo="myInfo"
    />
    <ChatBannedListModal
      v-if="myInfo.admin"
      ref="chatBannedListModal"
      @onCloseBannedListModal="chatBannedListModal.$.exposed.hide()"
    />
    <ChatSettingsModal
      ref="chatSettingsModal"
      @onCloseSettingsModal="chatSettingsModal.$.exposed.hide()"
      @onCloseChat="emit('onCloseChat')"
    />
  </div>
</template>

<script setup lang="ts">
import { inject, nextTick, ref, type PropType, type Ref } from 'vue'
import Chat from './ChatClass'
import type { Socket } from 'socket.io-client'
import type Message from './MessageClass'
import { get, getImage } from '../../httpRequests'
import AlertPopup from '../AlertPopup.vue'
import ChatUserListModal from './ChatUserListModal.vue'
import ChatSettingsModal from './ChatSettingsModal.vue'
import ChatBannedListModal from './ChatBannedListModal.vue'
import Visibility from './VisibilityEnum'
import MyInfo from './MyInfoClass'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const chatSocket: Socket = inject('chatSocket')!
const currentChat: Ref<Chat | null> = inject('currentChat')!

const myInfo = ref<MyInfo>(await get(`api/chats/${currentChat.value?.chat_id}/me`))

const muted = ref(false)
const sentMessageRef = ref('')
const chatHistory = ref<Message[]>([])
const chatRef = ref()
const profilePictures = ref(new Map<Message['sender'], string>())
const chatUserListModal = ref()
const chatSettingsModal = ref()
const chatBannedListModal = ref()

const blocked = ref(new Set<number>())

const emit = defineEmits(['onCloseChat'])

function sendMessage() {
  if (currentChat.value) {
    const message = {
      chatId: currentChat.value.chat_id,
      body: sentMessageRef.value
    }

    if (message.body.trim().length === 0) {
      return
    }

    chatSocket.emit('sendMessage', message, () => {
      sentMessageRef.value = ''
    })
  }
}

type UserInfo = {
  intra_id: number
  username?: string
  is_owner?: boolean
  is_admin?: boolean
  is_mute?: boolean
}

chatSocket.on('editUserInfo', async (info: UserInfo) => {
  const me = await get('api/user/me')
  if (info.intra_id !== me.intra_id) {
    return
  }
  if (info.is_owner !== undefined) {
    myInfo.value.owner = info.is_owner
  }
  if (info.is_admin !== undefined) {
    myInfo.value.admin = info.is_admin
  }
})

chatSocket.on('newMessage', async (message: Message) => {
  message.date = new Date(message.date)

  await retrieveProfilePicture(message.sender)

  // TODO: Either the frontend or backend should filter for blocked messages
  chatHistory.value.push(message)

  // Only scroll down if our scrollbar is already all the way down
  // This is because we don't want to suddenly scroll down
  // when we're reading old messages, and someone sends a message
  //
  // scrollHeight: total container size
  // scrollTop: amount of scroll user has done
  // clientHeight: amount of container a user sees
  if (chatRef.value) {
    // The `+ 1.5` accounts for scrollTop sometimes being bigger or smaller than expected
    if (chatRef.value.scrollTop + chatRef.value.clientHeight + 1.5 >= chatRef.value.scrollHeight) {
      await scrollToBottom()
    }
  }
})

async function retrieveProfilePicture(sender: Message['sender']) {
  if (!profilePictures.value.has(sender)) {
    await getImage('api/user/profilePicture/' + sender)
      .then((pfp) => profilePictures.value.set(sender, pfp))
      .catch((err) => {
        alertPopup.value.showWarning(err.response.data.message)
      })
  }
}

async function scrollToBottom() {
  // This forces the chat DOM object to have its scrollHeight updated right now
  await nextTick()

  if (chatRef.value) {
    chatRef.value.scrollTop = chatRef.value.scrollHeight
  }
}

async function getChat() {
  if (currentChat.value) {
    const blockedUsers = await get('api/user/blocked')
      .then((blockedUsers) =>
        blockedUsers.map((user: any) => {
          return user.intraId
        })
      )
      .catch((err) => {
        alertPopup.value.showWarning(err.response.data.message)
      })
    blocked.value = new Set<number>(blockedUsers)

    chatHistory.value = await get('api/chats/history/' + currentChat.value.chat_id)
      .then((messages) =>
        messages.map((message: Message) => {
          return {
            ...message,
            date: new Date(message.date)
          }
        })
      )
      .catch((err) => {
        alertPopup.value.showWarning(err.response.data.message)
      })

    await chatHistory.value.forEach(async (message) => await retrieveProfilePicture(message.sender))

    await scrollToBottom()
  }
}

chatSocket.on('blockedUser', async (blockedUserIntraId: number) => {
  blocked.value.add(blockedUserIntraId)
})
chatSocket.on('unblockedUser', async (unblockedUserIntraId: number) => {
  blocked.value.delete(unblockedUserIntraId)
})

getChat()
</script>
