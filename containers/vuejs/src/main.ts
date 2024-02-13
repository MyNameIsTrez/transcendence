import { createApp } from 'vue'
import App from './App.vue'
import VueSocketIO from 'vue-socket.io'


const app = createApp(App)

app.use(new VueSocketIO({
debug: true,
connection: 'http://localhost:4242',
vuex: {
actionPrefix: 'SOCKET_',
mutationPrefix: 'SOCKET_'
}}))

app.mount('#app')
