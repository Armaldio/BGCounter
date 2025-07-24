import type { GameScore as BaseGameScore } from '@/types/bgg';

export type ScoreType = 'number' | 'boolean' | 'select' | 'multiplier';

export type ScoreTypeConfig<T extends ScoreType> = {
  label: string;
  description?: string;
  type: T;
  defaultValue?: 
    T extends 'number' ? number :
    T extends 'boolean' ? boolean :
    T extends 'select' ? string | number :
    T extends 'multiplier' ? number :
    never;
  options?: T extends 'select' ? Array<{ label: string; value: string | number }> : never;
  min?: T extends 'number' | 'multiplier' ? number : never;
  max?: T extends 'number' | 'multiplier' ? number : never;
  step?: T extends 'number' | 'multiplier' ? number : never;
};

export type BonusConfig = {
  label: string;
  description?: string;
  calculate: (score: GameScore<any, any>) => number;
  type?: 'bonus' | 'penalty';
};

export type ScoreBreakdownItem = {
  label: string;
  value: number | string;
  type?: 'base' | 'bonus' | 'penalty' | 'total';
  description?: string;
};

export interface GameScore<TScores extends Record<string, any> = {}, TBonuses extends Record<string, any> = {}> extends BaseGameScore {
  scores: TScores;
  bonuses: TBonuses;
  score: number;
}

export interface GameUtility<TScores extends Record<string, any> = {}, TBonuses extends Record<string, any> = {}, TScoreTypes extends Record<string, ScoreTypeConfig<ScoreType>> = {}> {
  // Core identification
  gameId: string;
  gameName: string;
  
  // Game metadata
  minPlayers: number;
  maxPlayers: number;
  winningCondition: 'highest' | 'lowest';
  
  // Core game mechanics
  calculateFinalScore: (score: GameScore<TScores, TBonuses>) => number;
  validateScore?: (score: GameScore<TScores, TBonuses>) => { valid: boolean; message?: string };
  
  // Scoring configuration
  scoreTypes: TScoreTypes;
  
  // Bonus and penalty system
  bonuses?: Record<string, BonusConfig>;
  
  // Score presentation
  getScoreBreakdown: (score: GameScore<TScores, TBonuses>) => ScoreBreakdownItem[];
  
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