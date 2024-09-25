import { createRouter, createWebHistory } from 'vue-router';
import ScanPage from './views/scanpage/ScanPage.vue';
import ListGuest from './views/guest/ListGuest.vue';
import NewGuest from './views/guest/NewGuest.vue';

const routes = [
  {
    path: '/',
    name: 'Scan',
    component: ScanPage,
  },
  {
    path: '/list',
    name: 'Convidados',
    component: ListGuest,
  },
  {
    path: '/new',
    name: 'Novo convidado',
    component: NewGuest,
  }
];

export const router = createRouter({
  history: createWebHistory('/'),
  routes
})
