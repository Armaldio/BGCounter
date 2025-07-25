import { createGameUtility, ScoreBreakdownItem } from './utils';

type OdinScores = {
  cardsThatRestInHand: number;
};

type OdinBonuses = {
};

export default createGameUtility<OdinScores, OdinBonuses>({
  gameId: '406854',
  gameName: 'Odin (2024)',
  minPlayers: 2,
  maxPlayers: 4,
  winningCondition: 'lowest',

  modules: [
    {
      type: 'quick-controls',
      id: 'odin-quick-controls',
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
      id: 'odin-bonuses',
      bonuses: [
      ],
    },
  ],
  
  calculateFinalScore: ({ scores, bonuses }): number => {
    const cardsThatRestInHand = scores?.cardsThatRestInHand || 0;
    return cardsThatRestInHand;
  },
  
  scores: {
    cardsThatRestInHand: {
      label: 'Cards that rest in hand',
      type: 'number',
      min: 0,
      step: 1,
      calculate: ({ scores }) => scores?.cardsThatRestInHand || 0,
      defaultValue: 0
    },
  },
  
  bonuses: {
    
  },
  
  getScoreBreakdown: ({ scores, bonuses }): ScoreBreakdownItem[] => {
    const cardsThatRestInHand = scores?.cardsThatRestInHand || 0;
    const total = cardsThatRestInHand;
    
    return [
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
});