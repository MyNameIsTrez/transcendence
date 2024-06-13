<template>
  <div>
    <div v-if="!currentChat">
      My chats
      <span class="material-symbols-outlined align-bottom">person</span>
      <div class="scrollable-container-half">
        <div v-for="(chat, index) in myChats" :key="index" class="line" @click="openChat(chat)">
          {{ chat.name }}
        </div>
      </div>

      <!-- TODO: Turn these three identical chat list blocks into a shared component -->
      Public chats
      <span class="material-symbols-outlined align-bottom">public</span>
      <div class="scrollable-container-half">
        <div
          v-for="(chat, index) in getPublicChats()"
          :key="index"
          class="line"
          @click="clickedPublicChat(chat)"
        >
          {{ chat.name }}
        </div>
      </div>

      Protected chats
      <span class="material-symbols-outlined align-bottom">lock</span>
      <div class="scrollable-container-half">
        <div
          v-for="(chat, index) in getProtectedChats()"
          :key="index"
          class="line"
          @click="clickedProtectedChat(chat)"
        >
          {{ chat.name }}
        </div>
      </div>

      <button :class="'btn btn-info'" @click="chatCreationModal.show()">Create chat</button>

      <ChatCreationModal ref="chatCreationModal" @onCloseCreateChat="chatCreationModal.hide()" />
    </div>

    <ChatComponent v-if="currentChat" @onCloseChat="closeChat" :currentChat="currentChat" />

    <PasswordModal ref="passwordModal" @onEnter="enterProtectedChat"> </PasswordModal>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import { get, post } from '../httpRequests'
import { nextTick } from 'vue'
import { Socket } from 'socket.io-client'
import ChatCreationModal from './chat/ChatCreationModal.vue'
import PasswordModal from './chat/PasswordModal.vue'
import ChatComponent from './chat/ChatComponent.vue'
import { AlertType } from '../types'
import Chat from './chat/ChatClass'
import Message from './chat/MessageClass'
import Visibility from './chat/VisibilityEnum'
import AlertPopup from './AlertPopup.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!

const chatSocket: Socket = inject('chatSocket')!

const publicAndProtectedChats = ref<Chat[]>([])
const myChats = ref<Chat[]>([])
const currentChat = ref<Chat | null>(null)
const selectedChat = ref<Chat | null>(null)
// const daysToMute = ref<string>('0')
const iAmAdmin = ref(false) // TODO: Replace all usage of this with currentChat.iAmAdmin
const iAmMute = ref(false) // TODO: Replace all usage of this with currentChat.iAmMute
const iAmOwner = ref(false) // TODO: Replace all usage of this with currentChat.iAmOwner
const iAmUser = ref(false) // TODO: Replace all usage of this with currentChat.iAmUser
const isDirect = ref(false) // TODO: Replace all usage of this with currentChat.isDirect
const isProtected = ref(false) // TODO: Replace all usage of this with currentChat.isProtected
const myIntraId = ref('')
const myUsername = ref('')
// const otherUser = ref('')
const showOptions = ref(false)

const passwordModal = ref()
const chatCreationModal = ref()

// async function leave() {
//   if (currentChat.value) {
//     await get('api/chats/leave/' + currentChat.value.chat_id).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     // getChats()
//     currentChat.value = null
//   }
// }

// async function changePassword() {
//   if (currentChat.value) {
//     await post('api/chats/changePassword', {
//       chat_id: currentChat.value.chat_id,
//       password: password.value,
//       intra_id: 'foo'
//     }).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     password.value = ''
//   }
// }

// async function changeVisibility() {
//   if (currentChat.value) {
//     if (password.value === '' && visibility.value === Visibility.PROTECTED) return
//     if (password.value === '') password.value = 'foo'
//     await post('api/chats/changeVisibility', {
//       chat_id: currentChat.value.chat_id,
//       visibility: visibility.value,
//       password: password.value
//     }).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     password.value = ''
//     // getChats()
//   }
// }

function closeChat() {
  if (currentChat.value) {
    chatSocket.emit('closeChat', { chatId: currentChat.value.chat_id })
    currentChat.value = null
  }
}

async function getMyIntraId() {
  myIntraId.value = await get('api/user/intraId').catch((err) => {
    alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
  })
}

