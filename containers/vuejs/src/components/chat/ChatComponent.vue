<template>
  <button @click="emit('onCloseChat')">← Back</button>

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

  In chat '{{ currentChat?.name }}'
  <!-- <div v-if="isDirect">(DM)</div> -->

  <div ref="chatRef" class="scrollable-container">
    <div v-for="(message, index) in chatHistory" :key="index" class="line">
      <router-link :to="`/user/${message.sender}`">
        {{
          message.sender_name +
          ' at ' +
          message.date.toLocaleTimeString([], { timeStyle: 'short' }) +
          ': ' +
          message.body +
          '\n'
        }}
      </router-link>
    </div>
  </div>

  <div v-if="!muted">
    <input v-model="sentMessageRef" placeholder="Type message..." @keyup.enter="sendMessage" />

    <button @click="sendMessage">Send</button>
  </div>
</template>

<script setup lang="ts">
import { inject, nextTick, ref, type PropType, type Ref } from 'vue'
import Chat from './ChatClass'
import type { Socket } from 'socket.io-client'
import type Message from './MessageClass'
import { get } from '../../httpRequests'
import AlertPopup from '../AlertPopup.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const chatSocket: Socket = inject('chatSocket')!

const props = defineProps({
  currentChat: Object as PropType<Chat>
})

const muted = ref(false)
const sentMessageRef = ref('')
const chatHistory = ref<Message[]>([])
const chatRef = ref()

const emit = defineEmits(['onCloseChat'])

function sendMessage() {
  if (props.currentChat) {
    const message = {
      chatId: props.currentChat.chat_id,
      body: sentMessageRef.value
    }

    sentMessageRef.value = ''

    chatSocket.emit('sendMessage', message)
  }
}

chatSocket.on('newMessage', async (message: Message) => {
  message.date = new Date(message.date)

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
