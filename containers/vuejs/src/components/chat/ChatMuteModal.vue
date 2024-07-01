<template>
  <dialog ref="modal" class="modal">
    <span class="grid" style="grid-column-start: 1; grid-row-start: 1">
      <div class="modal-box w-auto justify-self-center">
        <!-- Adds a little close button in the top-right corner -->
        <form method="dialog">
          <button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Mute settings</h3>

        <div>
          <div
            v-for="(duration, index) in durations"
            :key="index"
            class="relative flex flex-col text-white shadow-md rounded-xl bg-clip-border"
          >
            <nav
              class="flex min-w-[240px] flex-col gap-1 p-2 font-sans text-base font-normal text-blue-gray-700"
            >
              <div
                role="button"
                class="flex items-center w-full p-0 leading-tight transition-all rounded-lg outline-none text-start hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
              >
                <label
                  :htmlFor="index.toString()"
                  class="flex items-center w-full px-3 py-2 cursor-pointer"
                >
                  <div class="grid mr-3 place-items-center">
                    <div class="inline-flex items-center">
                      <label
                        class="relative flex items-center p-0 rounded-full cursor-pointer"
                        :htmlFor="index.toString()"
                      >
                        <input
                          name="vertical-list"
                          :id="index.toString()"
                          v-model="radioRef"
                          :value="duration.length"
                          type="radio"
                          class="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-gray-900 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-gray-900 checked:before:bg-gray-900 hover:before:opacity-0"
                        />
                        <span
                          class="absolute text-gray-300 transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-3.5 w-3.5"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                          >
                            <circle data-name="ellipse" cx="8" cy="8" r="8"></circle>
                          </svg>
                        </span>
                      </label>
                    </div>
                  </div>
                  <p
                    class="block font-sans text-base antialiased font-medium leading-relaxed text-blue-gray-400"
                  >
                    {{ duration.description }}
                  </p>
                </label>
              </div>
            </nav>
          </div>

          <button class="btn btn-info" @click="mute">Confirm</button>
        </div>
      </div>
    </span>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineExpose({
  show() {
    modal.value.showModal()
  },
  hide() {
    modal.value.close()
  }
})

const durations = [
  { length: 5 * 1000, description: '5 seconds' },
  { length: 60 * 1000, description: '1 minute' },
  { length: 5 * 60 * 1000, description: '5 minutes' },
  { length: 15 * 60 * 1000, description: '15 minutes' },
  { length: 60 * 60 * 1000, description: '1 hour' },
  { length: 24 * 60 * 60 * 1000, description: '1 day' }
]

const modal = ref()
const radioRef = ref(durations[0].length)

function mute() {
  const now = new Date()
  emit('onMute', new Date(now.getTime() + radioRef.value))
  emit('onCloseMuteModal')
}

const emit = defineEmits(['onMute', 'onCloseMuteModal'])
</script>
