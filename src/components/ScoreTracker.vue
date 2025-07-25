<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { BGGGame, GameScore } from "@/types/bgg";
import { getGameUtility, GameUtilityKey } from "@/game-utilities";
import { useRoute, useRouter } from "vue-router";
import type { GameUtility } from "@/game-utilities/utils";
import { bggApi } from "@/services/bgg-api";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import ErrorMessage from "@/components/ErrorMessage.vue";

const route = useRoute();

const gameId = computed(() => route.params.id as GameUtilityKey);

const isLoading = ref(true);
const error = ref<string | null>(null);

const game = ref<BGGGame>();
const router = useRouter();

const loadGame = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const gameData = await bggApi.getGameById(gameId.value);
    if (gameData) {
      game.value = gameData;
    } else {
      error.value = "Game not found";
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to load game details";
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadGame();
});

// Game state
const players = ref<GameScore[]>([]);
const newPlayerName = ref("");
const showAddPlayer = ref(false);

// Game history
const gameHistory = ref<{players: GameScore[], turnId?: string}[]>([]);
const historyIndex = ref(-1);
const MAX_HISTORY = 50; // Limit history to prevent memory issues

// Save current game state to history
const saveToHistory = () => {
  // Don't save if no players yet
  if (players.value.length === 0) return;
  
  // If we're not at the end of history, remove future states
  if (historyIndex.value < gameHistory.value.length - 1) {
    gameHistory.value = gameHistory.value.slice(0, historyIndex.value + 1);
  }
  
  // Save current state
  const state = {
    players: JSON.parse(JSON.stringify(players.value)),
    turnId: turnId.value
  };
  
  gameHistory.value.push(state);
  
  // Enforce history limit
  if (gameHistory.value.length > MAX_HISTORY) {
    gameHistory.value.shift();
  } else {
    historyIndex.value = gameHistory.value.length - 1;
  }
};

// Undo last action
const undo = () => {
  if (historyIndex.value <= 0) return; // No history or already at first state
  
  historyIndex.value--;
  const previousState = gameHistory.value[historyIndex.value];
  players.value = JSON.parse(JSON.stringify(previousState.players));
  if (previousState.turnId) {
    turnId.value = previousState.turnId;
  }
};

// Redo last undone action
const redo = () => {
  if (historyIndex.value >= gameHistory.value.length - 1) return; // No future states
  
  historyIndex.value++;
  const nextState = gameHistory.value[historyIndex.value];
  players.value = JSON.parse(JSON.stringify(nextState.players));
  if (nextState.turnId) {
    turnId.value = nextState.turnId;
  }
};
const turnId = ref();
const currentTurn = computed(() => players.value.find(p => p.playerId === turnId.value));
const gameUtility = computed(() => getGameUtility(gameId.value));

const selectPlayerAsFirst = (player: GameScore) => {
  turnId.value = player.playerId;
};

// go to the next player using utility turn algorithm
const endTurn = (player: GameScore) => {
  if (!gameUtility.value) return;
  saveToHistory();
  turnId.value = gameUtility.value.modules.find(m => m.type === 'turn')?.algorithm(players.value, player.playerId);
};

// Determine if a score is the current winning score
const isWinningScore = (player: GameScore) => {
  if (!gameUtility.value) return false;
  const scores = players.value.map(
    (p) =>
      gameUtility.value?.calculateFinalScore?.({
        scores: p.scores,
        bonuses: p.bonuses,
        definition: gameUtility.value,
      }) ?? 0
  );
  const playerScore =
    gameUtility.value.calculateFinalScore?.({
      scores: player.scores,
      bonuses: player.bonuses,
      definition: gameUtility.value,
    }) ?? 0;

  if (gameUtility.value.winningCondition === "highest") {
    return playerScore === Math.max(...scores);
  } else {
    return playerScore === Math.min(...scores);
  }
};

