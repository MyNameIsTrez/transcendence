<script setup lang="ts">
import PongCanvas from './components/PongCanvas.vue'
import Sidebar from './components/Sidebar.vue'

</script>

<template>

  <!-- <button class="btn btn-neutral">Neutral</button> -->
	<div class="flex flex-col w-full lg:flex-row">
	<div class="grid flex-grow h-32 card place-items-center"><Sidebar /></div>
	<!-- <Sidebar /> -->
	<!-- <div class="divider lg:divider-horizontal"></div> -->
	<div class="grid card bg-base-300 place-items-center"><PongCanvas /></div>
	<!-- <PongCanvas /> -->
	</div>


</template>

<!-- <style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}

body {
  align-content: center;
  display: flex;
  margin: 0 auto;
  font-family: 'Press Start 2P', cursive;
}

</style>
<style lang="scss">
:root {
	--primary: #4ade80;
	--primary-alt: #22c55e;
	--grey: #64748b;
	--dark: #1e293b;
	--dark-alt: #334155;
	--light: #f1f5f9;
	--sidebar-width: 300px;
}

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: inherit;
}

body {
	background: var(--light);
}

button {
	cursor: pointer;
	appearance: none;
	border: none;
	outline: none;
	background: none;
}

.app {
	display: flex;

	main {
		flex: 1 1 0;
		padding: 2rem;

		@media (max-width: 1024px) {
			padding-left: 6rem;
		}
	}
}
body {
  align-content: center;
  display: flex;
  margin: 0 auto;
  font-family: 'Press Start 2P', cursive;
}
</style> -->
