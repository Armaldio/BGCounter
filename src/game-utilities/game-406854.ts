import type { GameUtility, GameScore } from '@/types/bgg';

// Odin (2024) game utility
export const odinUtility: GameUtility = {
  gameId: '406854',
  gameName: 'Odin (2024)',
  
  calculateFinalScore: (score: GameScore): number => {
    return score.score; // In Odin, the score is simply the sum of cards left in hand
  },
  
  getBonusCalculations: () => ({
    cardsLeft: (count: number) => count, // Each card left is 1 point
    emptyHand: () => 0, // No bonus for empty hand, just 0 points
    roundsWon: (count: number) => -count * 2 // Negative points for rounds won (lower is better)
  }),
  
  getScoreBreakdown: (score: GameScore) => [
    { label: 'Cards in Hand', value: score.score },
    { label: 'Rounds Won', value: score.bonuses.roundsWon || 0 },
    { label: 'Total Score', value: score.score + (score.bonuses.roundsWon || 0) * -2 }
  ]
};
