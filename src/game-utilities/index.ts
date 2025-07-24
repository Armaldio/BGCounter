import type { GameScore } from '@/types/bgg';

export interface GameUtility {
  gameId: string;
  gameName: string;
  calculateFinalScore: (score: GameScore) => number;
  getBonusCalculations: () => Record<string, (value: number) => number>;
  getScoreBreakdown: (score: GameScore) => Array<{ label: string; value: number }>;
}

// Import game-specific utilities
import { splendorUtility } from './game-174430';
import { wingspanUtility } from './game-266192';

export const gameUtilities: Record<string, GameUtility> = {
  '174430': splendorUtility, // Splendor
  '266192': wingspanUtility, // Wingspan
};

export function getGameUtility(gameId: string): GameUtility | null {
  return gameUtilities[gameId] || null;
}

export function hasGameUtility(gameId: string): boolean {
  return gameId in gameUtilities;
}