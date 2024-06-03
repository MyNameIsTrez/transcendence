<template>
  <div class="tooltip tooltip-top" :data-tip="`${description}`">
    <p>{{ name }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  name: String,
  description: String
})
</script>
