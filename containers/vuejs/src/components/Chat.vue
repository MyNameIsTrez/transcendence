<template>
  <div>
    <button v-if="currentChat" @click="leaveChat">← Back</button>
    <div v-if="!currentChat">
      <!-- TODO: Turn these three identical chat list blocks into a shared component -->
      Public chats 🌎
      <div class="scrollable-container-half">
        <div v-for="(chat, index) in publicChats" :key="index" class="line" @click="joinChat(chat)">
          {{ chat.name }}
        </div>
      </div>
      Protected chats 🔒
      <div class="scrollable-container-half">
        <div
          v-for="(chat, index) in protectedChats"
          :key="index"
          class="line"
          @click="joinChat(chat)"
        >
          {{ chat.name }}
        </div>
      </div>
      My chats 👤
      <div class="scrollable-container-half">
        <div v-for="(chat, index) in myChats" :key="index" class="line" @click="joinChat(chat)">
          {{ chat.name }}
        </div>
      </div>

      <div v-if="locked">
        Password of {{ currentChat?.name }}:
        <input v-model="password" placeholder="Password..." @keyup.enter="validatePassword" />
      </div>
      <input v-model="inputChatName" placeholder="Chat name..." @keyup.enter="createChat" />
      <button :class="'btn ' + getBtnColor(visibility)" @click="chatVisibility">
        {{ visibility }}
      </button>
      <input
        v-if="visibility === Visibility.PROTECTED"
        v-model="passwordChat"
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
            v-model="newPassword"
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
          v-model="passwordChat"
          placeholder="Password..."
          @keyup.enter="changeVisibility"
        />
        <button @click="changeVisibility">Change visibility</button>
      </div>
      <div v-if="iAmAdmin">
        <button @click="changeOptionsButton">{{ optionsButtonText }}</button>
        <div v-if="optionsButton">
          <input v-model="otherUser" placeholder="42 student..." />
          <button @click="addUser">Add</button>
          <button @click="kickUser">/Kick</button>
          <button @click="banUser">/Ban</button>
          <button @click="addAdmin">/Make admin</button>
          <button @click="muteUser">/Mute</button>
          <input v-model="daysToMute" placeholder="days to mute..." />
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
        v-model="typedMessage"
        placeholder="Type message..."
        @keyup.enter="sendMessage"
      />
      <button v-if="!iAmMute" @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { get, post } from '../httpRequests'
import { nextTick } from 'vue'
import { Socket } from 'socket.io-client'

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

  constructor(chat_id: string, name: string) {
    this.chat_id = chat_id
    this.name = name
  }
}

const chatRef = ref()
const inputChatName = ref('')
const publicChats = ref<Chat[]>([])
const protectedChats = ref<Chat[]>([])
const myChats = ref<Chat[]>()
const currentChat = ref<Chat>()
const chatHistory = ref<Message[]>([])
const daysToMute = ref(0)
const iAmAdmin = ref(false)
const iAmMute = ref(false)
const iAmOwner = ref(false)
const iAmUser = ref(false)
const isDirect = ref(false)
const isProtected = ref(false)
const locked = ref(false)
const myIntraId = ref('')
const myUsername = ref('')
const newPassword = ref('')
const otherUser = ref('')
const optionsButtonText = ref('~ open options ~')
const optionsButton = ref(false)
const password = ref('')
const passwordChat = ref('')
const typedMessage = ref('')
const visibility = ref(Visibility.PUBLIC)

async function leave() {
  if (currentChat.value) {
    await get('api/chat/leave/' + currentChat.value.chat_id)
    getChats()
    currentChat.value = undefined
  }
}

async function changePassword() {
  if (currentChat.value) {
    await post('api/chat/changePassword', {
      chat_id: currentChat.value.chat_id,
      password: newPassword.value,
      intra_id: 'foo'
    })
    newPassword.value = ''
  }
}

async function changeVisibility() {
  if (currentChat.value) {
    if (passwordChat.value === '' && visibility.value === Visibility.PROTECTED) return
    if (passwordChat.value === '') passwordChat.value = 'foo'
    await post('api/chat/changeVisibility', {
      chat_id: currentChat.value.chat_id,
      visibility: visibility.value,
      password: passwordChat.value
    })
    passwordChat.value = ''
    getChats()
  }
}

