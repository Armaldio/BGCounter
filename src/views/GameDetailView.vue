<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { bggApi } from '@/services/bgg-api';
import type { BGGGame } from '@/types/bgg';
import { hasGameUtility } from '@/game-utilities';
import { defineAsyncComponent } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';
import ScoreTracker from '@/components/ScoreTracker.vue';

// Async components for better performance
const OdinTracker = defineAsyncComponent(
  () => import('@/components/games/OdinTracker.vue')
);

const route = useRoute();
const router = useRouter();

const game = ref<BGGGame | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const gameId = computed(() => route.params.id as string);

const displayImage = computed(() => {
  if (!game.value) return undefined;
  return game.value.image || game.value.thumbnail || `https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&h=600&fit=crop&crop=center`;
});

const playerCountText = computed(() => {
  if (!game.value) return '';
  const min = game.value.minPlayers;
  const max = game.value.maxPlayers;
  if (min && max) {
    return min === max ? `${min} players` : `${min}-${max} players`;
  }
  return '';
});

const playTimeText = computed(() => {
  if (!game.value) return '';
  const minTime = game.value.minPlayTime;
  const maxTime = game.value.maxPlayTime;
  const playTime = game.value.playingTime;
  
  if (minTime && maxTime && minTime !== maxTime) {
    return `${minTime}-${maxTime} minutes`;
  }
  return playTime ? `${playTime} minutes` : '';
});

const complexityText = computed(() => {
  if (!game.value?.complexity) return '';
  const complexity = game.value.complexity;
  if (complexity <= 2) return 'Light';
  if (complexity <= 3) return 'Medium';
  if (complexity <= 4) return 'Heavy';
  return 'Very Heavy';
});

const hasScoreTracker = computed(() => hasGameUtility(game.value?.id, 'score-tracker'));
const hasOdinTracker = computed(() => game.value?.id === '406854');

const loadGame = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const gameData = await bggApi.getGameById(gameId.value);
    if (gameData) {
      game.value = gameData;
    } else {
      error.value = 'Game not found';
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load game details';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
};

const retry = () => {
  loadGame();
};

onMounted(() => {
  loadGame();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="isLoading">
      <LoadingSpinner text="Loading game details..." />
    </div>

    <!-- Error State -->
    <div v-else-if="error">
      <div class="p-4">
        <button @click="goBack" class="btn-secondary mb-4">
          ← Back to Games
        </button>
        <ErrorMessage :message="error" :retryable="true" @retry="retry" />
      </div>
    </div>

    <!-- Game Details -->
    <div v-else-if="game" class="pb-8">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <button @click="goBack" class="btn-secondary mb-4">
            ← Back to Games
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Game Image -->
          <div class="lg:col-span-1">
            <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-md">
              <img
                :src="displayImage"
                :alt="game.name"
                class="w-full h-full object-cover"
              />
            </div>
          </div>

          <!-- Game Information -->
          <div class="lg:col-span-2 space-y-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ game.name }}</h1>
              <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                <span v-if="game.yearPublished" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ game.yearPublished }}
                </span>
                <span v-if="playerCountText" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  {{ playerCountText }}
                </span>
                <span v-if="playTimeText" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ playTimeText }}
                </span>
                <span v-if="game.minAge" class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Ages {{ game.minAge }}+
                </span>
              </div>
            </div>

            <!-- Rating and Stats -->
            <div v-if="game.averageRating || game.usersRated" class="bg-white rounded-lg p-4 border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-3">Community Stats</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div v-if="game.averageRating">
                  <div class="text-2xl font-bold text-bgg-primary">{{ game.averageRating.toFixed(1) }}</div>
                  <div class="text-sm text-gray-600">Average Rating</div>
                </div>
                <div v-if="game.usersRated">
                  <div class="text-2xl font-bold text-bgg-primary">{{ game.usersRated.toLocaleString() }}</div>
                  <div class="text-sm text-gray-600">Users Rated</div>
                </div>
                <div v-if="game.rank">
                  <div class="text-2xl font-bold text-bgg-primary">#{{ game.rank }}</div>
                  <div class="text-sm text-gray-600">BGG Rank</div>
                </div>
                <div v-if="complexityText">
                  <div class="text-2xl font-bold text-bgg-primary">{{ complexityText }}</div>
                  <div class="text-sm text-gray-600">Complexity</div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="game.description" class="bg-white rounded-lg p-6 border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-3">Description</h3>
              <div class="prose prose-sm max-w-none text-gray-700">
                {{ game.description }}
              </div>
            </div>

            <!-- Game Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-if="game.categories && game.categories.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-3">Categories</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="category in game.categories.slice(0, 6)"
                    :key="category"
                    class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {{ category }}
                  </span>
                </div>
              </div>

              <div v-if="game.mechanics && game.mechanics.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-3">Mechanics</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="mechanic in game.mechanics.slice(0, 6)"
                    :key="mechanic"
                    class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {{ mechanic }}
                  </span>
                </div>
              </div>

              <div v-if="game.designers && game.designers.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-3">Designers</h3>
                <div class="space-y-1">
                  <div
                    v-for="designer in game.designers.slice(0, 3)"
                    :key="designer"
                    class="text-sm text-gray-700"
                  >
                    {{ designer }}
                  </div>
                </div>
              </div>

              <div v-if="game.publishers && game.publishers.length > 0" class="bg-white rounded-lg p-4 border border-gray-200">
                <h3 class="font-semibold text-gray-900 mb-3">Publishers</h3>
                <div class="space-y-1">
                  <div
                    v-for="publisher in game.publishers.slice(0, 3)"
                    :key="publisher"
                    class="text-sm text-gray-700"
                  >
                    {{ publisher }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Game Utilities -->
        <div class="mt-8 space-y-8">          
          <!-- Score Tracker -->
          <div v-if="hasScoreTracker">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Score Tracker</h2>
            <router-link :to="{ name: 'game-score', params: { id: game.id } }" class="btn-primary">Go to Score Tracker</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>