// Check if score is tied with another player
const isTiedScore = (player: GameScore) => {
  if (!gameUtility.value) return false;
  const scores = players.value.map(
    (p) =>
      gameUtility.value?.calculateFinalScore?.({
        scores: p.scores,
        bonuses: p.bonuses,
        definition: gameUtility.value,
      }) ?? 0
  );
  const playerScore =
    gameUtility.value.calculateFinalScore?.({
      scores: player.scores,
      bonuses: player.bonuses,
      definition: gameUtility.value,
    }) ?? 0;

  return scores.filter((score) => score === playerScore).length > 1;
};

// Initialize a new player with default values
const createNewPlayer = (name: string): GameScore => {
  const scores: Record<string, any> = {};
  const bonuses: Record<string, any> = {};

  // Initialize all score types with default values
  if (gameUtility.value?.scores) {
    Object.entries(gameUtility.value.scores).forEach(([key, config]) => {
      scores[key] = "defaultValue" in config ? config.defaultValue : 0;
    });

    // Initialize bonus trackers if needed
    if (gameUtility.value.bonuses) {
      Object.keys(gameUtility.value.bonuses).forEach((key) => {
        bonuses[key] = 0;
      });
    }
  }

  return {
    playerId: `player-${Date.now()}`,
    playerName: name.trim(),
    scores,
    bonuses,
  };
};

const addPlayer = () => {
  if (!newPlayerName.value.trim()) return;
  
  saveToHistory();
  const newPlayer = createNewPlayer(newPlayerName.value.trim());
  players.value.push(newPlayer);
  newPlayerName.value = "";
  showAddPlayer.value = false;
  
  // If it's the first player, set them as current turn
  if (players.value.length === 1) {
    turnId.value = newPlayer.playerId;
  }
};

const removePlayer = (playerId: string) => {
  saveToHistory();
  players.value = players.value.filter((p) => p.playerId !== playerId);
};

const updateScore = (playerId: string, scoreType: keyof GameScore['scores'], value: any) => {
  saveToHistory();
  const player = players.value.find(p => p.playerId === playerId);
  if (!player) return;
  
  // Convert value to number if it's a string that can be converted
  let newValue = value;
  if (typeof value === 'string' && !isNaN(Number(value))) {
    newValue = Number(value);
  }
  
  player.scores[scoreType] = newValue;
  updatePlayerTotal(player);
};

// Adjust a player's score by a given amount
const adjustScore = (playerId: string, amount: number) => {
  saveToHistory();
  const player = players.value.find(p => p.playerId === playerId);
  if (!player) return;
  
  // Find the first score type that's a number to adjust
  const scoreType = Object.keys(player.scores).find(key => 
    typeof player.scores[key as keyof typeof player.scores] === 'number'
  ) as keyof GameScore['scores'] | undefined;
  
  if (scoreType !== undefined) {
    const currentValue = Number(player.scores[scoreType]) || 0;
    const newValue = currentValue + amount;
    
    // Only update if the new value is valid
    if (!isNaN(newValue)) {
      player.scores[scoreType] = newValue;
      updatePlayerTotal(player);
    }
  }
};

const adjustBonus = (
  playerId: string,
  bonusType: keyof GameScore['bonuses'],
  adjustment: number
) => {
  saveToHistory();
  const player = players.value.find(p => p.playerId === playerId);
  if (!player) return;
  
  const currentValue = Number(player.bonuses[bonusType]) || 0;
  const newValue = currentValue + adjustment;
  
  // Only update if the new value is valid and non-negative
  if (!isNaN(newValue) && newValue >= 0) {
    player.bonuses[bonusType] = newValue;
    updatePlayerTotal(player);
  }
};

