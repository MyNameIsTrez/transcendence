<template>
  <div>
    <!-- Chats -->
    <div v-for="chat in chats">
      {{ chat }}
    </div>
    <!-- createChat -->
    <input v-model="chatName" placeholder="Chat name..." @keyup.enter="createChat" />
    <button @click="createChat">Create</button>
    <!-- <br /><br /> -->

    <!-- getChat -->
    <!-- <input v-model="typedQuery" placeholder="Chat name..." @keyup.enter="getChat" />
    <button @click="getChat">Search</button> -->
    <!-- <br /><br /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { chatSocket } from '../getSocket'
import { get, post } from '../httpRequests'

const chatName = ref('')
const chats = ref<string[]>([]);


async function createChat() {
  const chat = await post('chat/create', {
    name: chatName.value,
    visibility: 'PUBLIC'
  })
  console.log('chat', chat)
  getMyChats()
}

const myChats = ref('')

// function findDataInString(bigString: string): string[] {
//     const dataRegex = /\{([^}]+)\}/g; // Regular expression to match {data} pattern
//     const dataList: string[] = [];
    
//     let match: RegExpExecArray | null;
//     while ((match = dataRegex.exec(bigString)) !== null) {
//         // match[1] contains the captured data inside {}
//         dataList.push(match[1]);
//     }
    
//     return dataList;
// }

async function getMyChats() {

  myChats.value = await get('user/myChats')
  console.log('myChats', myChats.value)
  console.log(myChats.value[0].name)
  chats.value.push(myChats.value[0].name)
}

getMyChats()
</script>

<style scoped>
.chat-container {
  flex-grow: 1;
  position: relative;
}
</style>
