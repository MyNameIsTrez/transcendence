<template>
  <div>
    <br />
    <button v-if="chatIsOpen" @click="changeChatButton">← Back</button><br /><br />
    <button class="btn btn-success" @click="getChannels(); getChats();">refresh</button><br /><br />
    <div v-if="!chatIsOpen">
      PUBLIC AND PROTECTED CHATS
      <br />
      <br />
      <div class="scrollable-container-half">
        <div
          v-for="(chat, index) in channelsOnIndex"
          :key="index"
          class="line"
          @click="validateLock(chat)"
        >
          {{ chat }}
        </div>
      </div>
      <br />
      MY CHATS
      <br />
      <br />
      <div class="scrollable-container-half">
        <div
          v-for="(chat, index) in directMessagesOnIndex"
          :key="index"
          class="line"
          @click="validateLock(chat)"
        >
          {{ chat }}
        </div>
      </div>

      <div v-if="locked">
        <br /><br />
        Password of {{ currentChat }}:
        <input
          v-model="password"
          placeholder="Password..."
          @keyup.enter="validatePassword"
        /><br /><br />
      </div>
      <br />
      <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
      <button :class="privateButtonClass" @click="chatVisibility">{{ visibility }}</button>
      <input
        v-if="visibility === 'PROTECTED'"
        v-model="passwordChat"
        placeholder="Password..."
        @keyup.enter="createChat"
      /><br />
      <button @click="createChat">Create</button>
    </div>
    <div v-if="chatIsOpen">
      <div v-if="iAmUser">
        <button class="btn btn-secondary" @click="leave"> Leave chat </button><br /><br />
      </div>

      <div v-if="iAmAdmin">
        <button @click="changeOptionsButton">{{ optionsButtonText }}</button><br /><br />
        <div v-if="optionsButton">
          <div v-if="isProtected">
            <input
              v-model="newPassword"
              placeholder="New password..."
              @keyup.enter="changePassword"
            /><br />
            <button @click="changePassword">Change password</button><br /><br />
          </div>
          <button :class="privateButtonClass" @click="chatVisibility">{{ visibility }}</button>
          <input
            v-if="visibility === 'PROTECTED'"
            v-model="passwordChat"
            placeholder="Password..."
            @keyup.enter="changeVisibility"
          /><br />
          <button @click="changeVisibility">Change visibility</button><br /><br />

          <input v-model="otherUser" placeholder="42 student..." /><br />
          <button @click="addUser">Add</button>
          <button @click="kickUser">/Kick</button>
          <button @click="banUser">/Ban</button>
          <button @click="addAdmin">/Make admin</button>
          <button @click="muteUser">/Mute</button>
          <input v-model="daysToMute" placeholder="days to mute..." /><br /><br />
        </div>
      </div>

      <br />

      IN CHAT '{{ currentChat }}' 
      <div v-if="isDirect">(DM)</div> <br /><br />
      <div ref="chat" class="scrollable-container">
        <div v-for="(entry, index) in chatHistory" :key="index" class="line">
          <router-link :to="`/user/${entry.sender}`">
            {{ entry.sender_name + ': ' + entry.body + '\n' }}
          </router-link>
        </div>
      </div>
      <br />
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
import { ref } from 'vue'
import { get, post } from '../httpRequests'
import { nextTick } from 'vue'

const props = defineProps(['chatSocket'])
const chatSocket = props.chatSocket

class Entry {
  sender_name: string
  sender: number
  body: string

  constructor(sender_name: string, sender: number, body: string) {
    this.sender_name = sender_name
    this.sender = sender
    this.body = body
  }
}

