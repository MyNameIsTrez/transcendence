<template>
  <div>
    <button v-if="currentChat" @click="leaveChat">← Back</button>
    <div v-if="!currentChat">
      My chats
      <span class="material-symbols-outlined align-bottom">person</span>
      <div class="scrollable-container-half">
        <div v-for="(chat, index) in myChats" :key="index" class="line" @click="clickedChat(chat)">
          {{ chat.name }}
        </div>
      </div>

      <!-- TODO: Turn these three identical chat list blocks into a shared component -->
      Public chats
      <span class="material-symbols-outlined align-bottom">public</span>
      <div class="scrollable-container-half">
        <div
          v-for="(chat, index) in publicChats"
          :key="index"
          class="line"
          @click="clickedChat(chat)"
        >
          {{ chat.name }}
        </div>
      </div>

      Protected chats
      <span class="material-symbols-outlined align-bottom">lock</span>
      <div class="scrollable-container-half">
        <div
          v-for="(chat, index) in protectedChats"
          :key="index"
          class="line"
          @click="clickedChat(chat)"
        >
          {{ chat.name }}
        </div>
      </div>

      <!-- <div v-if="selectedChat">
        Password of '{{ selectedChat.name }}':
        <input v-model="password" type="password" placeholder="Password..." @keyup.enter="validatePassword" />
      </div> -->
      <input v-model="inputChatName" placeholder="Chat name..." @keyup.enter="createChat" />
      <button :class="'btn ' + getBtnColor(visibility)" @click="chatVisibility">
        {{ visibility }}
      </button>
      <input
        v-if="visibility === Visibility.PROTECTED"
        v-model="password"
        type="password"
        placeholder="Password..."
        @keyup.enter="createChat"
      />
      <button @click="createChat">Create</button>
    </div>
    <div v-if="currentChat">
      <div v-if="iAmUser">
        <button class="btn btn-secondary" @click="leave">Leave chat</button>
      </div>

      <div v-if="iAmOwner">
        <div v-if="isProtected">
          <input
            v-model="password"
            type="password"
            placeholder="New password..."
            @keyup.enter="changePassword"
          />
          <button @click="changePassword">Change password</button>
        </div>
        <button :class="'btn ' + getBtnColor(visibility)" @click="chatVisibility">
          {{ visibility }}
        </button>
        <input
          v-if="visibility === Visibility.PROTECTED"
          v-model="password"
          type="password"
          placeholder="Password..."
          @keyup.enter="changeVisibility"
        />
        <button @click="changeVisibility">Change visibility</button>
      </div>
      <div v-if="iAmAdmin">
        <button @click="() => (showOptions = !showOptions)">
          {{ showOptions ? '~ open options ~' : '~ close options ~' }}
        </button>
        <div v-if="showOptions">
          <!-- <input v-model="otherUser" placeholder="42 student..." />
          <button @click="addUser">Add</button>
          <button @click="muteUser">Mute</button>
          <button @click="kickUser">Kick</button>
          <button @click="banUser">Ban</button>
          <button @click="addAdmin">Make admin</button> -->
          <!-- TODO: Use number input here -->
          <!-- <input v-model="daysToMute" placeholder="days to mute..." /> -->
        </div>
      </div>

      In chat '{{ currentChat?.name }}'
      <div v-if="isDirect">(DM)</div>

      <div ref="chatRef" class="scrollable-container">
        <div v-for="(message, index) in chatHistory" :key="index" class="line">
          <router-link :to="`/user/${message.sender}`">
            {{ message.sender_name + ': ' + message.body + '\n' }}
          </router-link>
        </div>
      </div>
      <input
        v-if="!iAmMute"
        v-model="sentMessage"
        placeholder="Type message..."
        @keyup.enter="sendMessage"
      />
      <button v-if="!iAmMute" @click="sendMessage">Send</button>
    </div>

    <AlertPopup ref="alertPopup" :alertType="AlertType.ALERT_WARNING">{{
      alertMessage
    }}</AlertPopup>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { get, post } from '../httpRequests'
import { nextTick } from 'vue'
import { Socket } from 'socket.io-client'
import AlertPopup from './AlertPopup.vue'
import { AlertType } from '../types'

const chatSocket: Socket = inject('chatSocket')!

class Message {
  sender_name: string
  sender: number
  body: string

  constructor(sender_name: string, sender: number, body: string) {
    this.sender_name = sender_name
    this.sender = sender
    this.body = body
  }
}

enum Visibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  PROTECTED = 'PROTECTED'
}

