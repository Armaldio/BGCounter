<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6">Game Utilities Test</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Splendor Test -->
      <div class="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Splendor</h2>
        <ScoreTracker game-id="174430" />
      </div>
      
      <!-- Odin Test -->
      <div class="bg-white rounded-xl shadow p-6 border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Odin (2024)</h2>
        <ScoreTracker game-id="406854" />
      </div>
      
      <!-- Qwirkle Test -->
      <div class="bg-white rounded-xl shadow p-6 border border-gray-200 md:col-span-2">
        <h2 class="text-xl font-semibold mb-4">Qwirkle</h2>
        <ScoreTracker game-id="25669" />
      </div>
    </div>
    
    <div class="mt-8 bg-gray-50 p-6 rounded-xl">
      <h2 class="text-xl font-semibold mb-4">Test Instructions</h2>
      <div class="space-y-4">
        <div>
          <h3 class="font-medium text-gray-900">Splendor (Highest Score Wins)</h3>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
            <li>Add 2-4 players</li>
            <li>Test base points, noble bonuses, and card bonuses</li>
            <li>Verify gem efficiency bonus (1 point per 5 gems)</li>
            <li>Check that highest score is highlighted</li>
          </ul>
        </div>
        
        <div>
          <h3 class="font-medium text-gray-900">Odin (Lowest Score Wins)</h3>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
            <li>Add 2-4 players</li>
            <li>Test cards in hand and rounds won</li>
            <li>Verify round bonus (-2 points per round won)</li>
            <li>Check that lowest score is highlighted</li>
          </ul>
        </div>
        
        <div>
          <h3 class="font-medium text-gray-900">Qwirkle (Highest Score Wins)</h3>
          <ul class="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-600">
            <li>Add 2-4 players</li>
            <li>Test base points from placed tiles</li>
            <li>Add Qwirkles (6-tile lines) for bonus points</li>
            <li>Check "Used All Tiles" on final turn for bonus</li>
            <li>Verify score breakdown shows all components</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ScoreTracker from '@/components/ScoreTracker.vue';

const router = useRouter();

// Add a test player to each game when the component mounts
onMounted(() => {
  // Clear any existing test data
  localStorage.removeItem('splendor-test-players');
  localStorage.removeItem('odin-test-players');
});
</script>
