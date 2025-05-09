import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: () => import('@renderer/views/reader/Index.vue')
  },
  {
    path: '/setting',
    name: 'Setting',
    component: () => import('@renderer/views/setting/Index.vue')
  }
];

export default routes;
