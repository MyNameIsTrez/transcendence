<template>
  <tr>
    <th>
      <div class="text text-center">{{ rank }}.</div>
    </th>
    <td>
      <div class="flex items-center gap-3">
        <div class="avatar">
          <div class="mask mask-squircle w-12 h-12">
            <img :src="`${profilePicture}`" alt="Avatar Tailwind CSS Component" />
          </div>
        </div>
        <div>
          <router-link :to="{ path: `user/${intraId}` }">
            <div class="text font-bold">{{ username }}</div>
          </router-link>
        </div>
      </div>
    </td>
    <th class="align-middle">
      <div class="text text-center">{{ wins }}/{{ losses }}</div>
    </th>
  </tr>
</template>

<script setup lang="ts">
import { getImage } from '../../../httpRequests'

const props = defineProps({
  username: String,
  intraId: Number,
  rank: Number,
  wins: Number,
  losses: Number
})

const profilePicture = await getImage(`api/user/profilePicture/${props.intraId}`)
</script>
