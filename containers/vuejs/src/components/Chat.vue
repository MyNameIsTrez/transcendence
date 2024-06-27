<template>
  <div>
    <div v-if="!currentChat" class="flex flex-col">
      <div class="grid grid-flow-col">
        <button
          class="btn text-xs tooltip tooltip-left"
          data-tip="My chats"
          @click="viewedBrowserRef = ViewedBrowser.MY_CHATS"
        >
          <span class="material-symbols-outlined align-bottom">person</span>
        </button>
        <button
          class="btn text-xs tooltip tooltip-left"
          data-tip="Public chats"
          @click="viewedBrowserRef = ViewedBrowser.PUBLIC_CHATS"
        >
          <span class="material-symbols-outlined align-bottom">public</span>
        </button>
        <button
          class="btn text-xs tooltip tooltip-left"
          data-tip="Protected chats"
          @click="viewedBrowserRef = ViewedBrowser.PROTECTED_CHATS"
        >
          <span class="material-symbols-outlined align-bottom">lock</span>
        </button>
      </div>

      <div class="flex flex-col gap-y-2 bg-base-100">
        <ChatList
          v-if="viewedBrowserRef === ViewedBrowser.MY_CHATS"
          :chatsFn="() => myChats"
          :onClickFn="openChat"
        />

        <ChatList
          v-if="viewedBrowserRef === ViewedBrowser.PUBLIC_CHATS"
          :chatsFn="getPublicChats"
          :onClickFn="clickedPublicChat"
        />

        <ChatList
          v-if="viewedBrowserRef === ViewedBrowser.PROTECTED_CHATS"
          :chatsFn="getProtectedChats"
          :onClickFn="clickedProtectedChat"
        />
      </div>

      <button
        v-if="viewedBrowserRef === ViewedBrowser.MY_CHATS"
        :class="'btn btn-info'"
        @click="chatCreationModal.$.exposed.show()"
      >
        Create chat
      </button>

      <ChatCreationModal ref="chatCreationModal" @onCreatedChat="createdChat" />
    </div>

    <ChatComponent v-if="currentChat" @onCloseChat="closeChat" :currentChat="currentChat" />

    <PasswordModal ref="passwordModal" @onEnter="enterProtectedChat"> </PasswordModal>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, type Ref } from 'vue'
import { get } from '../httpRequests'
import { Socket } from 'socket.io-client'
import ChatCreationModal from './chat/ChatCreationModal.vue'
import PasswordModal from './chat/PasswordModal.vue'
import ChatComponent from './chat/ChatComponent.vue'
import ChatList from './chat/ChatList.vue'
import AlertPopup from './AlertPopup.vue'
import Chat from './chat/ChatClass'
import Visibility from './chat/VisibilityEnum'

enum ViewedBrowser {
  MY_CHATS,
  PUBLIC_CHATS,
  PROTECTED_CHATS
}

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const chatSocket: Socket = inject('chatSocket')!

const viewedBrowserRef = ref(ViewedBrowser.MY_CHATS)
const publicAndProtectedChats = ref<Chat[]>([])
const myChats = ref<Chat[]>([])
const currentChat = ref<Chat | null>(null)
const selectedChat = ref<Chat | null>(null)
const passwordModal = ref()
const chatCreationModal = ref()
// const daysToMute = ref<string>('0')
// const iAmAdmin = ref(false) // TODO: Replace all usage of this with currentChat.iAmAdmin
// const iAmMute = ref(false) // TODO: Replace all usage of this with currentChat.iAmMute
// const iAmOwner = ref(false) // TODO: Replace all usage of this with currentChat.iAmOwner
// const iAmUser = ref(false) // TODO: Replace all usage of this with currentChat.iAmUser
// const isDirect = ref(false) // TODO: Replace all usage of this with currentChat.isDirect
// const isProtected = ref(false) // TODO: Replace all usage of this with currentChat.isProtected
// const otherUser = ref('')
// const showOptions = ref(false)

