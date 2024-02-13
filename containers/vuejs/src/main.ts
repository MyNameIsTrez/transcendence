import { createApp } from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'

const app = createApp(App)
app.use(new VueSocketIO({
	debug: true,
    connection: SocketIO('http://localhost:4242'), //options object is Optional
    vuex: {
      actionPrefix: "SOCKET_",
      mutationPrefix: "SOCKET_"
    }
}))

app.mount('#app')