async function getMyUsername() {
  myUsername.value = await get('api/user/username').catch((err) => {
    alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
  })
}

// async function addUser() {
//   if (currentChat.value) {
//     const add_user = await post('api/chats/addUserToChat', {
//       chat_id: currentChat.value.chat_id,
//       intra_id: otherUserId
//     }).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function muteUser() {
//   if (currentChat.value) {
//     // TODO: Let chat_id be passed in the URL between /chat and /mute
//     await post('api/chats/mute', {
//       chat_id: currentChat.value.chat_id,
//       intra_id: otherUserId,
//       days: parseInt(daysToMute.value)
//     }).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     daysToMute.value = '0'
//   }
// }

// async function kickUser() {
//   if (currentChat.value) {
//     // TODO: Turn this into a POST as "api/chats/:chat_id/kick/", and let otherUser be passed as the body
//     await get('api/chats/kick/' + currentChat.value.chat_id + '/' + otherUser.value).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function banUser() {
//   if (currentChat.value) {
//     // TODO: Turn this into a POST as "api/chats/:chat_id/ban/", and let otherUser be passed as the body
//     await get('api/chats/ban/' + currentChat.value.chat_id + '/' + otherUser.value).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
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
//     await post('api/chats/addAdminToChat', {
//       chat_id: currentChat.value.chat_id,
//       intra_id: otherUserId
//     }).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function getInfo() {
//   if (currentChat.value) {
//     getChats()
//     const info = await get('api/chats/info/' + currentChat.value.chat_id).catch((err) => {
//       alertMessage.value = getErrorMessage(err.response.data.message)
//       alertPopup.value.show()
//     })
//     console.log('info', info)
//     iAmUser.value = info.isUser
//     iAmAdmin.value = info.isAdmin
//     iAmMute.value = info.isMute
//     iAmOwner.value = info.isOwner
//     isProtected.value = info.isProtected
//     isDirect.value = info.isDirect
//   }
// }

function openChat(chat: Chat) {
  chatSocket.emit('openChat', { chatId: chat.chat_id }, () => {
    currentChat.value = chat
  })
}

function clickedPublicChat(chat: Chat) {
  chatSocket.emit('joinChat', { chatId: chat.chat_id }, () => {
    openChat(chat)
  })
}

function clickedProtectedChat(chat: Chat) {
  selectedChat.value = chat

  passwordModal.value.show()
}

function enterProtectedChat(password_: string) {
  if (!selectedChat.value) {
    console.error("selectedChat wasn't supposed to be null")
    return
  }

  chatSocket.emit('joinChat', { chatId: selectedChat.value.chat_id, password: password_ }, () => {
    passwordModal.value.hide()

    openChat(selectedChat.value!)

    selectedChat.value = null
  })
}

async function getChats() {
  myChats.value = await get('api/user/myChats').catch((err) => {
    alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
  })

  publicAndProtectedChats.value = await get('api/chats').catch((err) => {
    alertPopup.value.showWarning(getErrorMessage(err.response.data.message))
  })
}

chatSocket.on('addMyChat', async (chat: Chat) => {
  myChats.value.push(chat)
})
chatSocket.on('addChat', async (chat: Chat) => {
  if (chat.visibility !== Visibility.PRIVATE) {
    publicAndProtectedChats.value.push(chat)
  }
})
chatSocket.on('removeChat', async (chat: Chat) => {})

function getErrorMessage(msg: string | string[]) {
  if (typeof msg === 'string') {
    return msg
  }
  return msg.join('\n')
}

chatSocket.on('exception', (data) => {
  alertPopup.value.showWarning(getErrorMessage(data.message))
})

function getPublicChats() {
  const publicChats = publicAndProtectedChats.value.filter(
    (chat) => chat.visibility === Visibility.PUBLIC
  )

  return publicChats.filter((publicChat) =>
    myChats.value.every((myChat) => myChat.chat_id !== publicChat.chat_id)
  )
}

function getProtectedChats() {
  const protectedChats = publicAndProtectedChats.value.filter(
    (chat) => chat.visibility === Visibility.PROTECTED
  )

  return protectedChats.filter((protectedChat) =>
    myChats.value.every((myChat) => myChat.chat_id !== protectedChat.chat_id)
  )
}

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
