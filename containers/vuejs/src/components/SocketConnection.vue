<script setup lang="ts">
import { defineComponent } from 'vue'

export default {
const connectToServer = () => {
	const socket = io('http://localhost:4242')
	  if (socket) {
		socket.on('connect', () => {
	console.log('Connected')
	// Additional initialization logic if needed
		})
		socket.on('pong', (data) => {
	console.log(data)
	// Additional logic if needed
		})
		socket.on('disconnect', () => {
	console.log('Disconnected')
	// Additional disconnection handling if needed
		})
		// Attach event listeners
		document.addEventListener('keydown', (event) => {
	const keyName = event.key
	console.log(keyName)
	socket.emit('pressed', keyName)
		})
		document.addEventListener('keyup', (event) => {
	const keyName = event.key
	console.log(keyName)
	socket.emit('released', keyName)
		})
	  }
}
</script>
