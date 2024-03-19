<template>
<div class="grid justify-center">
	<h1 class="text text-center font-bold">Your profile</h1>
	<br>
	<p class="text-2xl text-center text-yellow-200">mforstho</p>
	<br>
	<div class="flex justify-between">
		<div class="avatar justify-start">
			<div class="w-24 rounded">
				<img src="/vuejs/code/src/assets/mforstho.png" />
			</div>
		</div>
		<div class="text">W/L ratio: <span class="text text-green-500">121</span>/<span class="text text-red-600">1</span></div>
	</div>




	<div style="clear: both; padding-top: 50px;">
		<div tabindex="0" class="collapse w-96 bg-base-200">
			<!-- <input type="checkbox" /> -->
			<div class="collapse-title text-xl font-medium">Match history</div>
			<div class="collapse-content">
				<div class="card w-[352px] bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="flex justify-between">
							<h2 class="card-title text-green-500">Win</h2>
							<h2 class="card-title">10</h2>
							<h2 class="card-title">/</h2>
							<h2 class="card-title">7</h2>
							<h2 class="card-title text-red-600">Loss</h2>
						</div>
							<br>
							<br>
						<div class="flex justify-between">
							<p class="text-justify text-blue-500">mforstho</p>
							<p class="text-justify">VS</p>
							<p class="text-justify">safoh</p>
						</div>
					</div>
				</div>
				<br>
				<div class="card w-[352px] bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="flex justify-between">
							<h2 class="card-title text-red-600">Loss</h2>
							<h2 class="card-title">3</h2>
							<h2 class="card-title">/</h2>
							<h2 class="card-title">10</h2>
							<h2 class="card-title text-green-500">Win</h2>
						</div>
							<br>
							<br>
						<div class="flex justify-between">
							<p class="text-justify text-blue-500">mforstho</p>
							<p class="text-justify">VS</p>
							<p class="text-justify">safoh</p>
						</div>
					</div>
				</div>
				<br>
				<div class="card w-[352px] bg-base-100 shadow-xl">
					<div class="card-body">
						<div class="flex justify-between">
							<h2 class="card-title text-green-500">Win</h2>
							<h2 class="card-title">10</h2>
							<h2 class="card-title">/</h2>
							<h2 class="card-title">9</h2>
							<h2 class="card-title text-red-600">Loss</h2>
						</div>
							<br>
							<br>
						<div class="flex justify-between">
							<p class="text-justify text-blue-500">mforstho</p>
							<p class="text-justify">VS</p>
							<p class="text-justify">safoh</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<br>

	<div tabindex="0" class="collapse w-96 bg-base-200">
		<!-- <input type="checkbox" /> -->
		<div class="collapse-title text-xl font-medium">Achievements</div>
			<div class="collapse-content">
				<div class="card w-[352px] bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="text-2xl font-bold">Unlocked</h2>
						<div class="tooltip tooltip-right" data-tip="Win for the first time">
							<p>A good start</p>
						</div>
						<div class="tooltip tooltip-right" data-tip="Win 100 times in a row">
							<p>Unstoppable!</p>
						</div>
					</div>
				</div>
				<br>
				<div class="card w-[352px] bg-base-100 shadow-xl">
					<div class="card-body">
						<h2 class="text-2xl font-bold">Locked</h2>
						<div class="tooltip tooltip-right" data-tip="Lose for the first time">
							<p>Unfortunate</p>
						</div>
						<div class="tooltip tooltip-right" data-tip="Lose 100 times in a row">
							<p>How?!</p>
						</div>
					</div>
				</div>
			</div>
	</div>
	<!-- <div>
		<h1>Your achievements</h1>
		<br>
		<div class="card w-96 bg-base-200 shadow-xl">
			<div class="card-body">
				<h2 class="text-2xl font-bold">Unlocked</h2>
				<div class="tooltip tooltip-right" data-tip="Win for the first time">
					<p>A good start</p>
				</div>
				<div class="tooltip tooltip-right" data-tip="Win 100 times in a row">
					<p>Unstoppable!</p>
				</div>
			</div>
		</div>
		<br>
		<div class="card w-96 bg-base-200 shadow-xl">
			<div class="card-body">
				<h2 class="text-2xl font-bold">Locked</h2>
				<div class="tooltip tooltip-right" data-tip="Lose for the first time">
					<p>Unfortunate</p>
				</div>
				<div class="tooltip tooltip-right" data-tip="Lose 100 times in a row">
					<p>How?!</p>
				</div>
			</div>
		</div>
	</div> -->

	</div>
</template>

<style lang="scss" scoped>

</style>
