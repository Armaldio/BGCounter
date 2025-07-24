import type { GameUtility, GameScore } from '@/types/bgg';

// Wingspan game utility
export const wingspanUtility: GameUtility = {
  gameId: '266192',
  gameName: 'Wingspan',
  
  calculateFinalScore: (score: GameScore): number => {
    const baseScore = score.score;
    const birdBonus = score.bonuses.birds || 0;
    const eggBonus = score.bonuses.eggs || 0;
    const foodBonus = score.bonuses.food || 0;
    const cardBonus = score.bonuses.bonusCards || 0;
    const objectiveBonus = score.bonuses.objectives || 0;
    
    return baseScore + birdBonus + eggBonus + foodBonus + cardBonus + objectiveBonus;
  },
  
  getBonusCalculations: () => ({
    birds: (count: number) => count,
    eggs: (count: number) => count,
    food: (count: number) => count,
    bonusCards: (points: number) => points,
    objectives: (points: number) => points,
    tuckedCards: (count: number) => count
  }),
  
  getScoreBreakdown: (score: GameScore) => [
    { label: 'Base Score', value: score.score },
    { label: 'Bird Points', value: score.bonuses.birds || 0 },
    { label: 'Eggs on Birds', value: score.bonuses.eggs || 0 },
    { label: 'Cached Food', value: score.bonuses.food || 0 },
    { label: 'Bonus Cards', value: score.bonuses.bonusCards || 0 },
    { label: 'End-of-Round Goals', value: score.bonuses.objectives || 0 },
    { label: 'Tucked Cards', value: score.bonuses.tuckedCards || 0 }
  ]
};