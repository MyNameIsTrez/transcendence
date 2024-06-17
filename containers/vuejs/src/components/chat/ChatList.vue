<template>
  <div class="scrollable-container-half">
    <div v-for="chat in chatsFn()" :key="chat.chat_id" class="line" @click="onClickFn(chat)">
      {{ chat.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(['chatsFn', 'onClickFn'])
</script>
