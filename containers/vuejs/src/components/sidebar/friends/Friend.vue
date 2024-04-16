<template>
  <div class="card lg:card-side bg-base-200">
    <figure>
      <div :class="`w-28 avatar ${this.status}`">
        <img class="rounded" :src="`${this.image}`" alt="Album" />
      </div>
    </figure>
    <div class="card-body h-28">
      <div style="clear: both">
        <h2 style="float: left; padding-top: 10px" class="card-title">{{ name }}</h2>
        <div style="float: right" class="dropdown dropdown-bottom dropdown-end">
          <div tabindex="0" role="button" class="m-1 btn btn-primary btn-square">
            <span class="material-symbols-outlined" style="font-size: 30px">settings</span>
          </div>
          <ul
            tabindex="0"
            class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-max"
          >
            <li><router-link to="FriendProfile">View profile</router-link></li>
            <!-- <li><a>View profile</a></li> -->
            <li><a>Invite to game</a></li>
            <li><a>Open chat</a></li>
            <li><a>Remove friend</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    image: String,
    status: String
  }
}
</script>
