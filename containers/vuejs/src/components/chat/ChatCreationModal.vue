<template>
  <dialog ref="modal" class="modal">
    <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
      <div class="modal-box w-auto justify-self-center">
        <!-- Adds a little close button in the top-right corner -->
        <form method="dialog">
          <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
        </form>

        <h3 class="font-bold text-lg">Create new chat</h3>

        <div class="flex pt-4 flex-col space-y-5">
          <button :class="'btn ' + getBtnColor(visibility)" @click="cycleChatVisibility">
            {{ visibility }}

            <span class="material-symbols-outlined"> {{ getVisibilityIcon(visibility) }} </span>
          </button>

          <input
            class="p-2"
            v-model="chatName"
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
        </div>
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
import Visibility from './VisibilityEnum'
import { inject, ref } from 'vue'
import Chat from './ChatClass'

const chatSocket: Socket = inject('chatSocket')!

const modal = ref()
const visibility = ref(Visibility.PUBLIC)
const chatName = ref('')
const password = ref('')

const emit = defineEmits(['onCreatedChat'])

function getBtnColor(visibility: Visibility) {
  return visibility === Visibility.PUBLIC
    ? 'btn-primary'
    : visibility === Visibility.PROTECTED
      ? 'btn-warning'
      : 'btn-error'
}

function cycleChatVisibility() {
  if (visibility.value === Visibility.PUBLIC) {
    visibility.value = Visibility.PROTECTED
  } else if (visibility.value === Visibility.PROTECTED) {
    visibility.value = Visibility.PRIVATE
  } else {
    visibility.value = Visibility.PUBLIC
  }
}

function getVisibilityIcon(visibility: Visibility) {
  return visibility === Visibility.PUBLIC
    ? 'public'
    : visibility === Visibility.PROTECTED
      ? 'lock'
      : 'disabled_visible'
}

async function createChat() {
  chatSocket.emit(
    'create',
    {
      name: chatName.value,
      visibility: visibility.value,
      password: password.value
    },
    (chat: Chat) => {
      emit('onCreatedChat', chat)

      password.value = ''
      chatName.value = ''
    }
  )
}

defineExpose({
  show() {
    modal.value.showModal()
  },
  hide() {
    modal.value.close()
  }
})
</script>
