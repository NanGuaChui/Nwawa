import { createRouter, createWebHashHistory } from 'vue-router';
import routes from './routes';
import type { App } from 'vue';

export const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes
});

export async function setupRouter(app: App) {
  app.use(router);
  await router.isReady();
}
