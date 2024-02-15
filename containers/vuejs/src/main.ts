import { createApp } from 'vue'
import App from './App.vue'

import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

const app = createApp(App)

app.use(VueSidebarMenu)

app.mount('#app')
