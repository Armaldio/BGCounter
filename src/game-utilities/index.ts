
// Import game-specific utilities
import { splendorUtility } from './game-174430';
import { wingspanUtility } from './game-266192';
import odinUtility from './game-406854';
import qwirkleUtility from './game-25669';
import { GameUtility } from './utils';

// Map of game IDs to their respective utilities
export const gameUtilities = {
  '174430': splendorUtility,
  '266192': wingspanUtility,
  '406854': odinUtility,
  '25669': qwirkleUtility
};

export type GameUtilities = typeof gameUtilities;
export type GameUtilityKey = keyof GameUtilities;


export function hasGameUtility(gameId: GameUtilityKey): boolean {
  return gameId in gameUtilities;
}

export function getGameUtility(gameId: GameUtilityKey): GameUtility<any, any> | undefined {
  return gameUtilities[gameId];
}