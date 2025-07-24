<script setup lang="ts">
import type { BGGGame, BGGSearchResult } from '@/types/bgg';
import { computed } from 'vue';

interface Props {
  game: BGGGame | BGGSearchResult;
  isSearchResult?: boolean;
}

const props = defineProps<Props>();

const gameData = computed(() => props.game as BGGGame);
const searchData = computed(() => props.game as BGGSearchResult);

const displayImage = computed(() => {
  if (props.isSearchResult) return undefined;
  return gameData.value.thumbnail || `https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=300&fit=crop&crop=center`;
});

const displayName = computed(() => {
  return props.game.name;
});

const displayYear = computed(() => {
  if (props.isSearchResult) {
    return searchData.value.yearPublished;
  }
  return gameData.value.yearPublished;
});

const playerCount = computed(() => {
  if (props.isSearchResult) return undefined;
  const min = gameData.value.minPlayers;
  const max = gameData.value.maxPlayers;
  if (min && max) {
    return min === max ? `${min}` : `${min}-${max}`;
  }
  return undefined;
});

const playTime = computed(() => {
  if (props.isSearchResult) return undefined;
  const time = gameData.value.playingTime || gameData.value.maxPlayTime;
  return time ? `${time} min` : undefined;
});

const rating = computed(() => {
  if (props.isSearchResult) return undefined;
  return gameData.value.averageRating ? gameData.value.averageRating.toFixed(1) : undefined;
});
</script>

<template>
  <div class="game-card group cursor-pointer">
    <div class="aspect-square overflow-hidden bg-gray-100" v-if="displayImage">
      <img 
        :src="displayImage" 
        :alt="displayName"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        loading="lazy"
      />
    </div>
    <div class="aspect-square bg-gradient-to-br from-bgg-primary to-bgg-secondary flex items-center justify-center" v-else>
      <div class="text-white font-bold text-lg text-center px-4">
        {{ displayName.slice(0, 2).toUpperCase() }}
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-bgg-primary transition-colors">
        {{ displayName }}
      </h3>
      
      <div class="space-y-1 text-xs text-gray-600">
        <div v-if="displayYear" class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ displayYear }}</span>
        </div>
        
        <div v-if="playerCount" class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <span>{{ playerCount }} players</span>
        </div>
        
        <div v-if="playTime" class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ playTime }}</span>
        </div>
        
        <div v-if="rating" class="flex items-center gap-1">
          <svg class="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>{{ rating }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>