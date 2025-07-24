# Game Utilities System

This document explains how to add new games to the BoardGameGeek Score Tracker application using the game utilities system.

## Overview

The game utilities system provides a flexible way to define game-specific scoring rules, bonuses, and UI components. Each game has its own utility file that defines how scores are calculated and displayed.

## Creating a New Game Utility

1. Create a new TypeScript file in `src/game-utilities/` with the naming convention `game-{BGG_ID}.ts`
2. Import the necessary types and define your game utility object
3. Export the utility as a named export

## Game Utility Interface

```typescript
interface GameUtility {
  // Core identification
  gameId: string;           // BGG game ID
  gameName: string;         // Full game name
  minPlayers: number;       // Minimum number of players
  maxPlayers: number;       // Maximum number of players
  winningCondition: 'highest' | 'lowest';  // How the winner is determined
  
  // Score calculation
  calculateFinalScore: (score: GameScore) => number;
  
  // Score type definitions
  scoreTypes: {
    [key: string]: {
      label: string;        // Display label
      type: 'number' | 'boolean' | 'select' | 'multiplier';  // Input type
      min?: number;         // Minimum value (for number type)
      max?: number;         // Maximum value (for number type)
      step?: number;        // Step value (for number type)
      options?: Array<{     // Options (for select type)
        value: any;
        label: string;
      }>;
    };
  };
  
  // Bonuses and penalties
  bonuses?: {
    [key: string]: {
      label: string;        // Display label
      description: string;  // Description for tooltip
      type: 'bonus' | 'penalty';
      calculate: (score: GameScore) => number;
    };
  };
  
  // Score breakdown
  getScoreBreakdown: (score: GameScore) => Array<{
    label: string;
    value: number;
    type: 'base' | 'bonus' | 'penalty' | 'total';
    description?: string;
  }>;
  
  // UI configuration
  ui?: {
    showRoundTracker?: boolean;  // Show/hide round tracker
    allowNegativeScores?: boolean; // Allow negative scores
    customComponents?: string[];  // List of custom Vue components
  };
}
```

## Example: Simple Game

```typescript
// src/game-utilities/game-12345.ts
import type { GameUtility, GameScore } from '@/types/bgg';

export const myGameUtility: GameUtility = {
  gameId: '12345',
  gameName: 'My Board Game',
  minPlayers: 2,
  maxPlayers: 4,
  winningCondition: 'highest',
  
  calculateFinalScore: (score: GameScore) => {
    const baseScore = score.scores?.points || 0;
    const bonus = score.bonuses?.bonusPoints || 0;
    return baseScore + bonus;
  },
  
  scoreTypes: {
    points: {
      label: 'Victory Points',
      type: 'number',
      min: 0,
      step: 1
    },
    bonusPoints: {
      label: 'Bonus Points',
      type: 'number',
      min: 0,
      step: 1
    }
  },
  
  bonuses: {
    specialBonus: {
      label: 'Special Bonus',
      description: 'Awarded for special achievements',
      type: 'bonus',
      calculate: (score) => score.bonuses?.specialBonus || 0
    }
  },
  
  getScoreBreakdown: (score) => {
    const points = score.scores?.points || 0;
    const bonus = score.bonuses?.specialBonus || 0;
    const total = points + bonus;
    
    return [
      { label: 'Base Points', value: points, type: 'base' },
      { 
        label: 'Special Bonus', 
        value: bonus, 
        type: 'bonus',
        description: 'Awarded for special achievements'
      },
      { 
        label: 'Total Score', 
        value: total, 
        type: 'total'
      }
    ];
  },
  
  ui: {
    showRoundTracker: true,
    allowNegativeScores: false
  }
};
```

## Registering the Game Utility

1. Open `src/game-utilities/index.ts`
2. Import your new game utility
3. Add it to the `gameUtilities` object

```typescript
import { myGameUtility } from './game-12345';

const gameUtilities = {
  // ... existing games
  '12345': myGameUtility
};
```

## Testing Your Game

1. Start the development server if not already running:
   ```bash
   pnpm dev
   ```
2. Navigate to `http://localhost:5173/test` to see your game in the test environment
3. Test all scoring scenarios, edge cases, and UI elements

## Best Practices

1. **Keep it Simple**: Start with basic scoring and add complexity as needed
2. **Document**: Add comments explaining any non-obvious scoring rules
3. **Test Thoroughly**: Verify all scoring calculations with known game scenarios
4. **Use Enums**: For games with many similar components, consider using enums for better type safety
5. **Error Handling**: Add validation for invalid scores or game states

## Advanced: Custom Components

For games requiring complex UI beyond basic inputs, you can create custom Vue components:

1. Create your component in `src/components/games/`
2. Register it in your game utility's `ui.customComponents` array
3. The component will receive these props:
   - `player`: Current player's score data
   - `updateScore`: Function to update the player's score
   - `gameUtility`: The game utility object

Example custom component:

```vue
<template>
  <div class="custom-score-input">
    <!-- Your custom UI here -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { GameUtility, PlayerScore } from '@/types/bgg';

const props = defineProps<{
  player: PlayerScore;
  updateScore: (updates: Record<string, any>) => void;
  gameUtility: GameUtility;
}>();
</script>
```
