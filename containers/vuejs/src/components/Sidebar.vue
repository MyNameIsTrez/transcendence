<template>
  <!-- <router-link to="Profile" tag="btn">foo</router-link> -->
  <aside>
    <router-link to="Profile" class="btn w-3/12">Profile</router-link>

    <router-link to="Friends" class="btn w-4/12">Friends</router-link>

    <router-link to="Leaderboard" class="btn w-5/12">Leaderboard</router-link>

    <div class="bg-base-100 border-base-300 rounded-box">
      <RouterView></RouterView>
    </div>

    <!-- TODO: een manier zoeken om het oude beneden te combineren met het nieuwe boven -->
    <!-- <div role="tablist" class="tabs tabs-lifted">
			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Profile" checked />
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Profile />
			</div>
			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Friends" />
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Friends />
			</div>
			<input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Leaderboard" />
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Leaderboard />
			</div>
		</div> -->
    <!--
			<div role="tablist" class="tabs tabs-lifted">
			<router-link to="Profile" tag="input" type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Profile" checked>Profile</router-link>
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<router-view></router-view>
			</div>
			<router-link to="Friends" tag="input" type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Friends">Friends</router-link>
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Friends />
			</div>
			<router-link to="Leaderboard" tag="input" type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Leaderboard">Leaderboard</router-link>
			<div role="tabpanel" class="tab-content bg-base-100 border-base-300 rounded-box p-6">
				<Leaderboard />
			</div>
		</div>
		<router-view></router-view>
		 -->
  </aside>
</template>