class Chat {
  chat_id: string
  name: string
  visibility: Visibility

  constructor(chat_id: string, name: string, visibility: Visibility) {
    this.chat_id = chat_id
    this.name = name
    this.visibility = visibility
  }
}

const chatRef = ref()
const inputChatName = ref('')
const publicChats = ref<Chat[]>([])
const protectedChats = ref<Chat[]>([])
const myChats = ref<Chat[]>()
const currentChat = ref<Chat | null>(null)
const selectedChat = ref<Chat | null>(null)
const chatHistory = ref<Message[]>([])
// const daysToMute = ref<string>('0')
const iAmAdmin = ref(false) // TODO: Replace all usage of this with currentChat.iAmAdmin
const iAmMute = ref(false) // TODO: Replace all usage of this with currentChat.iAmMute
const iAmOwner = ref(false) // TODO: Replace all usage of this with currentChat.iAmOwner
const iAmUser = ref(false) // TODO: Replace all usage of this with currentChat.iAmUser
const isDirect = ref(false) // TODO: Replace all usage of this with currentChat.isDirect
const isProtected = ref(false) // TODO: Replace all usage of this with currentChat.isProtected
const myIntraId = ref('')
const myUsername = ref('')
const password = ref('')
// const otherUser = ref('')
const showOptions = ref(false)
const sentMessage = ref('')
const visibility = ref(Visibility.PUBLIC)

const alertMessage = ref('')
const alertPopup = ref()

async function leave() {
  if (currentChat.value) {
    await get('api/chat/leave/' + currentChat.value.chat_id).catch((err) => {
      alertMessage.value = err.response.data.message.join('\n')
      alertPopup.value.show()
    })
    getChats()
    currentChat.value = null
  }
}

async function changePassword() {
  if (currentChat.value) {
    await post('api/chat/changePassword', {
      chat_id: currentChat.value.chat_id,
      password: password.value,
      intra_id: 'foo'
    }).catch((err) => {
      alertMessage.value = err.response.data.message.join('\n')
      alertPopup.value.show()
    })
    password.value = ''
  }
}

async function changeVisibility() {
  if (currentChat.value) {
    if (password.value === '' && visibility.value === Visibility.PROTECTED) return
    if (password.value === '') password.value = 'foo'
    await post('api/chat/changeVisibility', {
      chat_id: currentChat.value.chat_id,
      visibility: visibility.value,
      password: password.value
    }).catch((err) => {
      alertMessage.value = err.response.data.message.join('\n')
      alertPopup.value.show()
    })
    password.value = ''
    getChats()
  }
}

function leaveChat() {
  if (currentChat.value) {
    chatSocket.emit('leaveChat', { chatId: currentChat.value.chat_id })
    currentChat.value = null
  }
}

async function getMyIntraId() {
  myIntraId.value = await get('api/user/intraId').catch((err) => {
    alertMessage.value = err.response.data.message.join('\n')
    alertPopup.value.show()
  })
}

async function getMyUsername() {
  myUsername.value = await get('api/user/username').catch((err) => {
    alertMessage.value = err.response.data.message.join('\n')
    alertPopup.value.show()
  })
}

