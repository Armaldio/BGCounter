import type { GameScore } from '@/types/bgg';
import { GameUtility } from '.';

// Splendor game utility
export const splendorUtility: GameUtility = {
  // Core identification
  gameId: '174430',
  gameName: 'Splendor',
  minPlayers: 2,
  maxPlayers: 4,
  winningCondition: 'highest',
  
  // Score calculation
  calculateFinalScore: (score: GameScore): number => {
    const baseScore = score.scores?.points || 0;
    const nobleBonus = (score.bonuses?.nobles || 0) * 3;
    const cardBonus = score.bonuses?.cards || 0;
    const gemBonus = Math.floor((score.bonuses?.gems || 0) / 5);
    
    return baseScore + nobleBonus + cardBonus + gemBonus;
  },
  
  // Score configuration
  scoreTypes: {
    points: {
      label: 'Victory Points',
      type: 'number',
      min: 0,
      step: 1
    },
    nobles: {
      label: 'Nobles',
      type: 'number',
      min: 0,
      max: 5,
      step: 1
    },
    cards: {
      label: 'Development Cards',
      type: 'number',
      min: 0,
      step: 1
    },
    gems: {
      label: 'Gems',
      type: 'number',
      min: 0,
      step: 1
    }
  },
  
  // Bonuses and penalties
  bonuses: {
    nobleBonus: {
      label: 'Noble Bonus',
      description: '3 points per noble card',
      type: 'bonus',
      calculate: (score) => (score.bonuses?.nobles || 0) * 3
    },
    cardBonus: {
      label: 'Card Bonus',
      description: 'Points from development cards',
      type: 'bonus',
      calculate: (score) => score.bonuses?.cards || 0
    },
    gemEfficiency: {
      label: 'Gem Efficiency',
      description: '1 point per 5 gems (rounded down)',
      type: 'bonus',
      calculate: (score) => Math.floor((score.bonuses?.gems || 0) / 5)
    }
  },
  
  // Score breakdown
  getScoreBreakdown: (score) => {
    const points = score.scores?.points || 0;
    const nobleBonus = (score.bonuses?.nobles || 0) * 3;
    const cardBonus = score.bonuses?.cards || 0;
    const gemBonus = Math.floor((score.bonuses?.gems || 0) / 5);
    const total = points + nobleBonus + cardBonus + gemBonus;
    
    return [
      { label: 'Base Points', value: points, type: 'base' },
      { 
        label: 'Nobles', 
        value: nobleBonus, 
        type: 'bonus',
        description: `${score.bonuses?.nobles || 0} nobles × 3 points`
      },
      { 
        label: 'Development Cards', 
        value: cardBonus, 
        type: 'bonus',
        description: 'Points from cards'
      },
      { 
        label: 'Gem Efficiency', 
        value: gemBonus, 
        type: 'bonus',
        description: `${score.bonuses?.gems || 0} gems ÷ 5 (rounded down)`
      },
      { 
        label: 'Total Score', 
        value: total, 
        type: 'total',
        description: 'Sum of all points and bonuses'
      }
    ];
  },
  
  // UI configuration
  ui: {
    showRoundTracker: false,
    allowNegativeScores: false,
    customComponents: ['SplendorNoblesTracker']
  }
};