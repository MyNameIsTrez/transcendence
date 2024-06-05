<template>
  <aside>
    <router-link to="/" class="btn w-3/12">Profile</router-link>
    <router-link to="/Friends" class="btn w-2/12">Friends</router-link>
    <router-link to="/Blocked" class="btn w-3/12">Blocked</router-link>
    <router-link to="/Leaderboard" class="btn w-4/12">Leaderboard</router-link>
    <div class="bg-base-100 border-base-300 rounded-box">
      <RouterView></RouterView>
    </div>
  </aside>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped></style>
