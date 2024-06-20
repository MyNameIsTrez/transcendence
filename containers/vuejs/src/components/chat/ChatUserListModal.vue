<template>
  <dialog ref="modal" class="modal">
    <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
      <div class="modal-box w-auto justify-self-center">
        <!-- Adds a little close button in the top-right corner -->
        <form method="dialog">
          <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
        </form>

        <h3 class="font-bold text-lg">User list</h3>
      </div>
    </span>

    <!-- Allows clicking outside of the modal to close it -->
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { Socket } from 'socket.io-client'
import { inject, ref, type PropType, type Ref } from 'vue'
import { get, post } from '@/httpRequests'
import Chat from './ChatClass'
import MyInfo from './MyInfoClass'
import AlertPopup from '../AlertPopup.vue'
import getErrorMessage from '../getErrorMessage'

type UserInfo = {
  intra_id: number
  username: string
  owner: boolean
  admin: boolean
}

const chatSocket: Socket = inject('chatSocket')!
const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!

const props = defineProps({
  currentChat: Object as PropType<Chat>
})

const myInfo = ref<MyInfo>(await get(`api/chats/${props.currentChat?.chat_id}/me`))
const users = ref<UserInfo[]>(await get(`api/chats/${props.currentChat?.chat_id}/users`))
console.log('users', users.value)

const modal = ref()

const emit = defineEmits(['onCloseUserListModal'])

defineExpose({
  show() {
    modal.value.showModal()
  },
  hide() {
    modal.value.close()
  }
})
</script>
