<template>
  <div class="scrollable-container-half">
    <div v-for="(chat, index) in chatsFn()" :key="index" class="line" @click="onClickFn(chat)">
      {{ chat.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(['chatsFn', 'onClickFn'])
</script>