// VARIABLES
const blocked = ref(new Set<number>([]))
const chat = ref()
const chatName = ref('')
const directMessagesOnIndex = ref<string[]>([])
const directMessageIdsOnIndex = ref<string[]>([])
const channelsOnIndex = ref<string[]>([])
const channelIdsOnIndex = ref<string[]>([])
const chatHistory = ref<Entry[]>([])
const chatIsOpen = ref(false)
const currentChat = ref('')
const currentChatId = ref('')
const daysToMute = ref(0)
const iAmAdmin = ref(false)
const iAmBanned = ref(false)
const iAmMute = ref(false)
const iAmOwner = ref(false)
const iAmUser = ref(false)
const isDirect = ref(false)
const isProtected = ref(false)
const locked = ref(false)
const myIntraId = ref('')
const myUsername = ref('')
const chats = ref()
const newPassword = ref('')
const otherUser = ref('')
const optionsButtonText = ref('~ open options ~')
const optionsButton = ref(false)
const password = ref('')
const privateButtonClass = ref('btn btn-warning')
const passwordChat = ref('')
const typedMessage = ref('')
const visibility = ref('PUBLIC')

async function leave() {
  await get('api/chat/leave/' + currentChatId.value);
  getChats()
  getChannels()
  chatIsOpen.value = false
}

async function changePassword() {
  await post('api/chat/changePassword', {
    chat_id: currentChatId.value,
    password: newPassword.value,
    intra_id: 'foo'
  })
  newPassword.value = ''
}

async function changeVisibility() {
  if (passwordChat.value === '' && visibility.value === 'PROTECTED') return
  console.log('visibility', visibility.value)
  if (passwordChat.value === '') passwordChat.value = 'foo'
  await post('api/chat/changeVisibility', {
    chat_id: currentChatId.value,
    visibility: visibility.value,
    password: passwordChat.value
  })
  passwordChat.value = ''
  getChats()
  getChannels()
}

function changeOptionsButton() {
  optionsButton.value = !optionsButton.value
  if (optionsButton.value === false) optionsButtonText.value = '~ open options ~'
  else optionsButtonText.value = '~ close options ~'
}

function changeChatButton() {
  chatIsOpen.value = !chatIsOpen.value
}

async function muteUser() {
  console.log({ daysToMute: daysToMute.value, t: typeof daysToMute.value }) // TODO: REMOVE
  await post('api/chat/mute', {
    chat_id: currentChatId.value,
    username: otherUser.value,
    days: parseInt(daysToMute.value)
  })
  daysToMute.value = 0
}

async function getMyIntraId() {
  myIntraId.value = await get('api/user/intraId')
}

async function getMyUsername() {
  myUsername.value = await get('api/user/username')
}

async function kickUser() {
  await get('api/chat/kick/' + currentChatId.value + '/' + otherUser.value)
  otherUser.value = ''
  getChat(currentChat.value)
}

async function banUser() {
  await get('api/chat/ban/' + currentChatId.value + '/' + otherUser.value)
  otherUser.value = ''
}

async function addAdmin() {
  if (iAmAdmin.value === false) {
    console.log('No admin authorization')
    return
  }
  console.log('You are admin')
  const addAdmin = await post('api/chat/addAdminToChat', {
    chat_id: currentChatId.value,
    username: otherUser.value
  })
  otherUser.value = ''
}

async function addUser() {
  const add_user = await post('api/chat/addUserToChat', {
    chat_id: currentChatId.value,
    username: otherUser.value
  })
  otherUser.value = ''
  getChat(currentChat.value)
}

async function createChat() {
  if (passwordChat.value === '') passwordChat.value = 'foo'
  console.log('password', passwordChat.value)
  const chat = await post('api/chat/create', {
    name: chatName.value,
    visibility: visibility.value,
    password: passwordChat.value
  })
  console.log('chat', chat)
  passwordChat.value = ''
  chatName.value = ''
  getChats()
  getChannels()
}

async function getInfo() {
  getChats()
  getChannels()
  const info = await get('api/chat/info/' + currentChatId.value)
  console.log('info', info)
  iAmUser.value = info.isUser
  iAmAdmin.value = info.isAdmin
  iAmMute.value = info.isMute
  iAmOwner.value = info.isOwner
  isProtected.value = info.isProtected
  iAmBanned.value = info.isBanned
  isDirect.value = info.isDirect
}

