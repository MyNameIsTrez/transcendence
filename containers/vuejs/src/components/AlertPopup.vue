<template>
  <div role="alert" v-if="visible" :class="`alert ${alertType} w-auto flex`">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="`${svgPath}`" />
    </svg>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import { AlertType } from '../types'

let timeoutId: ReturnType<typeof setTimeout>

const props = defineProps({
  alertType: String as PropType<AlertType>
})

let visible = ref(false)

function show() {
  visible.value = true

  clearTimeout(timeoutId)

  timeoutId = setTimeout(() => {
    visible.value = false
  }, 3500)
}

defineExpose({ show })

const svgPath =
  props.alertType === AlertType.ALERT_INFO
    ? 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    : props.alertType === AlertType.ALERT_SUCCESS
      ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      : props.alertType === AlertType.ALERT_WARNING
        ? 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
        : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
</script>
