<template>
  <div>
    <div v-if="!currentChat" class="flex flex-col">
      <div class="grid grid-flow-col">
        <button
          class="btn text-xs tooltip tooltip-left"
          data-tip="Direct messages"
          @click="viewedBrowserRef = ViewedBrowser.DMS"
        >
          <span class="material-symbols-outlined align-bottom">message</span>
        </button>
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
          v-if="viewedBrowserRef === ViewedBrowser.DMS"
          :chatsFn="getDMs"
          :onClickFn="openChat"
        />

        <ChatList
          v-if="viewedBrowserRef === ViewedBrowser.MY_CHATS"
          :chatsFn="getMyChats"
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
  DMS,
  MY_CHATS,
  PUBLIC_CHATS,
  PROTECTED_CHATS
}

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!
const chatSocket: Socket = inject('chatSocket')!

const viewedBrowserRef = ref(ViewedBrowser.DMS)
const publicAndProtectedChats = ref<Chat[]>([])
const myChats = ref<Chat[]>([])
const currentChat = ref<Chat | null>(null)
const selectedChat = ref<Chat | null>(null)
const passwordModal = ref()
const chatCreationModal = ref()

function closeChat() {
  if (currentChat.value) {
    chatSocket.emit('closeChat', { chatId: currentChat.value.chat_id })
    currentChat.value = null
  }
}

chatSocket.on('openDM', (chat: Chat) => {
  if (currentChat.value) {
    chatSocket.emit('closeChat', { chatId: currentChat.value.chat_id })
  }
  openChat(chat)
})

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
  const index = publicAndProtectedChats.value.findIndex((chat) => chat.chat_id === chat_id)
  if (index !== -1) {
    publicAndProtectedChats.value.splice(index, 1)
  }
})

chatSocket.on('leaveChat', (chat: Chat) => {
  const index = myChats.value.findIndex((chat) => chat.chat_id === chat.chat_id)
  if (index !== -1) {
    myChats.value.splice(index, 1)
  }

  if (chat.visibility === Visibility.PUBLIC || chat.visibility === Visibility.PROTECTED) {
    if (!publicAndProtectedChats.value.some((other) => other.chat_id === chat.chat_id)) {
      publicAndProtectedChats.value.push(chat)
    }
  }
})

chatSocket.on('kicked', (chat: Chat) => {
  currentChat.value = null

  const index = myChats.value.findIndex((chat) => chat.chat_id === chat.chat_id)
  if (index !== -1) {
    myChats.value.splice(index, 1)
  }

  if (chat.visibility === Visibility.PUBLIC || chat.visibility === Visibility.PROTECTED) {
    if (!publicAndProtectedChats.value.some((other) => other.chat_id === chat.chat_id)) {
      publicAndProtectedChats.value.push(chat)
    }
  }
})

chatSocket.on('banned', (chat: Chat) => {
  currentChat.value = null

  const index = myChats.value.findIndex((chat) => chat.chat_id === chat.chat_id)
  if (index !== -1) {
    myChats.value.splice(index, 1)
  }

  if (chat.visibility === Visibility.PUBLIC || chat.visibility === Visibility.PROTECTED) {
    if (!publicAndProtectedChats.value.some((other) => other.chat_id === chat.chat_id)) {
      publicAndProtectedChats.value.push(chat)
    }
  }
})

chatSocket.on('editChatInfo', (chat: Chat) => {
  let foundChat = myChats.value.find((other) => other.chat_id === chat.chat_id)
  if (foundChat === undefined) {
    foundChat = publicAndProtectedChats.value.find((other) => other.chat_id === chat.chat_id)
    if (foundChat === undefined) {
      return
    }
  }

  foundChat.name = chat.name
  foundChat.visibility = chat.visibility
})

chatSocket.on('exception', (data) => {
  alertPopup.value.showWarning(data.message)
})

function getDMs() {
  return myChats.value.filter((chat) => chat.visibility === Visibility.DM)
}

function getMyChats() {
  return myChats.value.filter((chat) => chat.visibility !== Visibility.DM)
}

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
