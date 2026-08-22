import { createApp } from 'vue'

import { useToast } from '@/shared/composables/use-toast'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

// Global error handler — catches unhandled errors from Vue's component lifecycle.
// Surfaces a toast so the user is notified of unexpected failures without silent swallowing.
app.config.errorHandler = (_err, _vm, _info) => {
  const { error } = useToast()
  error('An unexpected error occurred. Please reload the page.')
}

app.mount('#app')
