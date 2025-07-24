import type { GameScore, GameUtility, ScoreBreakdownItem } from '.';

type QwirkleScores = {
  points: number;
  qwirkles: number;
  allTiles: boolean;
};

type QwirkleBonuses = {
  qwirkleBonus: number;
  allTilesBonus: number;
};

const qwirkleScoreTypes = {
  points: {
    label: 'Points',
    type: 'number' as const,
    min: 0,
    step: 1,
    defaultValue: 0
  },
  qwirkles: {
    label: 'Qwirkles',
    description: 'Number of completed lines of 6 tiles',
    type: 'number' as const,
    min: 0,
    step: 1,
    defaultValue: 0
  },
  allTiles: {
    label: 'Used All Tiles',
    description: 'Check if player used all tiles on their last turn',
    type: 'boolean' as const,
    defaultValue: false
  }
} as const;

export const qwirkleUtility: GameUtility<QwirkleScores, QwirkleBonuses, typeof qwirkleScoreTypes> = {
  // Core identification
  gameId: '25669',
  gameName: 'Qwirkle',
  minPlayers: 2,
  maxPlayers: 4,
  winningCondition: 'highest',
  
  // Score calculation
  calculateFinalScore: (score: GameScore<QwirkleScores, QwirkleBonuses>): number => {
    const baseScore = score.scores?.points || 0;
    const qwirkleBonus = score.bonuses?.qwirkleBonus || 0;
    const allTilesBonus = score.bonuses?.allTilesBonus || 0;
    
    return baseScore + (qwirkleBonus * 6) + allTilesBonus;
  },
  
  // Score configuration
  scoreTypes: qwirkleScoreTypes,
  
  // Bonuses and scoring breakdown
  bonuses: {
    qwirkleBonus: {
      label: 'Qwirkle Bonus',
      description: '12 points per completed line of 6 tiles',
      type: 'bonus',
      calculate: (score) => {
        console.log('score', score);
        return (score.scores?.qwirkles || 0) * 12;
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
    const qwirkleBonus = (score.bonuses?.qwirkleBonus || 0) * 12;
    const allTilesBonus = score.bonuses?.allTilesBonus || 0;
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
        description: `${score.bonuses?.qwirkleBonus || 0} Qwirkles × 12 points`
      },
      ...(allTilesBonus > 0 ? [{
        label: 'All Tiles Bonus',
        value: allTilesBonus,
        type: 'bonus',
        description: 'Used all tiles on final turn'
      } satisfies ScoreBreakdownItem] : []),
      { 
        label: 'Total Score', 
        value: total, 
        type: 'total',
        description: 'Sum of all points and bonuses'
      }
    ] satisfies ScoreBreakdownItem[];
  },
  
  // UI configuration
  ui: {
    showRoundTracker: true,
    allowNegativeScores: false,
    customComponents: []
  }
};

export default qwirkleUtility;
