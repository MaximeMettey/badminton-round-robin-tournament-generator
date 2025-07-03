export interface Player {
  id: string;
  name: string;
  points: number;
  matchesPlayed: number;
  wins: number;
  totalPointsScored: number;
  gamesPlayed: number;
  idleRounds: number[]; // Track which rounds this player was idle
}

export interface Match {
  id: string;
  round: number;
  players: string[]; // Player IDs
  scores: number[];
  isCompleted: boolean;
  isDoubles: boolean;
  isSingles?: boolean; // For when doubles players play singles
}

export interface Team {
  players: string[];
  score: number;
}

export interface Tournament {
  id: string;
  name: string;
  players: Player[];
  matches: Match[];
  currentRound: number;
  totalRounds: number;
  mode: 'singles' | 'doubles';
  matchFormat: {
    pointsToWin: number;
    requireTwoPointLead: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  idleHistory: { [round: number]: string[] }; // Track idle players per round
}

export interface TournamentState {
  tournament: Tournament | null;
  loading: boolean;
  error: string | null;
}

export interface TournamentContextType {
  state: TournamentState;
  createTournament: (
    name: string,
    playerNames: string[],
    mode: 'singles' | 'doubles',
    totalRounds: number,
    matchFormat: { pointsToWin: number; requireTwoPointLead: boolean }
  ) => void;
  updateScore: (matchId: string, playerIndex: number, score: number) => void;
  validateMatch: (matchId: string) => void;
  updateMatchPlayers: (matchId: string, players: string[]) => void;
  updateIdlePlayers: (round: number, players: string[]) => void;
  regenerateRoundMatches: (round: number) => void;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  exportTournament: () => void;
  importTournament: (file: File) => Promise<void>;
  resetTournament: () => void;
  nextRound: () => void;
}