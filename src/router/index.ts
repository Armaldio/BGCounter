import { createRouter, createWebHistory } from 'vue-router';
import GameListView from '@/views/GameListView.vue';
import GameDetailView from '@/views/GameDetailView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'games',
      component: GameListView,
      meta: {
        title: 'BoardGameGeek Explorer'
      }
    },
    {
      path: '/game/:id',
      name: 'game-detail',
      component: GameDetailView,
      meta: {
        title: 'Game Details'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

// Update page title based on route
router.beforeEach((to) => {
  document.title = to.meta.title as string || 'BoardGameGeek Explorer';
});

export default router;