import { createRouter, createWebHistory } from 'vue-router';
import GameListView from '@/views/GameListView.vue';
import GameDetailView from '@/views/GameDetailView.vue';
import TestGameView from '@/views/TestGameView.vue';
import ScoreTracker from '@/components/ScoreTracker.vue';

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
      path: '/game/:id/score',
      name: 'game-score',
      component: ScoreTracker,
      meta: {
        title: 'Game Score'
      }
    },
    {
      path: '/test',
      name: 'test',
      component: TestGameView,
      meta: {
        title: 'Game Utilities Test'
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