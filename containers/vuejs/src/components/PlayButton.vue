<template>
  <button class="play-button" @click="emit('clicked')">
    {{ buttonText }}
  </button>
</template>
<script setup lang="ts">
// Allows anyone using PlayButton to use `@clicked="fooFn"`
const emit = defineEmits(['clicked'])

defineProps({
  buttonText: String
})
</script>
<style>
.play-button {
  background-color: white;
  color: black;
  text-align: center;
  font-size: 1vw;
  padding: 1.5vw 3vw;
  margin: 6vw;
}
.play-button:hover {
  background-color: #333; /* Darker shade on hover */
}
</style>