async function validatePassword() {
  console.log('password', password.value)
  const result = await get(
    'api/chat/validatePassword/' +
      currentChatId.value +
      '/' +
      password.value +
      '/' +
      myIntraId.value
  )
  console.log('result in validatePassword', result)
  if (result) {
    getChat(currentChat.value)
    console.log('password is correct')
  } else console.log('password is incorrect')
  password.value = ''
}

async function validateLock(chat_str: string) {
  currentChat.value = chat_str

  for (let i = 0; channelIdsOnIndex.value[i]; i++) {
    if (channelsOnIndex.value[i] == chat_str) {
      currentChatId.value = channelIdsOnIndex.value[i]
    }
  }

  for (let i = 0; directMessageIdsOnIndex.value[i]; i++) {
    if (directMessagesOnIndex.value[i] == chat_str) {
      currentChatId.value = directMessageIdsOnIndex.value[i]
    }
  }

  await getInfo()
  if (iAmBanned.value) return

  if (await get('api/chat/isLocked/' + currentChatId.value + '/' + myIntraId.value)) {
    locked.value = true
  } else {
    getChat(chat_str)
  }
}

async function getChat(chat_str: string) {
  locked.value = false

  const blockedUsers = (await get('api/user/blocked')).map((user: any) => user.intra_id)
  blocked.value = new Set<number>(blockedUsers)
  
  // TODO: Can this be removed?
  if (chatIsOpen.value == false) changeChatButton()
  
  await post('api/chat/addUserToChat', {
    chat_id: currentChatId.value,
    username: myUsername.value
  })
  
  chatHistory.value = (await get('api/chat/history/' + currentChatId.value)).filter(
    (entry: Entry) => !blocked.value.has(entry.sender)
  )

  await nextTick()
  getChats()
  getChannels()

  if (chat.value) {
    chat.value.scrollTop = chat.value.scrollHeight
  }
}

async function getChats() {
  chats.value = await get('api/user/chats')
  let i: number = 0
  directMessagesOnIndex.value = []
  directMessageIdsOnIndex.value = []

  while (chats.value[i]) {
    if (chats.value[i].visibility == 'PROTECTED') {
      if (await get('api/chat/isLocked/' + chats.value[i].chat_id + '/' + myIntraId.value)) {
        i++
        continue
      }
    }
    directMessagesOnIndex.value.push(chats.value[i].name)
    directMessageIdsOnIndex.value.push(chats.value[i].chat_id)
    i++
  }
}

async function getChannels() {
  const channels = await get('api/chat/channels')
  let i: number = 0
  channelsOnIndex.value = []
  channelIdsOnIndex.value = []

  while (channels[i]) {
    if (channels[i].visibility == 'PUBLIC' || channels[i].visibility == 'PROTECTED') {
      channelsOnIndex.value.push(channels[i].name)
      channelIdsOnIndex.value.push(channels[i].chat_id)
    }
    i++
  }
}

chatSocket.on('confirm', async () => {
  typedMessage.value = ''
  await getChat(currentChat.value)
})

function sendMessage() {
  const message = {
    chatId: currentChatId.value,
    body: typedMessage.value
  }
  chatSocket.emit('sendMessage', message)
}

function chatVisibility() {
  if (visibility.value === 'PUBLIC') {
    privateButtonClass.value = 'btn btn-primary'
    visibility.value = 'PRIVATE'
  } else if (visibility.value === 'PRIVATE') {
    privateButtonClass.value = 'btn btn-info '
    visibility.value = 'PROTECTED'
  } else {
    privateButtonClass.value = 'btn btn-warning'
    visibility.value = 'PUBLIC'
  }
}

getMyUsername()
getMyIntraId()
getChats()
getChannels()
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
  height: 450px;
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