// async function leave() {
//   if (currentChat.value) {
//     await get('api/chats/leave/' + currentChat.value.chat_id).catch((err) => {
//       alertMessage.value = err.response.data.message
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
//       alertMessage.value = err.response.data.message
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
//       alertMessage.value = err.response.data.message
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

// async function addUser() {
//   if (currentChat.value) {
//     const add_user = await post('api/chats/addUserToChat', {
//       chat_id: currentChat.value.chat_id,
//       intra_id: otherUserId
//     }).catch((err) => {
//       alertMessage.value = err.response.data.message
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
//       alertMessage.value = err.response.data.message
//       alertPopup.value.show()
//     })
//     daysToMute.value = '0'
//   }
// }

// async function kickUser() {
//   if (currentChat.value) {
//     // TODO: Turn this into a POST as "api/chats/:chat_id/kick/", and let otherUser be passed as the body
//     await get('api/chats/kick/' + currentChat.value.chat_id + '/' + otherUser.value).catch((err) => {
//       alertMessage.value = err.response.data.message
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function banUser() {
//   if (currentChat.value) {
//     // TODO: Turn this into a POST as "api/chats/:chat_id/ban/", and let otherUser be passed as the body
//     await get('api/chats/ban/' + currentChat.value.chat_id + '/' + otherUser.value).catch((err) => {
//       alertMessage.value = err.response.data.message
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
//       alertMessage.value = err.response.data.message
//       alertPopup.value.show()
//     })
//     otherUser.value = ''
//   }
// }

// async function getInfo() {
//   if (currentChat.value) {
//     getChats()
//     const info = await get('api/chats/info/' + currentChat.value.chat_id).catch((err) => {
//       alertMessage.value = err.response.data.message
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

    const index = publicAndProtectedChats.value.findIndex((other) => other.chat_id === chat.chat_id)
    if (index !== -1) {
      publicAndProtectedChats.value.splice(index, 1)
    }

    myChats.value.push(chat)
  })
}

function clickedProtectedChat(chat: Chat) {
  selectedChat.value = chat

  passwordModal.value.$.exposed.show()
}

function createdChat(chat: Chat) {
  chatCreationModal.value.$.exposed.hide()
  openChat(chat)
}

function enterProtectedChat(password_: string) {
  if (!selectedChat.value) {
    console.error("selectedChat wasn't supposed to be null")
    return
  }

  chatSocket.emit('joinChat', { chatId: selectedChat.value.chat_id, password: password_ }, () => {
    passwordModal.value.$.exposed.hide()

    openChat(selectedChat.value!)

    const index = publicAndProtectedChats.value.findIndex(
      (chat) => chat.chat_id === selectedChat.value!.chat_id
    )
    if (index !== -1) {
      publicAndProtectedChats.value.splice(index, 1)
    }

    myChats.value.push(selectedChat.value!)

    selectedChat.value = null
  })
}

async function getChats() {
  myChats.value = await get('api/user/myChats').catch((err) => {
    alertPopup.value.showWarning(err.response.data.message)
  })

  publicAndProtectedChats.value = await get('api/chats').catch((err) => {
    alertPopup.value.showWarning(err.response.data.message)
  })
}

chatSocket.on('addMyChat', (chat: Chat) => {
  myChats.value.push(chat)
})
chatSocket.on('addChat', (chat: Chat) => {
  if (chat.visibility !== Visibility.PRIVATE) {
    publicAndProtectedChats.value.push(chat)
  }
})
chatSocket.on('removeChat', (chat_id: string) => {
  let index = myChats.value.findIndex((chat) => chat.chat_id === chat_id)
  if (index !== -1) {
    myChats.value.splice(index, 1)
  }

  index = publicAndProtectedChats.value.findIndex((chat) => chat.chat_id === chat_id)
  if (index !== -1) {
    publicAndProtectedChats.value.splice(index, 1)
  }
})

chatSocket.on('exception', (data) => {
  alertPopup.value.showWarning(data.message)
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

getChats()
</script>
