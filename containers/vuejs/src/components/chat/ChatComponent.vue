<template>
  <div class="flex flex-col gap-y-2">
    <div class="flex">
      <button :class="'btn btn-accent'" @click="emit('onCloseChat')">
        <span class="material-symbols-outlined"> arrow_back </span>
      </button>
      <button :class="'btn btn-primary ml-auto'" @click="emit('onCloseChat')">
        <span class="material-symbols-outlined"> group </span>
      </button>
      <button :class="'btn btn-warning'" @click="chatSettingsModal.show()">
        <span class="material-symbols-outlined"> settings </span>
      </button>
    </div>
    {{ currentChat?.name }}

    <!-- <div v-if="iAmUser">
      <button class="btn btn-secondary" @click="leave">Leave chat</button>
    </div> -->

    <!-- <div v-if="iAmOwner">
      <div v-if="isProtected"> -->
    <!-- <input
            v-model="password"
            type="password"
            placeholder="New password..."
            @keyup.enter="changePassword"
          /> -->
    <!-- <button @click="changePassword">Change password</button>
      </div>
      <button :class="'btn ' + getBtnColor(visibility)" @click="cycleChatVisibility">
        {{ visibility }}
      </button> -->
    <!-- <button @click="changeVisibility">Change visibility</button> -->
    <!-- </div> -->

    <!-- <div v-if="iAmAdmin">
      <button @click="() => (showOptions = !showOptions)">
        {{ showOptions ? '~ open options ~' : '~ close options ~' }}
      </button>
      <div v-if="showOptions"> -->
    <!-- <input v-model="otherUser" placeholder="42 student..." />
          <button @click="addUser">Add</button>
          <button @click="muteUser">Mute</button>
          <button @click="kickUser">Kick</button>
          <button @click="banUser">Ban</button>
          <button @click="addAdmin">Make admin</button> -->
    <!-- TODO: Use number input here -->
    <!-- <input v-model="daysToMute" placeholder="days to mute..." /> -->
    <!-- </div>
    </div> -->

    <!-- <div v-if="isDirect">(DM)</div> -->

    <div
      ref="chatRef"
      class="scrollable-container flex flex-col gap-y-2 bg-base-100 border-base-300 rounded-box"
    >
      <div v-for="(message, index) in chatHistory" :key="index">
        <div class="flex flex-row gap-x-2">
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
    <ChatSettingsModal
      ref="chatSettingsModal"
      @onCloseSettingsModal="chatSettingsModal.hide()"
      @onCloseChat="emit('onCloseChat')"
      :currentChat="currentChat"
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
import ChatSettingsModal from './ChatSettingsModal.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const chatSocket: Socket = inject('chatSocket')!

const props = defineProps({
  currentChat: Object as PropType<Chat>
})

const muted = ref(false)
const sentMessageRef = ref('')
const chatHistory = ref<Message[]>([])
const chatRef = ref()
const profilePictures = ref(new Map<Message['sender'], string>())
const chatSettingsModal = ref()

const emit = defineEmits(['onCloseChat'])

function sendMessage() {
  if (props.currentChat) {
    const message = {
      chatId: props.currentChat.chat_id,
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
        alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
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
  if (props.currentChat) {
    const blockedUsers = await get('api/user/blocked')
      .then((blockedUsers) => blockedUsers.map((user: any) => user.intra_id))
      .catch((err) => {
        alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
      })
    const blocked = new Set<number>(blockedUsers)

    chatHistory.value = await get('api/chats/history/' + props.currentChat.chat_id)
      .then((messages) =>
        messages
          .filter((message: Message) => !blocked.has(message.sender))
          .map((message: Message) => {
            return { ...message, date: new Date(message.date) } // Serialize date
          })
      )
      .catch((err) => {
        alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
      })

    await chatHistory.value.forEach(async (message) => await retrieveProfilePicture(message.sender))

    await scrollToBottom()
  }
}

function getErrorMessage(msg: string | string[]) {
  if (typeof msg === 'string') {
    return msg
  }
  return msg.join('\n')
}

getChat()
</script>

<style scoped>
.scrollable-container {
  width: 100%;
  height: 700px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  word-break: break-all;
}
</style>
