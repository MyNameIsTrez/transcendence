<template>
  <div class="card w-auto bg-base-100 shadow-xl mb-4">
    <div class="card-body">
      <div class="flex justify-between">
        <h2 :class="`card-title ${leftWon ? 'text-green-500' : 'text-red-600'}`">
          {{ leftPlayerDisconnected ? 'D/C' : leftWon ? 'Win' : 'Loss' }}
        </h2>
        <h2 class="card-title">{{ leftPlayerScore }}</h2>
        <h2 class="card-title">/</h2>
        <h2 class="card-title">{{ rightPlayerScore }}</h2>
        <h2 :class="`card-title ${leftWon ? 'text-red-600' : 'text-green-500'}`">
          {{ rightPlayerDisconnected ? 'D/C' : leftWon ? 'Loss' : 'Win' }}
        </h2>
      </div>
      <p class="text-center py-4 first-letter:capitalize">{{ gamemode }} match</p>
      <div class="grid grid-flow-row-dense grid-cols-3 place-items-center">
        <div class="truncate w-24">
          <p class="text text-justify text-blue-500">{{ leftPlayerName }}</p>
        </div>
        <p class="text text-justify">VS</p>
        <div class="truncate w-24">
          <p class="text text-justify">{{ rightPlayerName }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Misschien nog datum/tijd van de match saven en displayen -->
<script setup lang="ts">
let props = defineProps({
  leftPlayerName: String,
  rightPlayerName: String,
  leftPlayerDisconnected: Boolean,
  rightPlayerDisconnected: Boolean,
  leftPlayerIntraId: Number,
  myIntraId: Number,
  leftPlayerScore: Number,
  rightPlayerScore: Number,
  gamemode: String
})

let leftPlayerName = props.leftPlayerName
let rightPlayerName = props.rightPlayerName
let leftPlayerDisconnected = props.leftPlayerDisconnected
let rightPlayerDisconnected = props.rightPlayerDisconnected
let leftPlayerIntraId = props.leftPlayerIntraId
let myIntraId = props.myIntraId
let leftPlayerScore = props.leftPlayerScore
let rightPlayerScore = props.rightPlayerScore
const gamemode = props.gamemode

// Make sure that we are always on the left side of the match history
if (myIntraId != leftPlayerIntraId) {
  const tempName = leftPlayerName
  leftPlayerName = rightPlayerName
  rightPlayerName = tempName

  const tempDisconnected = leftPlayerDisconnected
  leftPlayerDisconnected = rightPlayerDisconnected
  rightPlayerDisconnected = tempDisconnected

  const tempScore = leftPlayerScore
  leftPlayerScore = rightPlayerScore
  rightPlayerScore = tempScore
}

let leftWon =
  rightPlayerDisconnected || (!leftPlayerDisconnected && leftPlayerScore > rightPlayerScore)
</script>