// async function addUser() {
//   if (currentChat.value) {
//     const add_user = await post('api/chat/addUserToChat', {
//       chat_id: currentChat.value.chat_id,
//       intra_id: otherUserId
//     }).catch((err) => {
//       alertMessage.value = err.response.data.message.join('\n')
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function muteUser() {
//   if (currentChat.value) {
//     // TODO: Let chat_id be passed in the URL between /chat and /mute
//     await post('api/chat/mute', {
//       chat_id: currentChat.value.chat_id,
//       intra_id: otherUserId,
//       days: parseInt(daysToMute.value)
//     }).catch((err) => {
//       alertMessage.value = err.response.data.message.join('\n')
//       alertPopup.value.show()
//     })
//     daysToMute.value = '0'
//   }
// }

// async function kickUser() {
//   if (currentChat.value) {
//     // TODO: Turn this into a POST as "api/chat/:chat_id/kick/", and let otherUser be passed as the body
//     await get('api/chat/kick/' + currentChat.value.chat_id + '/' + otherUser.value).catch((err) => {
//       alertMessage.value = err.response.data.message.join('\n')
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function banUser() {
//   if (currentChat.value) {
//     // TODO: Turn this into a POST as "api/chat/:chat_id/ban/", and let otherUser be passed as the body
//     await get('api/chat/ban/' + currentChat.value.chat_id + '/' + otherUser.value).catch((err) => {
//       alertMessage.value = err.response.data.message.join('\n')
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function addAdmin() {
//   if (currentChat.value) {
//     if (iAmAdmin.value === false) {
//       console.log('No admin authorization')
//       return
//     }
//     console.log('You are admin')
//     await post('api/chat/addAdminToChat', {
//       chat_id: currentChat.value.chat_id,
//       intra_id: otherUserId
//     }).catch((err) => {
//       alertMessage.value = err.response.data.message.join('\n')
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

async function createChat() {
  await post('api/chat/create', {
    name: inputChatName.value,
    visibility: visibility.value,
    password: password.value
  }).catch((err) => {
    alertMessage.value = err.response.data.message.join('\n')
    alertPopup.value.show()
  })
  password.value = ''
  inputChatName.value = ''
  getChats()
}

async function getInfo() {
  if (currentChat.value) {
    getChats()
    const info = await get('api/chat/info/' + currentChat.value.chat_id).catch((err) => {
      alertMessage.value = err.response.data.message.join('\n')
      alertPopup.value.show()
    })
    console.log('info', info)
    iAmUser.value = info.isUser
    iAmAdmin.value = info.isAdmin
    iAmMute.value = info.isMute
    iAmOwner.value = info.isOwner
    isProtected.value = info.isProtected
    isDirect.value = info.isDirect
  }
}

async function clickedChat(chat: Chat) {
  selectedChat.value = chat

  const pw = chat.visibility === Visibility.PROTECTED ? password.value : null
  console.log('pw', pw)

  // TODO: Show an error popup when joining fails
  chatSocket.emit('joinChat', { chatId: chat.chat_id, password: pw }, () => {
    currentChat.value = chat
    selectedChat.value = null
    getChat()
  })
}

async function getChat() {
  if (currentChat.value) {
    const blockedUsers = await get('api/user/blocked')
      .then((blockedUsers) => blockedUsers.map((user: any) => user.intra_id))
      .catch((err) => {
        alertMessage.value = err.response.data.message.join('\n')
        alertPopup.value.show()
      })
    const blocked = new Set<number>(blockedUsers)

    chatHistory.value = await get('api/chat/history/' + currentChat.value.chat_id)
      .then((messages) => messages.filter((message: Message) => !blocked.has(message.sender)))
      .catch((err) => {
        alertMessage.value = err.response.data.message.join('\n')
        alertPopup.value.show()
      })

    getChats()

    await scrollToBottom()
  }
}

async function scrollToBottom() {
  // This forces the chat DOM object to have its scrollHeight updated right now
  await nextTick()

  if (chatRef.value) {
    chatRef.value.scrollTop = chatRef.value.scrollHeight
  }
}

// TODO: I suspect this should only be called in one spot, so try to inline it
async function getChats() {
  publicChats.value = await get('api/chat/publicChats').catch((err) => {
    alertMessage.value = err.response.data.message.join('\n')
    alertPopup.value.show()
  })
  protectedChats.value = await get('api/chat/protectedChats').catch((err) => {
    alertMessage.value = err.response.data.message.join('\n')
    alertPopup.value.show()
  })
  myChats.value = await get('api/user/myChats').catch((err) => {
    alertMessage.value = err.response.data.message.join('\n')
    alertPopup.value.show()
  })
}

chatSocket.on('newMessage', async (message: Message) => {
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

function sendMessage() {
  if (currentChat.value) {
    const message = {
      chatId: currentChat.value.chat_id,
      body: sentMessage.value
    }

    sentMessage.value = ''

    chatSocket.emit('sendMessage', message)
  }
}

function chatVisibility() {
  if (visibility.value === Visibility.PUBLIC) {
    visibility.value = Visibility.PROTECTED
  } else if (visibility.value === Visibility.PROTECTED) {
    visibility.value = Visibility.PRIVATE
  } else {
    visibility.value = Visibility.PUBLIC
  }
}

function getBtnColor(visibility: Visibility) {
  return visibility === Visibility.PUBLIC
    ? 'btn-info'
    : visibility === Visibility.PROTECTED
      ? 'btn-primary'
      : 'btn-warning'
}

chatSocket.on('exception', (data) => {
  alertMessage.value = data.message
  alertPopup.value.show()
})

getMyUsername()
getMyIntraId()
getChats()
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

.scrollable-container-half {
  width: 100%;
  height: 350px;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  overflow-y: auto;
  word-break: break-all;
}

.line {
  width: 100%;
  padding: 5px;
  cursor: pointer;
  user-select: none;
}

.line:hover {
  background-color: hsl(0, 0%, 30%);
}
</style>
