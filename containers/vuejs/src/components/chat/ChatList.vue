<template>
  <div class="scrollable-container">
    <div v-for="chat in chatsFn()" :key="chat.chat_id" class="line" @click="onClickFn(chat)">
      {{ chat.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(['chatsFn', 'onClickFn'])
</script>

<style scoped>
.scrollable-container {
  width: 100%;
  height: 700px;
  padding: 10px;
  overflow-y: auto;
  word-break: break-all;
}

.line {
  width: 100%;
  padding: 5px;
  cursor: pointer;
  user-select: none;
}

.line:hover {
  background-color: hsl(0, 0%, 30%);
}
</style>
