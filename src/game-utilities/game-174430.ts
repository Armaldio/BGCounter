import type { GameUtility, GameScore } from '@/types/bgg';

// Splendor game utility
export const splendorUtility: GameUtility = {
  gameId: '174430',
  gameName: 'Splendor',
  
  calculateFinalScore: (score: GameScore): number => {
    const baseScore = score.score;
    const nobleBonus = score.bonuses.nobles || 0;
    const cardBonus = score.bonuses.cards || 0;
    
    return baseScore + (nobleBonus * 3) + cardBonus;
  },
  
  getBonusCalculations: () => ({
    nobles: (count: number) => count * 3,
    cards: (points: number) => points,
    gems: (count: number) => Math.floor(count / 5) // Bonus for efficient gem management
  }),
  
  getScoreBreakdown: (score: GameScore) => [
    { label: 'Base Score', value: score.score },
    { label: 'Noble Cards', value: (score.bonuses.nobles || 0) * 3 },
    { label: 'Development Cards', value: score.bonuses.cards || 0 },
    { label: 'Gem Efficiency Bonus', value: Math.floor((score.bonuses.gems || 0) / 5) }
  ]
};