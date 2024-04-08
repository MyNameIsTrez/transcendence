<template>
	<div class="tooltip tooltip-top" :data-tip="`${this.description}`">
		<p>{{ name }}</p>
	</div>
</template>

<script>
export default {
	props: {
		name: String,
		description: String
	}
}
</script>
