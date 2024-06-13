<template>
  <div>
    <button v-if="currentChat" @click="leaveChat">← Back</button>

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

      <button :class="'btn btn-info'" @click="chatCreationModal.showModal()">Create chat</button>

      <dialog ref="chatCreationModal" class="modal">
        <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
          <div class="modal-box w-auto justify-self-center">
            <!-- Adds a little close button in the top-right corner -->
            <form method="dialog">
              <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
            </form>

            <h3 class="font-bold text-lg">Create new chat</h3>

            <div class="flex pt-4 flex-col space-y-5">
              <button :class="'btn ' + getBtnColor(visibility)" @click="chatVisibility">
                {{ visibility }}

                <span class="material-symbols-outlined"> {{ getVisibilityIcon(visibility) }} </span>
              </button>

              <input
                class="p-2"
                v-model="inputChatName"
                placeholder="Chat name..."
                @keyup.enter="createChat"
              />

              <input
                v-if="visibility === Visibility.PROTECTED"
                class="p-2"
                v-model="password"
                type="password"
                placeholder="Password..."
                @keyup.enter="createChat"
              />

              <button class="btn btn-info" @click="createChat">Create</button>

              <AlertPopup ref="createNewChatAlertPopup" :alertType="AlertType.ALERT_WARNING">{{
                alertMessage
              }}</AlertPopup>
            </div>
          </div>
        </span>

        <!-- Allows clicking outside of the modal to close it -->
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>

    <div v-if="currentChat">
      <div v-if="iAmUser">
        <button class="btn btn-secondary" @click="leave">Leave chat</button>
      </div>

      <div v-if="iAmOwner">
        <div v-if="isProtected">
          <!-- <input
            v-model="password"
            type="password"
            placeholder="New password..."
            @keyup.enter="changePassword"
          /> -->
          <button @click="changePassword">Change password</button>
        </div>
        <button :class="'btn ' + getBtnColor(visibility)" @click="chatVisibility">
          {{ visibility }}
        </button>
        <!-- <button @click="changeVisibility">Change visibility</button> -->
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
            {{
              message.sender_name +
              ' at ' +
              message.date.toLocaleTimeString([], {timeStyle: 'short'}) +
              ': ' +
              message.body +
              '\n'
            }}
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

    <dialog ref="passwordInputPopup" class="modal">
      <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
        <div class="modal-box w-auto justify-self-center">
          <!-- Adds a little close button in the top-right corner -->
          <form method="dialog">
            <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
          </form>

          <h3 class="font-bold text-lg">Enter password</h3>

          <div class="flex pt-4 flex-col space-y-5 justify-self-center">
            <input
              v-model="password"
              type="password"
              placeholder="Password..."
              class="input input-bordered w-full max-w-xs"
              @keyup.enter="enterProtectedChat(selectedChat, password)"
            />
            <button class="btn btn-info" @click="enterProtectedChat(selectedChat, password)">
              Enter
            </button>
          </div>
        </div>
      </span>

      <!-- Allows clicking outside of the modal to close it -->
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

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
  date: Date

  constructor(sender_name: string, sender: number, body: string, date: Date) {
    this.sender_name = sender_name
    this.sender = sender
    this.body = body
    this.date = date
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
const publicAndProtectedChats = ref<Chat[]>([])
const myChats = ref<Chat[]>([])
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
const createNewChatAlertPopup = ref()

const passwordInputPopup = ref()
const chatCreationModal = ref()

async function leave() {
  if (currentChat.value) {
    await get('api/chats/leave/' + currentChat.value.chat_id).catch((err) => {
      alertMessage.value = getErrorMessage(err.response.data.message)
      alertPopup.value.show()
    })
    // getChats()
    currentChat.value = null
  }
}

async function changePassword() {
  if (currentChat.value) {
    await post('api/chats/changePassword', {
      chat_id: currentChat.value.chat_id,
      password: password.value,
      intra_id: 'foo'
    }).catch((err) => {
      alertMessage.value = getErrorMessage(err.response.data.message)
      alertPopup.value.show()
    })
    password.value = ''
  }
}

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

function leaveChat() {
  if (currentChat.value) {
    chatSocket.emit('leaveChat', { chatId: currentChat.value.chat_id })
    currentChat.value = null
  }
}

async function getMyIntraId() {
  myIntraId.value = await get('api/user/intraId').catch((err) => {
    alertMessage.value = getErrorMessage(err.response.data.message)
    alertPopup.value.show()
  })
}

async function getMyUsername() {
  myUsername.value = await get('api/user/username').catch((err) => {
    alertMessage.value = getErrorMessage(err.response.data.message)
    alertPopup.value.show()
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

async function createChat() {
  chatSocket.emit(
    'create',
    {
      name: inputChatName.value,
      visibility: visibility.value,
      password: password.value
    },
    () => {
      chatCreationModal.value.close()
      password.value = ''
      inputChatName.value = ''
    }
  )
}

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
    getChat()
  })
}

function clickedPublicChat(chat: Chat) {
  chatSocket.emit('joinChat', { chatId: chat.chat_id }, () => {
    openChat(chat)
  })
}

function clickedProtectedChat(chat: Chat) {
  selectedChat.value = chat

  passwordInputPopup.value.showModal()
}

function enterProtectedChat(chat: Chat | null, password_: string) {
  if (!chat) {
    console.error("chat wasn't supposed to be null")
    return
  }

  chatSocket.emit('joinChat', { chatId: chat.chat_id, password: password_ }, () => {
    passwordInputPopup.value.close()

    selectedChat.value = null

    openChat(chat)
  })

  password.value = ''
}

async function getChat() {
  if (currentChat.value) {
    const blockedUsers = await get('api/user/blocked')
      .then((blockedUsers) => blockedUsers.map((user: any) => user.intra_id))
      .catch((err) => {
        alertMessage.value = getErrorMessage(err.response.data.message)
        alertPopup.value.show()
      })
    const blocked = new Set<number>(blockedUsers)

    chatHistory.value = await get('api/chats/history/' + currentChat.value.chat_id)
      .then((messages) =>
        messages
          .filter((message: Message) => !blocked.has(message.sender))
          .map((message: Message) => {
            return { ...message, date: new Date(message.date) } // Serialize date
          })
      )
      .catch((err) => {
        alertMessage.value = getErrorMessage(err.response.data.message)
        alertPopup.value.show()
      })

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

async function getChats() {
  myChats.value = await get('api/user/myChats').catch((err) => {
    alertMessage.value = getErrorMessage(err.response.data.message)
    alertPopup.value.show()
  })

  publicAndProtectedChats.value = await get('api/chats').catch((err) => {
    console.error('err', err)
    alertMessage.value = getErrorMessage(err.response.data.message)
    alertPopup.value.show()
  })
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

chatSocket.on('addMyChat', async (chat: Chat) => {
  myChats.value.push(chat)
})
chatSocket.on('addChat', async (chat: Chat) => {
  if (chat.visibility !== Visibility.PRIVATE) {
    publicAndProtectedChats.value.push(chat)
  }
})
chatSocket.on('removeChat', async (chat: Chat) => {})

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
    ? 'btn-primary'
    : visibility === Visibility.PROTECTED
      ? 'btn-warning'
      : 'btn-error'
}

function getVisibilityIcon(visibility: Visibility) {
  return visibility === Visibility.PUBLIC
    ? 'public'
    : visibility === Visibility.PROTECTED
      ? 'lock'
      : 'disabled_visible'
}

function getErrorMessage(msg: string | string[]) {
  if (typeof msg === 'string') {
    return msg
  }
  return msg.join('\n')
}

chatSocket.on('exception', (data) => {
  alertMessage.value = getErrorMessage(data.message)
  alertPopup.value.show()
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
