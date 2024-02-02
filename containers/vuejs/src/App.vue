<template>
  <div id="app">
    <Pong />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Pong from './components/Pong.vue';

export default defineComponent({
  components: {
    Pong
  }
});
</script>

<style scoped>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
