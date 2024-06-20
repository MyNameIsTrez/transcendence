<style>
#game-overlay {
  container: game-overlay / inline-size;
}

@container game-overlay (min-width: 0px) {
  #game-overlay-inner {
    font-size: 2cqw !important;
  }
}
</style>

<template>
  <div id="game-overlay" class="absolute w-full h-full pointer-events-none">
    <div id="game-overlay-inner" class="flex flex-col items-center w-full h-full">
      <ScoreBoard />
      <GameHeader />
    </div>
  </div>
</template>

<script setup lang="ts">
import ScoreBoard from './ScoreBoard.vue'
import GameHeader from './GameHeader.vue'
</script>
