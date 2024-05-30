<template>
  <div>
    <button @click="changeChatButton">{{ chatButtonText }}</button><br /><br />
    <div v-if="chatButton">
      CHANNELS <br /><br />
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
      <br /><br />
      DIRECT MESSAGES <br /><br />
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
        v-if="protectedChat"
        v-model="passwordChat"
        placeholder="Password..."
        @keyup.enter="createChat"
      /><br />
      <button @click="createChat">Create</button>
    </div>

    <div v-if="!chatButton && openChat">
      <div v-if="iAmAdmin">
        <br />
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
            v-if="protectedChat"
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

      <div v-if="direct">
        <button @click="handleBlock">{{ blockStatus }}</button><br /><br />
      </div>
      <div v-if="openOtherProfile">
        <router-link :to="`/user/${otherIntraId}`">View profile of {{ otherProfile }} </router-link>
      </div>
      <br/>

      CURRENT CHAT: {{ currentChat }} <br /><br />
      <div ref="chat" class="scrollable-container">
        <div
          v-for="(line, index) in chatHistory"
          :key="index"
          class="line"
          @click="openProfileButton(index)"
        >
          {{ line }}
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

// VARIABLES
const blockStatus = ref('Block')
const chat = ref()
const chatName = ref('')
const directMessagesOnIndex = ref<string[]>([])
const directMessageIdsOnIndex = ref<string[]>([])
const channelsOnIndex = ref<string[]>([])
const channelIdsOnIndex = ref<string[]>([])
const chatHistory = ref<string[]>([])
const chatHistorySender = ref<string[]>([])
const chatButtonText = ref('== OPEN CHATS ==')
const chatButton = ref(false)
const currentChat = ref('')
const currentChatId = ref('')
const daysToMute = ref(0)
const direct = ref(false)
const iAmAdmin = ref(false)
const iAmBanned = ref(false)
const iAmBlocked = ref(false)
const iAmMute = ref(false)
const iAmOwner = ref(false)
const isProtected = ref(false)
const locked = ref(false)
const myIntraId = ref('')
const myUsername = ref('')
const chats = ref('')
const newPassword = ref('')
const otherIntraId = ref('')
const otherUser = ref('')
const optionsButtonText = ref('~ open options ~')
const optionsButton = ref(false)
const openChat = ref(false)
const otherProfile = ref('')
const openOtherProfile = ref(false)
const password = ref('')
const privateButtonClass = ref('btn btn-warning text-white mx-3 mb-3')
const protectedChat = ref(false)
const passwordChat = ref('')
const typedMessage = ref('')
const visibility = ref('PUBLIC')
const visibilityNum = ref(1)
const visitProfile = ref(false)

async function openProfile() {
  visitProfile.value = true
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

function openProfileButton(index: number) {
  otherProfile.value = chatHistorySender.value[index]
  if (otherProfile.value !== myUsername.value) {
    openOtherProfile.value = true
  } else {
    openOtherProfile.value = false
  }
}

function changeOptionsButton() {
  optionsButton.value = !optionsButton.value
  if (optionsButton.value === false) optionsButtonText.value = '~ open options ~'
  else optionsButtonText.value = '~ close options ~'
}

function changeChatButton() {
  chatButton.value = !chatButton.value
  if (chatButton.value === false) {
    chatButtonText.value = '== OPEN CHATS =='
    openChat.value = true
  } else {
    chatButtonText.value = '== CLOSE CHATS =='
    openChat.value = false
  }
}

async function muteUser() {
  const mute = await post('api/chat/mute', {
    chat_id: currentChatId.value,
    username: otherUser.value,
    days: parseInt(daysToMute.value)
  })
  daysToMute.value = 0
}

async function getBlockStatus() {
  return await get('api/user/blockStatus/' + myIntraId.value + '/' + otherIntraId.value)
}

async function getMyIntraId() {
  myIntraId.value = await get('api/user/intraId')
}

async function getMyUsername() {
  myUsername.value = await get('api/user/username')
}

async function getOtherIntraId() {
  return await get('api/chat/getOtherIntraId/' + currentChatId.value + '/' + myIntraId.value)
}

async function handleBlock() {
  if (blockStatus.value === 'Block') {
    blockUser()
    blockStatus.value = 'Unblock'
  } else {
    unblockUser()
    blockStatus.value = 'Block'
  }
}

async function blockUser() {
  await get('api/user/block/' + myIntraId.value + '/' + otherIntraId.value)
}

async function unblockUser() {
  await get('api/user/unblock/' + myIntraId.value + '/' + otherIntraId.value)
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
  const info = await get('api/chat/info/' + currentChatId.value + '/' + myIntraId.value)
  console.log('info', info)
  iAmAdmin.value = info.isAdmin
  direct.value = info.isDirect
  iAmMute.value = info.isMute
  iAmOwner.value = info.isOwner
  isProtected.value = info.isProtected
  iAmBanned.value = info.isBanned
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
  let i: number = 0

  while (channelIdsOnIndex.value[i]) {
    if (channelsOnIndex.value[i] == chat_str) currentChatId.value = channelIdsOnIndex.value[i]
    i++
  }
  i = 0
  while (directMessageIdsOnIndex.value[i]) {
    if (directMessagesOnIndex.value[i] == chat_str)
      currentChatId.value = directMessageIdsOnIndex.value[i]
    i++
  }
  if (await get('api/chat/isLocked/' + currentChatId.value + '/' + myIntraId.value)) {
    locked.value = true
  } else {
    getChat(chat_str)
  }
}

async function getChat(chat_str: string) {
  let i: number = 0
  let history: string[] = []
  locked.value = false
  await getInfo()
  if (iAmBanned.value) return
  if (direct.value) {
    otherIntraId.value = await getOtherIntraId()
    iAmBlocked.value = await getBlockStatus()
  } else {
    otherIntraId.value = ''
    iAmBlocked.value = false
  }

  if (openChat.value == false) changeChatButton()

  chatHistory.value = []
  history = await get('api/chat/history/' + currentChatId.value)

  await post('api/chat/addUserToChat', {
    chat_id: currentChatId.value,
    username: myUsername.value
  })

  i = 0
  while (history[i]) {
    chatHistory.value[i] = history[i].sender_name + ': ' + history[i].body + '\n'
    chatHistorySender.value[i] = history[i].sender_name
    i++
  }

  await nextTick()
  getChats()
  getChannels()
  chat.value.scrollTop = chat.value.scrollHeight
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

chatSocket.on('confirm', async (result) => {
  typedMessage.value = ''
  await getChat(currentChat.value)
})

function sendMessage() {
  if ((direct.value && iAmBlocked.value) || iAmMute.value) {
    typedMessage.value = ''
    return
  }
  const message = {
    chatId: currentChatId.value,
    body: typedMessage.value
  }
  chatSocket.emit('sendMessage', message)
}

function chatVisibility() {
  protectedChat.value = false
  visibilityNum.value += 1
  if (visibilityNum.value > 3) visibilityNum.value = 1
  if (visibilityNum.value === 1) {
    privateButtonClass.value = 'btn btn-warning mb-3'
    visibility.value = 'PUBLIC'
  } else if (visibilityNum.value === 2) {
    privateButtonClass.value = 'btn btn-primary mx-3 mb-3'
    visibility.value = 'PRIVATE'
  } else {
    privateButtonClass.value = 'btn btn-info mx-6 mb-3'
    visibility.value = 'PROTECTED'
    protectedChat.value = true
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
  height: 900px;
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
