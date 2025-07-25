export interface BGGGame {
  id: string;
  name: string;
  thumbnail?: string;
  image?: string;
  description?: string;
  yearPublished?: number;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  minPlayTime?: number;
  maxPlayTime?: number;
  minAge?: number;
  categories?: string[];
  mechanics?: string[];
  families?: string[];
  designers?: string[];
  publishers?: string[];
  artists?: string[];
  averageRating?: number;
  bayesAverageRating?: number;
  usersRated?: number;
  rank?: number;
  complexity?: number;
}

export interface BGGSearchResult {
  id: string;
  name: string;
  yearPublished?: number;
  type: string;
}

export interface APIResponse<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export interface GameScore<TScores extends Record<string, any> = {}, TBonuses extends Record<string, any> = {}> {
  playerId: string;
  playerName: string;
  scores: TScores;
  bonuses: TBonuses;
}

export interface GameSession<TScores extends Record<string, any> = {}, TBonuses extends Record<string, any> = {}> {
  gameId: string;
  gameName: string;
  players: GameScore<TScores, TBonuses>[];
  startTime: Date;
  endTime?: Date;
}