import type { GameScore } from '@/types/bgg';
import { GameUtility } from '.';

export const odinUtility: GameUtility = {
  gameId: '406854',
  gameName: 'Odin (2024)',
  minPlayers: 2,
  maxPlayers: 4,
  winningCondition: 'lowest',
  
  calculateFinalScore: (score: GameScore): number => {
    const cardsInHand = score.scores?.cardsInHand || 0;
    const roundsWon = score.bonuses?.roundsWon || 0;
    return cardsInHand - (roundsWon * 2); // -2 points per round won
  },
  
  scoreTypes: {
    cardsInHand: {
      label: 'Cards in Hand',
      type: 'number',
      min: 0,
      step: 1
    },
    roundsWon: {
      label: 'Rounds Won',
      type: 'number',
      min: 0,
      step: 1
    }
  },
  
  bonuses: {
    roundBonus: {
      label: 'Round Bonus',
      description: '-2 points per round won',
      type: 'bonus',
      calculate: (score) => -((score.bonuses?.roundsWon || 0) * 2)
    }
  },
  
  getScoreBreakdown: (score) => {
    const cardsInHand = score.scores?.cardsInHand || 0;
    const roundsWon = score.bonuses?.roundsWon || 0;
    const roundBonus = -roundsWon * 2;
    const total = cardsInHand + roundBonus;
    
    return [
      { label: 'Cards in Hand', value: cardsInHand, type: 'base' },
      { 
        label: 'Round Bonus', 
        value: roundBonus, 
        type: 'bonus',
        description: `${roundsWon} rounds won × -2 points`
      },
      { 
        label: 'Total Score', 
        value: total, 
        type: 'total',
        description: 'Lower is better'
      }
    ];
  },
  
  ui: {
    showRoundTracker: true,
    allowNegativeScores: true,
    customComponents: ['OdinRoundTracker']
  }
};
