<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { GameScore } from '@/types/bgg';
import { getGameUtility } from '@/game-utilities';

interface Props {
  gameId: string;
  gameName: string;
}

const props = defineProps<Props>();

const players = ref<GameScore[]>([]);
const newPlayerName = ref('');
const showAddPlayer = ref(false);

const gameUtility = computed(() => getGameUtility(props.gameId));

const addPlayer = () => {
  if (!newPlayerName.value.trim()) return;
  
  const newPlayer: GameScore = {
    playerId: `player-${Date.now()}`,
    playerName: newPlayerName.value.trim(),
    score: 0,
    bonuses: {}
  };
  
  players.value.push(newPlayer);
  newPlayerName.value = '';
  showAddPlayer.value = false;
};

const removePlayer = (playerId: string) => {
  players.value = players.value.filter(p => p.playerId !== playerId);
};

const adjustScore = (playerId: string, adjustment: number) => {
  const player = players.value.find(p => p.playerId === playerId);
  if (player) {
    player.score += adjustment;
  }
};

const adjustBonus = (playerId: string, bonusType: string, adjustment: number) => {
  const player = players.value.find(p => p.playerId === playerId);
  if (player) {
    if (!player.bonuses[bonusType]) {
      player.bonuses[bonusType] = 0;
    }
    player.bonuses[bonusType] += adjustment;
    if (player.bonuses[bonusType] < 0) {
      player.bonuses[bonusType] = 0;
    }
  }
};

const getFinalScore = (player: GameScore): number => {
  if (gameUtility.value) {
    return gameUtility.value.calculateFinalScore(player);
  }
  return player.score;
};

const getScoreBreakdown = (player: GameScore) => {
  if (gameUtility.value) {
    return gameUtility.value.getScoreBreakdown(player);
  }
  return [{ label: 'Score', value: player.score }];
};

const resetScores = () => {
  players.value.forEach(player => {
    player.score = 0;
    player.bonuses = {};
  });
};

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => getFinalScore(b) - getFinalScore(a));
});

onMounted(() => {
  // Load saved game state if exists
  const savedState = localStorage.getItem(`game-${props.gameId}-scores`);
  if (savedState) {
    try {
      players.value = JSON.parse(savedState);
    } catch (e) {
      console.error('Failed to load saved game state:', e);
    }
  }
});

// Auto-save game state
const saveGameState = () => {
  localStorage.setItem(`game-${props.gameId}-scores`, JSON.stringify(players.value));
};

// Save whenever players data changes
$: {
  if (players.value.length > 0) {
    saveGameState();
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">Score Tracker</h2>
      <div class="flex gap-2">
        <button
          @click="showAddPlayer = true"
          class="btn-primary text-sm"
        >
          Add Player
        </button>
        <button
          v-if="players.length > 0"
          @click="resetScores"
          class="btn-secondary text-sm"
        >
          Reset All
        </button>
      </div>
    </div>

    <!-- Add Player Form -->
    <div v-if="showAddPlayer" class="mb-6 p-4 bg-gray-50 rounded-lg">
      <div class="flex gap-2">
        <input
          v-model="newPlayerName"
          type="text"
          placeholder="Player name"
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bgg-primary focus:border-transparent"
          @keydown.enter="addPlayer"
        />
        <button @click="addPlayer" class="btn-primary text-sm">Add</button>
        <button @click="showAddPlayer = false" class="btn-secondary text-sm">Cancel</button>
      </div>
    </div>

    <!-- Players List -->
    <div v-if="players.length === 0" class="text-center py-8 text-gray-500">
      No players added yet. Click "Add Player" to start tracking scores.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(player, index) in sortedPlayers"
        :key="player.playerId"
        class="bg-gray-50 rounded-lg p-4"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
              ]"
            >
              {{ index + 1 }}
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ player.playerName }}</h3>
              <p class="text-lg font-bold text-bgg-primary">{{ getFinalScore(player) }} points</p>
            </div>
          </div>
          <button
            @click="removePlayer(player.playerId)"
            class="text-red-500 hover:text-red-700 p-1"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Score Controls -->
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Base Score: {{ player.score }}</label>
          <div class="flex gap-2">
            <button
              @click="adjustScore(player.playerId, 1)"
              class="counter-btn counter-btn-positive text-sm"
            >
              +1
            </button>
            <button
              @click="adjustScore(player.playerId, 2)"
              class="counter-btn counter-btn-positive text-sm"
            >
              +2
            </button>
            <button
              @click="adjustScore(player.playerId, 10)"
              class="counter-btn counter-btn-positive text-sm"
            >
              +10
            </button>
            <button
              @click="adjustScore(player.playerId, -10)"
              class="counter-btn counter-btn-negative text-sm"
            >
              -10
            </button>
            <button
              @click="adjustScore(player.playerId, -1)"
              class="counter-btn counter-btn-negative text-sm"
            >
              -1
            </button>
          </div>
        </div>

        <!-- Game-specific Bonuses -->
        <div v-if="gameUtility" class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-2">Bonuses</label>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(calculator, bonusType) in gameUtility.getBonusCalculations()"
              :key="bonusType"
              class="flex items-center justify-between bg-white rounded p-2 border"
            >
              <span class="text-sm capitalize">{{ bonusType }}: {{ player.bonuses[bonusType] || 0 }}</span>
              <div class="flex gap-1">
                <button
                  @click="adjustBonus(player.playerId, bonusType, 1)"
                  class="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                >
                  +
                </button>
                <button
                  @click="adjustBonus(player.playerId, bonusType, -1)"
                  class="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Score Breakdown -->
        <div v-if="gameUtility" class="text-xs text-gray-600 bg-white rounded p-2 border">
          <div class="font-medium mb-1">Score Breakdown:</div>
          <div class="grid grid-cols-2 gap-1">
            <div
              v-for="item in getScoreBreakdown(player)"
              :key="item.label"
              class="flex justify-between"
            >
              <span>{{ item.label }}:</span>
              <span>{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>