const updatePlayerTotal = (player: GameScore) => {
  if (!gameUtility.value) return;

  // Calculate base score from all score types
  let total = 0;
  Object.entries(player.scores).forEach(([key, value]) => {
    const numValue = Number(value) || 0;
    total += numValue;
  });

  // Apply bonuses/penalties
  let bonusTotal = 0;
  if (gameUtility.value.bonuses) {
    Object.entries(gameUtility.value.bonuses).forEach(([key, bonus]) => {
      const bonusValue =
        (bonus as BonusConfig).calculate({
          scores: player.scores,
          bonuses: player.bonuses,
          definition: gameUtility.value,
        }) || 0;
      bonusTotal += bonusValue;
    });
  }

  // Update the player's total score
  player.score = total + bonusTotal;

  console.log("Updated score for", player.playerName, {
    baseScore: total,
    bonusTotal,
    finalScore: player.score,
  });
};

const getFinalScore = (player: GameScore): number => {
  if (!gameUtility.value?.calculateFinalScore) return 0;
  // Create a reactive dependency on player.bonuses to ensure updates
  const bonusDependency = JSON.stringify(player.bonuses);
  return (
    gameUtility.value.calculateFinalScore({
      scores: player.scores,
      bonuses: player.bonuses,
      definition: gameUtility.value,
    }) ?? 0
  );
};

const getScoreBreakdown = (player: GameScore) => {
  if (gameUtility.value?.getScoreBreakdown) {
    const breakdown = gameUtility.value.getScoreBreakdown({
      scores: player.scores,
      bonuses: player.bonuses,
      definition: gameUtility.value,
    });
    return Array.isArray(breakdown) ? breakdown : [];
  }
  return [];
};

const resetScores = () => {
  if (!confirm('Are you sure you want to reset all scores? This will clear all scores and game history but keep the players.')) {
    return;
  }
  
  // Save current player names and IDs to preserve them
  const playerNames = players.value.map(p => p.playerName);
  const playerIds = players.value.map(p => p.playerId);
  
  // Clear players array
  players.value = [];
  
  // Recreate players with same names and IDs but reset scores
  playerNames.forEach((name, index) => {
    const newPlayer = createNewPlayer(name);
    // Keep the original player ID
    newPlayer.playerId = playerIds[index];
    players.value.push(newPlayer);
  });
  
  // Reset turn to first player if there are players
  if (players.value.length > 0) {
    turnId.value = players.value[0].playerId;
  } else {
    turnId.value = undefined;
  }
  
  // Clear local storage for this game to ensure a fresh start
  localStorage.removeItem(`game-${gameId.value}-scores`);
  
  // Clear history
  gameHistory.value = [];
  historyIndex.value = -1;
  
  // Save the new reset state
  saveGameState();
};

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => getFinalScore(b) - getFinalScore(a));
});

onMounted(() => {
  // Load saved game state if exists
  const savedState = localStorage.getItem(`game-${gameId.value}-scores`);
  if (savedState) {
    try {
      players.value = JSON.parse(savedState);
    } catch (e) {
      console.error("Failed to load saved game state:", e);
    }
  }
});

// Auto-save game state
const saveGameState = () => {
  localStorage.setItem(
    `game-${gameId.value}-scores`,
    JSON.stringify(players.value)
  );
};