function changeOptionsButton() {
  optionsButton.value = !optionsButton.value
  if (optionsButton.value === false) optionsButtonText.value = '~ open options ~'
  else optionsButtonText.value = '~ close options ~'
}

function leaveChat() {
  if (currentChat.value) {
    chatSocket.emit('leaveChat', { chatId: currentChat.value.chat_id })
    currentChat.value = undefined
  }
}

async function muteUser() {
  if (currentChat.value) {
    console.log({ daysToMute: daysToMute.value, t: typeof daysToMute.value }) // TODO: REMOVE
    await post('api/chat/mute', {
      chat_id: currentChat.value.chat_id,
      username: otherUser.value,
      days: parseInt(daysToMute.value)
    })
    daysToMute.value = 0
  }
}

async function getMyIntraId() {
  myIntraId.value = await get('api/user/intraId')
}

async function getMyUsername() {
  myUsername.value = await get('api/user/username')
}

async function kickUser() {
  if (currentChat.value) {
    await get('api/chat/kick/' + currentChat.value.chat_id + '/' + otherUser.value)
    otherUser.value = ''
    getChat()
  }
}

async function banUser() {
  if (currentChat.value) {
    await get('api/chat/ban/' + currentChat.value.chat_id + '/' + otherUser.value)
    otherUser.value = ''
  }
}

async function addAdmin() {
  if (currentChat.value) {
    if (iAmAdmin.value === false) {
      console.log('No admin authorization')
      return
    }
    console.log('You are admin')
    const addAdmin = await post('api/chat/addAdminToChat', {
      chat_id: currentChat.value.chat_id,
      username: otherUser.value
    })
    otherUser.value = ''
  }
}

async function addUser() {
  if (currentChat.value) {
    const add_user = await post('api/chat/addUserToChat', {
      chat_id: currentChat.value.chat_id,
      username: otherUser.value
    })
    otherUser.value = ''
    getChat()
  }
}

async function createChat() {
  // if (passwordChat.value === '') passwordChat.value = 'foo'
  const chat = await post('api/chat/create', {
    name: inputChatName.value,
    visibility: visibility.value,
    password: passwordChat.value
  })
  passwordChat.value = ''
  inputChatName.value = ''
  getChats()
}

async function getInfo() {
  if (currentChat.value) {
    getChats()
    const info = await get('api/chat/info/' + currentChat.value.chat_id)
    console.log('info', info)
    iAmUser.value = info.isUser
    iAmAdmin.value = info.isAdmin
    iAmMute.value = info.isMute
    iAmOwner.value = info.isOwner
    isProtected.value = info.isProtected
    isDirect.value = info.isDirect
  }
}

async function validatePassword() {
  if (currentChat.value) {
    console.log('password', password.value)
    const result = await get(
      'api/chat/validatePassword/' +
        currentChat.value.chat_id +
        '/' +
        password.value +
        '/' +
        myIntraId.value
    )
    console.log('result in validatePassword', result)
    if (result) {
      getChat()
      console.log('password is correct')
    } else {
      console.error('password is incorrect')
    }
    password.value = ''
  }
}

async function joinChat(chat: Chat) {
  // TODO: Don't emit joinChat() if the chat is protected
  chatSocket.emit('joinChat', { chatId: chat.chat_id }, () => {
    currentChat.value = chat
    getChat()
  })
}

async function getChat() {
  if (currentChat.value) {
    locked.value = false

    const blockedUsers = (await get('api/user/blocked')).map((user: any) => user.intra_id)
    const blocked = new Set<number>(blockedUsers)

    await post('api/chat/addUserToChat', {
      chat_id: currentChat.value.chat_id,
      username: myUsername.value
    })

    chatHistory.value = (await get('api/chat/history/' + currentChat.value.chat_id)).filter(
      (message: Message) => !blocked.has(message.sender)
    )

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
  publicChats.value = await get('api/chat/publicChats')
  protectedChats.value = await get('api/chat/protectedChats')
  myChats.value = await get('api/user/myChats')
}

chatSocket.on('newMessage', async (message: Message) => {
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
      body: typedMessage.value
    }

    typedMessage.value = ''

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
