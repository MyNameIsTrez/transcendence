<template>
  <dialog ref="modal" class="modal">
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
            @keyup.enter="onEnter(password)"
          />
          <button class="btn btn-info" @click="onEnter(password)">Enter</button>
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
import { ref } from 'vue'

const modal = ref()
const password = ref('')

const emit = defineEmits(['onEnter'])

async function onEnter(password_: string) {
  emit('onEnter', password_)
  password.value = ''
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
