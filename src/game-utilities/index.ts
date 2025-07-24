import type { GameScore } from '@/types/bgg';

export interface GameUtility {
  // Core identification
  gameId: string;
  gameName: string;
  
  // Game metadata
  minPlayers: number;
  maxPlayers: number;
  winningCondition: 'highest' | 'lowest';
  
  // Core game mechanics
  calculateFinalScore: (score: GameScore) => number;
  validateScore?: (score: GameScore) => { valid: boolean; message?: string };
  
  // Scoring configuration
  scoreTypes: {
    [key: string]: {
      label: string;
      description?: string;
      type: 'number' | 'boolean' | 'select' | 'multiplier';
      defaultValue?: number | boolean | string;
      options?: Array<{ label: string; value: string | number }>;
      min?: number;
      max?: number;
      step?: number;
    };
  };
  
  // Bonus and penalty system
  bonuses?: {
    [key: string]: {
      label: string;
      description?: string;
      calculate: (score: GameScore) => number;
      type?: 'bonus' | 'penalty';
    };
  };
  
  // Score presentation
  getScoreBreakdown: (score: GameScore) => Array<{
    label: string;
    value: number | string;
    type?: 'base' | 'bonus' | 'penalty' | 'total';
    description?: string;
  }>;
  
  // UI configuration
  ui?: {
    showRoundTracker?: boolean;
    allowNegativeScores?: boolean;
    customComponents?: string[]; // For game-specific UI components
  };
}

// Import game-specific utilities
import { splendorUtility } from './game-174430';
import { wingspanUtility } from './game-266192';
import { odinUtility } from './game-406854';
import { qwirkleUtility } from './game-25669';

// Map of game IDs to their respective utilities
export const gameUtilities: Record<string, GameUtility> = {
  '174430': splendorUtility,
  '266192': wingspanUtility,
  '406854': odinUtility,
  '25669': qwirkleUtility
};

export function getGameUtility(gameId: string): GameUtility | null {
  return gameUtilities[gameId] || null;
}

export function hasGameUtility(gameId: string): boolean {
  return gameId in gameUtilities;
}