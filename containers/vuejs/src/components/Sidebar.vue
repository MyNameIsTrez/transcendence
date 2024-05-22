<template>
  <aside>
    <router-link to="/" tag="button" class="btn w-3/12">Profile</router-link>
    <router-link to="/Friends" class="btn w-4/12">Friends</router-link>
    <router-link to="/Leaderboard" class="btn w-5/12">Leaderboard</router-link>
    <div class="bg-base-100 border-base-300 rounded-box">
      <RouterView></RouterView>
    </div>
  </aside>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped></style>
