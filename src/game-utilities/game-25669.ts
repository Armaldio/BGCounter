import type { ScoreBreakdownItem } from './utils';
import { createGameUtility, roundRobinTurnAlgorithm } from './utils';

type ScoreTypes = {
  points: number;
  qwirkles: number;
  allTiles: boolean;
};

type BonusTypes = {
  qwirkleBonus: number;
  allTilesBonus: number;
};

export default createGameUtility<ScoreTypes, BonusTypes>({
  // Core identification
  gameId: '25669',
  gameName: 'Qwirkle',
  minPlayers: 2,
  maxPlayers: 4,
  winningCondition: 'highest',
  modules: [
    {
      type: 'turn',
      id: 'qwirkle-turn',
      algorithm: roundRobinTurnAlgorithm,
    },
    {
      type: 'quick-controls',
      id: 'qwirkle-quick-controls',
      controls: [
        { label: '+1', value: 1 },
        { label: '+2', value: 2 },
        { label: '+3', value: 3 },
        { label: '+4', value: 4 },
        { label: '+5', value: 5 },
        { label: '+6', value: 6 },
        { label: '+7', value: 7 },
        { label: '+8', value: 8 },
        { label: '+9', value: 9 },
      ],
    },
    {
      type: 'bonuses',
      id: 'qwirkle-bonuses',
      bonuses: [
        
      ]
    }
  ],


  
  // Score configuration
  scores: {
    points: {
      calculate: ({ scores }) => scores?.points || 0,
      label: 'Points',
      type: 'number',
      min: 0,
      step: 1,
      defaultValue: 0
    },
    qwirkles: {
      calculate: ({ scores }) => scores?.qwirkles || 0,
      label: 'Qwirkles',
      description: 'Number of completed lines of 6 tiles',
      type: 'number',
      min: 0,
      step: 1,
      defaultValue: 0
    },
    allTiles: {
      calculate: ({ scores }) => scores?.allTiles || false,
      label: 'Used All Tiles',
      description: 'Check if player used all tiles on their last turn',
      type: 'boolean',
      defaultValue: false
    }
  } as const,
  
  // Score calculation
  calculateFinalScore: ({ scores, bonuses, definition }) => {
    console.group('calculateFinalScore');
    console.log('scores', scores);
    console.log('bonuses', bonuses);
    console.log('definition', definition);
    const breakdown = definition.getScoreBreakdown({ scores, bonuses, definition });
    console.log('breakdown', breakdown);
    const totalItem = breakdown.find(item => item.type === 'total');
    console.log('totalItem', totalItem);
    console.groupEnd();
    return totalItem ? totalItem.value : 0;
  },
  
  // Bonuses and scoring breakdown
  bonuses: {
    qwirkleBonus: {
      label: 'Qwirkle Bonus',
      description: '12 points per completed line of 6 tiles',
      calculate: ({ scores, bonuses }) => {
        console.log('scores', scores);
        console.log('bonuses', bonuses);
        return (bonuses?.qwirkleBonus || 0) * 12;
      },
      defaultValue: 0
    },
    allTilesBonus: {
      label: 'All Tiles Bonus',
      description: '6 points for using all tiles on final turn',
      calculate: ({ scores, bonuses }) => {
        console.log('scores', scores);
        console.log('bonuses', bonuses);
        return (bonuses?.allTilesBonus || 0) * 6;
      },
      defaultValue: 0
    }
  },
  
  // Score breakdown
  getScoreBreakdown: (data) => {
    const { scores, definition } = data;
    console.group('getScoreBreakdown');
    console.log('score', scores);
    console.log('definition', definition);
    console.log('bonuses', definition.bonuses);
    
    const points = definition.scores.points.calculate(data);
    console.log('points', points);
    const qwirkleBonus = definition.bonuses?.qwirkleBonus.calculate(data) || 0;
    console.log('qwirkleBonus', qwirkleBonus);
    const allTilesBonus = definition.bonuses?.allTilesBonus.calculate(data) || 0;
    console.log('allTilesBonus', allTilesBonus);
    const total = points + qwirkleBonus + allTilesBonus;
    console.log('total', total);
    console.groupEnd();
    
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
        description: qwirkleBonus ? `${qwirkleBonus / 12} Qwirkles × 12 points` : 'No Qwirkles'
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
});
