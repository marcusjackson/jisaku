import { createApp } from 'vue';

import { handleAppError } from '@/shared/utils/app-error-handler';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(router);

// Global error handler — catches unhandled errors from Vue's component lifecycle.
// Surfaces a toast so the user is notified of unexpected failures without silent swallowing.
app.config.errorHandler = handleAppError;

app.mount('#app');
