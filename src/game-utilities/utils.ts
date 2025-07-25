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
  value: number;
  type?: 'base' | 'bonus' | 'penalty' | 'total';
  description?: string;
};

type WithLabel = {
  label: string;
  description?: string;
};

type BaseConfig<T, TScores extends Record<string, any>, TBonuses extends Record<string, any>> = WithLabel & {
  calculate: ({ scores, bonuses, definition }: { scores: TScores, bonuses: TBonuses, definition: GameUtility<TScores, TBonuses> }) => T;
};

type ScoreDefinition<T extends number | boolean, TScores extends Record<string, any>, TBonuses extends Record<string, any>> = BaseConfig<T, TScores, TBonuses> & {
    type?: 'number' | 'boolean';
    min?: number;
    max?: number;
    step?: number;
    defaultValue: T;
  }

export interface GameScore<TScores extends Record<string, any>, TBonuses extends Record<string, any>> extends BaseGameScore {
  scores: TScores;
  bonuses: TBonuses;
  score: number;
}

export interface QuickControl {
  label: string;
  value: number;
}

type Dice = {
  label: string;
  value: number;
  color: string;
}

type BaseModule = {
  id: string;
  type: string;
}

type ModuleQuickControls = BaseModule & {
  type: 'quick-controls';
  controls: QuickControl[];
}

type ModuleDices = BaseModule & {
  type: 'dices';
  dices: Dice[];
}

type ModuleBonuses = BaseModule & {
  type: 'bonuses';
  bonuses: BonusConfig[];
}

type Module = 
  | ModuleQuickControls
  | ModuleDices
  | ModuleBonuses

export interface GameUtility<TScores extends Record<string, any>, TBonuses extends Record<string, BonusConfig>> {
  // Core identification
  gameId: string;
  gameName: string;
  
  // Game metadata
  minPlayers: number;
  maxPlayers: number;
  winningCondition: 'highest' | 'lowest';

  modules: Module[];
  
  // Core game mechanics
  calculateFinalScore: ({ scores, bonuses, definition }: { scores: TScores, bonuses: TBonuses, definition: GameUtility<TScores, TBonuses> }) => number;
  validateScore?: ({ scores, bonuses, definition }: { scores: TScores, bonuses: TBonuses, definition: GameUtility<TScores, TBonuses> }) => { valid: boolean; message?: string };
  
  // Scoring configuration
  scores: { [key in keyof TScores]: ScoreDefinition<TScores[key], TScores, TBonuses> };
  
  // Bonus and penalty system
  bonuses?: { [key in keyof TBonuses]: ScoreDefinition<TBonuses[key], TScores, TBonuses> };
  
  // Score presentation
  getScoreBreakdown: ({ scores, bonuses, definition }: { scores: TScores, bonuses: TBonuses, definition: GameUtility<TScores, TBonuses> }) => ScoreBreakdownItem[];
  
  // UI configuration
  ui?: {
    showRoundTracker?: boolean;
    allowNegativeScores?: boolean;
    customComponents?: string[]; // For game-specific UI components
  };
}

export const createGameUtility = <TScores extends Record<string, any>, TBonuses extends Record<string, any>>(
  config: GameUtility<TScores, TBonuses>
) => config;