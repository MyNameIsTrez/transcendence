<template>
	<aside >
		<div role="tablist" class="tabs tabs-lifted">
 			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Profile" checked />
			 <div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6"><Profile /></div>
			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Friends" />
				<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6"><Friends /></div>

			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Leaderboard" />
				<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">Tab content 3</div>
		</div>

</aside>
</template>

<script lang="ts" setup>

import Profile from './sidebar/Profile.vue'
import Friends from './sidebar/Friends.vue'

</script>

<style lang="scss" scoped>
  .match-report {
    p {
      clear: both;
      margin-left: 20px;
      margin-right: 20px;
    }

    .player1 {
      p {
        float: left;
        // text-align: left;
      }
    }

    .player2 {
      p {
        float: right;
        // text-align: right;
      }
    }

    .match-date {
      p {
        float: center;
      }
    }
  }


  .tooltip {
    text-align: left;
    padding-left: 30px;
    padding-top: 2px;
    position: relative;
    // border-bottom: 1px dotted black;
  }

  .tooltip .tooltiptext {
    visibility: hidden;
    width: 120px;
    background-color: white;
    color: black;
    text-align: center;
    border-radius: 6px;
    padding: 5px 0;

    position: absolute;
    z-index: 1;
  }

  .tooltip:hover .tooltiptext {
    visibility: visible;
  }

  .flex {
    flex: 1 1 0%;
  }

  .logo {
    margin-bottom: 1rem;

    img {
      width: 2rem;
    }
  }
</style>
