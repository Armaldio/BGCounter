<template>
  <div class="odin-tracker p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">Odin (2024) Score Tracker</h2>
    
    <!-- Players List -->
    <div class="mb-6">
      <div class="flex items-center mb-4">
        <input
          v-model="newPlayerName"
          type="text"
          placeholder="Player name"
          class="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="addPlayer"
        >
        <button
          @click="addPlayer"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r transition-colors"
        >
          Add Player
        </button>
      </div>
      
      <div v-if="players.length > 0" class="space-y-4">
        <div 
          v-for="(player, index) in players" 
          :key="player.id" 
          class="flex items-center space-x-4 p-3 bg-gray-50 rounded"
        >
          <span class="flex-1 font-medium">{{ player.name }}</span>
          <div class="flex items-center space-x-2">
            <button
              @click="decrementScore(player.id)"
              class="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
              :disabled="getCurrentRoundScore(player.id) <= 0"
            >
              -
            </button>
            <span class="w-10 text-center font-bold">{{ getCurrentRoundScore(player.id) }}</span>
            <button
              @click="incrementScore(player.id)"
              class="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
            >
              +
            </button>
          </div>
          <span class="w-16 text-right font-bold">Total: {{ player.totalScore }}</span>
          <button
            @click="removePlayer(player.id)"
            class="text-gray-400 hover:text-red-500 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      <div v-else class="text-gray-500 text-center py-4">
        Add players to start tracking scores
      </div>
    </div>

    <!-- Round Controls -->
    <div class="flex justify-between items-center mt-6 pt-4 border-t">
      <div class="text-sm text-gray-500">
        Round {{ currentRound }}
      </div>
      <div class="space-x-2">
        <button
          @click="resetRound"
          class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          :disabled="!isRoundInProgress || players.length === 0"
        >
          Reset Round
        </button>
        <button
          @click="endRound"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          :disabled="!isRoundInProgress || players.length === 0"
        >
          End Round
        </button>
      </div>
    </div>

    <!-- Game Log -->
    <div v-if="gameLog.length > 0" class="mt-6 pt-4 border-t">
      <h3 class="font-semibold mb-2">Game Log</h3>
      <div class="space-y-2 max-h-40 overflow-y-auto text-sm">
        <div 
          v-for="(log, index) in [...gameLog].reverse()" 
          :key="index"
          class="p-2 bg-gray-50 rounded"
        >
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Player {
  id: string;
  name: string;
  totalScore: number;
  currentRoundScore: number;
}

const players = ref<Player[]>([]);
const newPlayerName = ref('');
const currentRound = ref(1);
const gameLog = ref<string[]>([]);

const isRoundInProgress = computed(() => {
  return players.value.some(p => p.currentRoundScore > 0);
});

const addPlayer = () => {
  if (!newPlayerName.value.trim()) return;
  
  const player: Player = {
    id: Date.now().toString(),
    name: newPlayerName.value.trim(),
    totalScore: 0,
    currentRoundScore: 0
  };
  
  players.value.push(player);
  logEvent(`${player.name} joined the game`);
  newPlayerName.value = '';
  saveGameState();
};

const removePlayer = (playerId: string) => {
  const player = players.value.find(p => p.id === playerId);
  if (player) {
    logEvent(`${player.name} left the game`);
    players.value = players.value.filter(p => p.id !== playerId);
    saveGameState();
  }
};

const incrementScore = (playerId: string) => {
  const player = players.value.find(p => p.id === playerId);
  if (player) {
    player.currentRoundScore++;
    saveGameState();
  }
};

const decrementScore = (playerId: string) => {
  const player = players.value.find(p => p.id === playerId);
  if (player && player.currentRoundScore > 0) {
    player.currentRoundScore--;
    saveGameState();
  }
};

const getCurrentRoundScore = (playerId: string) => {
  const player = players.value.find(p => p.id === playerId);
  return player ? player.currentRoundScore : 0;
};

const endRound = () => {
  if (players.value.length === 0) return;
  
  let roundLog = `Round ${currentRound.value} ended. `;
  const scores: string[] = [];
  
  players.value.forEach(player => {
    player.totalScore += player.currentRoundScore;
    scores.push(`${player.name}: ${player.currentRoundScore} (Total: ${player.totalScore})`);
    player.currentRoundScore = 0;
  });
  
  roundLog += scores.join(', ');
  logEvent(roundLog);
  
  // Check for winner
  const winner = players.value.find(p => p.totalScore >= 15);
  if (winner) {
    logEvent(`🎉 ${winner.name} has won the game with ${winner.totalScore} points!`);
  }
  
  currentRound.value++;
  saveGameState();
};

const resetRound = () => {
  if (confirm('Reset all scores for this round?')) {
    players.value.forEach(player => {
      player.currentRoundScore = 0;
    });
    logEvent(`Round ${currentRound.value} was reset`);
    saveGameState();
  }
};

const logEvent = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  gameLog.value.push(`[${timestamp}] ${message}`);
};

// Save/load game state
const saveGameState = () => {
  const gameState = {
    players: players.value,
    currentRound: currentRound.value,
    gameLog: gameLog.value
  };
  localStorage.setItem('odinTrackerState', JSON.stringify(gameState));};

const loadGameState = () => {
  const savedState = localStorage.getItem('odinTrackerState');
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      players.value = state.players || [];
      currentRound.value = state.currentRound || 1;
      gameLog.value = state.gameLog || [];
    } catch (e) {
      console.error('Failed to load game state', e);
    }
  }
};

onMounted(() => {
  loadGameState();
  logEvent('New game started');
});
</script>

<style scoped>
.odin-tracker {
  max-width: 600px;
  margin: 0 auto;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
