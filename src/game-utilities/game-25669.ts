import type { GameScore } from '@/types/bgg';
import { GameUtility } from '.';

export const qwirkleUtility: GameUtility = {
  // Core identification
  gameId: '25669',
  gameName: 'Qwirkle',
  minPlayers: 2,
  maxPlayers: 4,
  winningCondition: 'highest',
  
  // Score calculation
  calculateFinalScore: (score: GameScore): number => {
    const baseScore = score.scores?.points || 0;
    const qwirkleBonus = score.bonuses?.qwirkles || 0;
    const allTilesBonus = score.bonuses?.allTiles ? 6 : 0;
    
    return baseScore + (qwirkleBonus * 6) + allTilesBonus;
  },
  
  // Score configuration
  scoreTypes: {
    points: {
      label: 'Points',
      type: 'number',
      min: 0,
      step: 1
    },
    qwirkles: {
      label: 'Qwirkles',
      description: 'Number of completed lines of 6 tiles',
      type: 'number',
      min: 0,
      step: 1
    },
    allTiles: {
      label: 'Used All Tiles',
      description: 'Check if player used all tiles on their last turn',
      type: 'boolean'
    }
  },
  
  // Bonuses and scoring breakdown
  bonuses: {
    qwirkleBonus: {
      label: 'Qwirkle Bonus',
      description: '6 points per completed line of 6 tiles',
      type: 'bonus',
      calculate: (score) => {
        console.log('score', score);
        return (score.scores?.qwirkles || 0) * 6;
      }
    },
    allTilesBonus: {
      label: 'All Tiles Bonus',
      description: '6 points for using all tiles on final turn',
      type: 'bonus',
      calculate: (score) => {
        console.log('score', score);
        return score.scores?.allTiles ? 6 : 0;
      }
    }
  },
  
  // Score breakdown
  getScoreBreakdown: (score) => {
    const points = score.scores?.points || 0;
    const qwirkleBonus = (score.bonuses?.qwirkles || 0) * 6;
    const allTilesBonus = score.bonuses?.allTiles ? 6 : 0;
    const total = points + qwirkleBonus + allTilesBonus;
    
    return [
      { 
        label: 'Base Points', 
        value: points, 
        type: 'base',
        description: 'Points from placed tiles (1 per tile in a line)'
      },
      { 
        label: 'Qwirkle Bonuses', 
        value: qwirkleBonus, 
        type: 'bonus',
        description: `${score.bonuses?.qwirkles || 0} Qwirkles × 6 points`
      },
      ...(allTilesBonus > 0 ? [{
        label: 'All Tiles Bonus',
        value: allTilesBonus,
        type: 'bonus',
        description: 'Used all tiles on final turn'
      }] : []),
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
    showRoundTracker: true,
    allowNegativeScores: false,
    customComponents: []
  }
};

export default qwirkleUtility;