// Save whenever players data changes
$: {
  if (players.value.length > 0) {
    saveGameState();
  }
}
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

      <!-- Game name -->
      <div v-if="gameUtility">
        <h2 class="text-xl font-bold text-gray-900">
          {{ gameUtility.gameName }}
        </h2>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Score Tracker</h2>
          <div class="flex gap-2">
            <button @click="showAddPlayer = true" class="btn-primary text-sm">
              Add Player
            </button>
            <button @click="resetScores" class="btn-secondary text-sm">
              Reset Scores
            </button>
            <div class="flex border border-gray-300 rounded-md overflow-hidden">
              <button 
                @click="undo" 
                :disabled="historyIndex <= 0"
                class="px-3 py-1 text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300"
                title="Undo (Ctrl+Z)"
              >
                Undo
              </button>
              <button 
                @click="redo" 
                :disabled="historyIndex >= gameHistory.length - 1"
                class="px-3 py-1 text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                Redo
              </button>
            </div>
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
            <button
              @click="showAddPlayer = false"
              class="btn-secondary text-sm"
            >
              Cancel
            </button>
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
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-amber-600'
                      : 'bg-gray-300',
                  ]"
                >
                  {{ index + 1 }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">
                    {{ player.playerName }}
                  </h3>
                  <p class="text-lg font-bold text-bgg-primary">
                    {{ getFinalScore({ ...player }) }} points
                  </p>
                </div>
              </div>
              <button
                @click="removePlayer(player.playerId)"
                class="text-red-500 hover:text-red-700 p-1"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <!-- Modules -->
            <div v-for="module in gameUtility?.modules" :key="module.id">
              <div v-if="module.type === 'quick-controls'">
                <!-- Score Controls -->
                <div class="mb-3">
                  <div class="flex gap-2 overflow-x-auto">
                    <button
                      @click="adjustScore(player.playerId, quickControl.value)"
                      class="counter-btn counter-btn-positive text-lg font-semibold border border-bgg-primary rounded-full px-4 py-2"
                      v-for="quickControl in module.controls"
                    >
                      {{ quickControl.label }}
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="module.type === 'dices'">
                <!-- Dice -->
                <div class="mb-3">
                  <div class="flex gap-2">
                    <button
                      @click="adjustDice(player.playerId, dice.value)"
                      class="counter-btn counter-btn-positive text-sm"
                      v-for="dice in module.dices"
                    >
                      {{ dice.label }}
                    </button>
                  </div>
                </div>
              </div>
              <!-- Turn -->
              <div v-if="module.type === 'turn'">
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Current Turn</label
                  >
                  <div v-if="currentTurn" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      :class="[
                        'flex flex-col bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-200 transition-colors',
                        player.playerId === currentTurn?.playerId ? 'bg-blue-50' : '',
                      ]"
                    >
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium text-gray-800">{{
                          currentTurn?.playerName
                        }}</span>
                      </div>
                    </div>
                    <button
                      v-if="player.playerId === currentTurn?.playerId"
                      @click="endTurn(player)"
                      class="text-sm font-medium text-blue-500 hover:text-blue-700 p-1"
                    >
                      End Turn
                    </button>
                  </div>
                  <div v-else class="mt-2">
                    <button
                      @click="selectPlayerAsFirst(player)"
                      class="text-sm font-medium text-blue-500 hover:text-blue-700 p-1"
                    >
                      Select as first player
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="module.type === 'bonuses'">
                <div v-if="gameUtility?.bonuses" class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Bonuses</label
                  >
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      v-for="(bonus, bonusKey) in gameUtility.bonuses"
                      :key="bonusKey"
                      class="flex flex-col bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-200 transition-colors"
                      :title="bonus.description"
                    >
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium text-gray-800">{{
                          bonus.label
                        }}</span>
                        <span
                          class="text-sm font-mono px-2 py-0.5 bg-gray-100 rounded"
                        >
                          {{ player.bonuses[bonusKey] }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between mt-1">
                        <span class="text-xs text-gray-500">{{
                          bonus.description
                        }}</span>
                        <div class="flex gap-1">
                          <button
                            @click="adjustBonus(player.playerId, bonusKey, 1)"
                            class="w-6 h-6 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-colors"
                            :title="`Add ${bonus.label}`"
                          >
                            <span class="relative -top-px">+</span>
                          </button>
                          <button
                            @click="adjustBonus(player.playerId, bonusKey, -1)"
                            :disabled="!player.bonuses[bonusKey]"
                            class="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            :title="`Remove ${bonus.label}`"
                          >
                            <span class="relative -top-px">-</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            <!-- Score Breakdown -->
            <div
              v-if="gameUtility"
              class="text-xs text-gray-600 bg-white rounded p-2 border"
            >
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
    </div>
  </div>
</template>
