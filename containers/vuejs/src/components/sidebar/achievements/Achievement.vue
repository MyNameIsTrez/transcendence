<template>
  <div class="tooltip tooltip-top" :data-tip="`${description}`">
    <p>{{ name }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: String,
  description: String
})
</script>
