<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { bggApi } from '@/services/bgg-api';
import type { BGGGame, BGGSearchResult } from '@/types/bgg';
import GameCard from '@/components/GameCard.vue';
import SearchBar from '@/components/SearchBar.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

const router = useRouter();

const searchQuery = ref('');
const searchResults = ref<BGGSearchResult[]>([]);
const popularGames = ref<BGGGame[]>([]);
const isSearching = ref(false);
const isLoadingPopular = ref(true);
const searchError = ref<string | null>(null);
const popularError = ref<string | null>(null);

const displayedGames = computed(() => {
  if (searchQuery.value.trim() && searchResults.value.length > 0) {
    return searchResults.value;
  }
  return popularGames.value;
});

const isSearchMode = computed(() => searchQuery.value.trim().length > 0);

const handleSearch = async (query: string) => {
  if (!query.trim()) {
    searchResults.value = [];
    searchError.value = null;
    return;
  }

  isSearching.value = true;
  searchError.value = null;

  try {
    searchResults.value = await bggApi.searchGames(query);
  } catch (error) {
    searchError.value = error instanceof Error ? error.message : 'Search failed';
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

const loadPopularGames = async () => {
  isLoadingPopular.value = true;
  popularError.value = null;

  try {
    // Get hot games from BGG
    popularGames.value = await bggApi.getHotGames();

    console.log(popularGames.value);
    
    // // Get detailed information for the hot games
    // if (hotGames.length > 0) {
    //   const gameIds = hotGames.map(game => game.id);
    //   popularGames.value = await bggApi.getGameDetails(gameIds);
    // }
  } catch (error) {
    popularError.value = error instanceof Error ? error.message : 'Failed to load games';
  } finally {
    isLoadingPopular.value = false;
  }
};

const handleGameClick = (game: BGGGame | BGGSearchResult) => {
  router.push(`/game/${game.id}`);
};

const retryPopular = () => {
  loadPopularGames();
};

const retrySearch = () => {
  handleSearch(searchQuery.value);
};

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch(newQuery);
  }, 300);
});

onMounted(() => {
  loadPopularGames();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <div class="text-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">BoardGameGeek Explorer</h1>
          <p class="text-gray-600">Discover and track your favorite board games</p>
        </div>
        
        <SearchBar
          v-model="searchQuery"
          placeholder="Search for board games..."
          :loading="isSearching"
          @search="handleSearch"
        />
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Search Results -->
      <div v-if="isSearchMode">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">
            Search Results
            <span v-if="searchResults.length > 0" class="text-gray-500 font-normal">
              ({{ searchResults.length }} found)
            </span>
          </h2>
        </div>

        <div v-if="isSearching">
          <LoadingSpinner text="Searching games..." />
        </div>

        <div v-else-if="searchError">
          <ErrorMessage :message="searchError" :retryable="true" @retry="retrySearch" />
        </div>

        <div v-else-if="searchResults.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No games found</h3>
          <p>Try searching for a different game title.</p>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            v-for="game in searchResults"
            :key="game.id"
            @click="handleGameClick(game)"
          >
            <GameCard :game="game" :is-search-result="true" />
          </div>
        </div>
      </div>

      <!-- Popular Games -->
      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Featured Games</h2>
        </div>

        <div v-if="isLoadingPopular">
          <LoadingSpinner text="Loading featured games..." />
        </div>

        <div v-else-if="popularError">
          <ErrorMessage :message="popularError" :retryable="true" @retry="retryPopular" />
        </div>

        <div v-else-if="popularGames.length === 0" class="text-center py-12 text-gray-500">
          <div class="text-lg">No games available at the moment.</div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            v-for="game in popularGames"
            :key="game.id"
            @click="handleGameClick(game)"
          >
            <GameCard :game="game" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>