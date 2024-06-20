<template>
  <button
    class="play-button text-center bg-slate-50 hover:bg-slate-700 text-black"
    @click="emit('clicked')"
  >
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
  padding: 1.5em 3em;
  margin: 3em;
}
</style>
