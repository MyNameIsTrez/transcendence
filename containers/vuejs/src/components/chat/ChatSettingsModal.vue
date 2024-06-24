<template>
  <dialog ref="modal" class="modal">
    <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
      <div class="modal-box w-auto justify-self-center">
        <!-- Adds a little close button in the top-right corner -->
        <form method="dialog">
          <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
        </form>

        <h3 class="font-bold text-lg">Settings</h3>

        <div class="flex flex-col space-y-5">
          <div v-if="myInfo.admin" class="flex pt-4 flex-col space-y-5">
            <button :class="'btn ' + getBtnColor(visibility)" @click="cycleChatVisibility">
              {{ visibility }}

              <span class="material-symbols-outlined"> {{ getVisibilityIcon(visibility) }} </span>
            </button>

            <input
              class="p-2"
              v-model="chatName"
              placeholder="Chat name..."
              @keyup.enter="saveChatSettings"
            />

            <input
              v-if="visibility === Visibility.PROTECTED"
              class="p-2"
              v-model="password"
              type="password"
              placeholder="Password..."
              @keyup.enter="saveChatSettings"
            />

            <button class="btn btn-info" @click="saveChatSettings">Save</button>
          </div>
          <button class="btn btn-error" @click="leaveChat">Leave chat</button>
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
import Visibility from './VisibilityEnum'
import { inject, ref, type PropType, type Ref } from 'vue'
import { get, post } from '@/httpRequests'
import Chat from './ChatClass'
import MyInfo from './MyInfoClass'
import AlertPopup from '../AlertPopup.vue'

const alertPopup: Ref<typeof AlertPopup> = inject('alertPopup')!

const props = defineProps({
  currentChat: Object as PropType<Chat>
})

defineExpose({
  show() {
    modal.value.showModal()
  },
  hide() {
    modal.value.close()
  }
})

const myInfo = ref<MyInfo>(await get(`api/chats/${props.currentChat?.chat_id}/me`))

const modal = ref()
const visibility = ref(props.currentChat?.visibility)
const chatName = ref(props.currentChat?.name)
const password = ref('')

const emit = defineEmits(['onCloseSettingsModal', 'onCloseChat'])

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

function leaveChat() {
  post(`api/chats/${props.currentChat?.chat_id}/leave`, {})
    .then((res) => {
      emit('onCloseChat')
    })
    .catch((err) => {
      alertPopup.value.showWarning(err.response.data.message)
    })
}

async function saveChatSettings() {
  post(`api/chats/${props.currentChat?.chat_id}/edit`, {
    name: chatName.value,
    password: visibility.value === Visibility.PROTECTED ? password.value : undefined,
    visibility: visibility.value
  })
    .then(() => {
      emit('onCloseSettingsModal')
    })
    .catch((err) => {
      alertPopup.value.showWarning(err.response.data.message)
    })
}
</script>
