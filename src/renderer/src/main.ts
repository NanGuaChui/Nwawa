import App from './App.vue';
import { createApp } from 'vue';

import { setupStore } from './stores';
import { setupRouter } from './router';
import { setupAssets, setupScrollbarStyle } from './plugins';

async function bootstrap() {
  const app = createApp(App);

  setupAssets();

  setupScrollbarStyle();

  setupStore(app);

  await setupRouter(app);

  app.mount('#app');
}

bootstrap();
