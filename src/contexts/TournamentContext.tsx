import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Tournament, 
  TournamentState, 
  TournamentContextType,
  Player,
  Match
} from '../types/tournament';
import { 
  saveTournament, 
  loadTournament, 
  clearTournament, 
  exportTournamentData,
  importTournamentData 
} from '../utils/storage';
import { 
  generateRoundRobinMatches, 
  updatePlayerStats,
  calculatePlayerPoints 
} from '../utils/matchmaking';

type TournamentAction =
  | { type: 'SET_TOURNAMENT'; payload: Tournament }
  | { type: 'CREATE_TOURNAMENT'; payload: Tournament }
  | { type: 'UPDATE_SCORE'; payload: { matchId: string; playerIndex: number; score: number } }
  | { type: 'VALIDATE_MATCH'; payload: string }
  | { type: 'UPDATE_MATCH_PLAYERS'; payload: { matchId: string; players: string[] } }
  | { type: 'UPDATE_IDLE_PLAYERS'; payload: { round: number; players: string[] } }
  | { type: 'REGENERATE_ROUND'; payload: { round: number; matches: Match[]; idlePlayers: string[] } }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'REMOVE_PLAYER'; payload: string }
  | { type: 'RESET_TOURNAMENT' }
  | { type: 'NEXT_ROUND' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: TournamentState = {
  tournament: null,
  loading: false,
  error: null,
};

function tournamentReducer(state: TournamentState, action: TournamentAction): TournamentState {
  switch (action.type) {
    case 'SET_TOURNAMENT':
    case 'CREATE_TOURNAMENT':
      return {
        ...state,
        tournament: action.payload,
        loading: false,
        error: null,
      };
    
    case 'UPDATE_SCORE':
      if (!state.tournament) return state;
      
      const updatedMatches = state.tournament.matches.map(match => {
        if (match.id === action.payload.matchId) {
          const newScores = [...match.scores];
          newScores[action.payload.playerIndex] = action.payload.score;
          return { ...match, scores: newScores };
        }
        return match;
      });
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          matches: updatedMatches,
        },
      };
    
    case 'VALIDATE_MATCH':
      if (!state.tournament) return state;
      
      const matchToValidate = state.tournament.matches.find(m => m.id === action.payload);
      if (!matchToValidate) return state;
      
      // First, completely reset all affected players' stats to before the match
      let playersAfterReset = [...state.tournament.players];
      const previousMatch = state.tournament.matches.find(m => m.id === action.payload);
      
      if (previousMatch?.isCompleted) {
        // First, find all players involved in this match
        const involvedPlayerIds = new Set(previousMatch.players);
        
        // Reset all involved players' stats to before this match was played
        playersAfterReset = playersAfterReset.map(player => {
          if (!involvedPlayerIds.has(player.id)) return player;
          
          // Find all matches this player played in, except the current one being updated
          const playerMatches = state.tournament!.matches.filter(m => 
            m.isCompleted && m.id !== action.payload && m.players.includes(player.id)
          );
          
          // Recalculate player stats from scratch
          return playerMatches.reduce((acc, match) => {
            const playerIndex = match.players.indexOf(player.id);
            if (playerIndex === -1) return acc;
            
            let playerScore, opponentScore;
            if (match.isDoubles) {
              const isTeam1 = playerIndex < 2;
              playerScore = isTeam1 ? match.scores[0] : match.scores[1];
              opponentScore = isTeam1 ? match.scores[1] : match.scores[0];
            } else {
              playerScore = match.scores[playerIndex];
              opponentScore = match.scores[1 - playerIndex];
            }
            
            const isWin = playerScore > opponentScore;
            return updatePlayerStats(
              acc,
              playerScore,
              opponentScore,
              isWin
            );
          }, {
            ...player,
            points: 0,
            matchesPlayed: 0,
            wins: 0,
            totalPointsScored: 0,
            gamesPlayed: 0,
          });
        });
      }
      
      // Update match as completed
      const validatedMatches = state.tournament.matches.map(match => {
        if (match.id === action.payload) {
          return { ...match, isCompleted: true };
        }
        return match;
      });
      
      // Now apply the updated match results to the reset players
      const updatedPlayers = playersAfterReset.map(player => {
        const playerIndex = matchToValidate.players.indexOf(player.id);
        if (playerIndex === -1) return player;
        
        let playerScore, opponentScore;
        if (matchToValidate.isDoubles) {
          // For doubles, we need to handle team scores
          const isTeam1 = playerIndex < 2;
          playerScore = isTeam1 ? matchToValidate.scores[0] : matchToValidate.scores[1];
          opponentScore = isTeam1 ? matchToValidate.scores[1] : matchToValidate.scores[0];
        } else {
          playerScore = matchToValidate.scores[playerIndex];
          opponentScore = matchToValidate.scores[1 - playerIndex];
        }
        
        const isWin = playerScore > opponentScore;
        return updatePlayerStats(
          player,
          playerScore,
          opponentScore,
          isWin
        );
      });
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          matches: validatedMatches,
          players: updatedPlayers,
        },
      };
    
    case 'UPDATE_MATCH_PLAYERS':
      if (!state.tournament) return state;
      
      const matchUpdatedMatches = state.tournament.matches.map(match => {
        if (match.id === action.payload.matchId) {
          return {
            ...match,
            players: action.payload.players,
            isDoubles: action.payload.players.length === 4,
            isSingles: action.payload.players.length === 2,
            // Reset scores when players change
            scores: action.payload.players.length === 4 ? [0, 0] : [0, 0],
            isCompleted: false,
          };
        }
        return match;
      });
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          matches: matchUpdatedMatches,
        },
      };
    
    case 'UPDATE_IDLE_PLAYERS':
      if (!state.tournament) return state;
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          idleHistory: {
            ...state.tournament.idleHistory,
            [action.payload.round]: action.payload.players,
          },
        },
      };
    
    case 'REGENERATE_ROUND':
      if (!state.tournament) return state;
      
      // Remove existing matches for this round
      const filteredMatches = state.tournament.matches.filter(
        match => match.round !== action.payload.round
      );
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          matches: [...filteredMatches, ...action.payload.matches],
          idleHistory: {
            ...state.tournament.idleHistory,
            [action.payload.round]: action.payload.idlePlayers,
          },
        },
      };
    
    case 'ADD_PLAYER':
      if (!state.tournament) return state;
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          players: [...state.tournament.players, action.payload],
        },
      };
    
    case 'REMOVE_PLAYER':
      if (!state.tournament) return state;
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          players: state.tournament.players.filter(p => p.id !== action.payload),
          matches: state.tournament.matches.filter(m => !m.players.includes(action.payload)),
        },
      };
    
    case 'NEXT_ROUND':
      if (!state.tournament) return state;
      
      return {
        ...state,
        tournament: {
          ...state.tournament,
          currentRound: Math.min(state.tournament.currentRound + 1, state.tournament.totalRounds),
        },
      };
    
    case 'RESET_TOURNAMENT':
      return {
        ...state,
        tournament: null,
        error: null,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    default:
      return state;
  }
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tournamentReducer, initialState);
  
  useEffect(() => {
    const savedTournament = loadTournament();
    if (savedTournament) {
      dispatch({ type: 'SET_TOURNAMENT', payload: savedTournament });
    }
  }, []);
  
  useEffect(() => {
    if (state.tournament) {
      saveTournament(state.tournament);
    }
  }, [state.tournament]);
  
  const createTournament = (
    name: string,
    playerNames: string[],
    mode: 'singles' | 'doubles',
    totalRounds: number,
    matchFormat: { pointsToWin: number; requireTwoPointLead: boolean }
  ) => {
    const players: Player[] = playerNames.map(name => ({
      id: uuidv4(),
      name,
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      totalPointsScored: 0,
      gamesPlayed: 0,
      idleRounds: [],
    }));
    
    const { matches, idleHistory } = generateRoundRobinMatches(players, mode, totalRounds);
    
    const tournament: Tournament = {
      id: uuidv4(),
      name,
      players,
      matches,
      currentRound: 1,
      totalRounds,
      mode,
      matchFormat,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      idleHistory,
    };
    
    dispatch({ type: 'CREATE_TOURNAMENT', payload: tournament });
  };
  
  const updateScore = (matchId: string, playerIndex: number, score: number) => {
    dispatch({ type: 'UPDATE_SCORE', payload: { matchId, playerIndex, score } });
  };
  
  const validateMatch = (matchId: string) => {
    dispatch({ type: 'VALIDATE_MATCH', payload: matchId });
  };
  
  const updateMatchPlayers = (matchId: string, players: string[]) => {
    dispatch({ type: 'UPDATE_MATCH_PLAYERS', payload: { matchId, players } });
  };
  
  const updateIdlePlayers = (round: number, players: string[]) => {
    dispatch({ type: 'UPDATE_IDLE_PLAYERS', payload: { round, players } });
  };
  
  const regenerateRoundMatches = (round: number) => {
    if (!state.tournament) return;
    
    const { matches, idleHistory } = generateRoundRobinMatches(
      state.tournament.players,
      state.tournament.mode,
      1 // Generate just one round
    );
    
    // Update the round number for the generated matches
    const roundMatches = matches.map((match, index) => ({
      ...match,
      round,
      id: `match-${round}-${index + 1}`, // Ensure unique IDs
    }));
    
    dispatch({ 
      type: 'REGENERATE_ROUND', 
      payload: { 
        round, 
        matches: roundMatches, 
        idlePlayers: idleHistory[1] || [] 
      } 
    });
  };
  
  const addPlayer = (name: string) => {
    const player: Player = {
      id: uuidv4(),
      name,
      points: 0,
      matchesPlayed: 0,
      wins: 0,
      totalPointsScored: 0,
      gamesPlayed: 0,
      idleRounds: [],
    };
    dispatch({ type: 'ADD_PLAYER', payload: player });
  };
  
  const removePlayer = (playerId: string) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
  };
  
  const exportTournament = () => {
    if (state.tournament) {
      exportTournamentData(state.tournament);
    }
  };
  
  const importTournament = async (file: File) => {
    try {
      const tournament = await importTournamentData(file);
      dispatch({ type: 'SET_TOURNAMENT', payload: tournament });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import tournament' });
    }
  };
  
  const resetTournament = () => {
    clearTournament();
    dispatch({ type: 'RESET_TOURNAMENT' });
  };
  
  const nextRound = () => {
    dispatch({ type: 'NEXT_ROUND' });
  };
  
  return (
    <TournamentContext.Provider
      value={{
        state,
        createTournament,
        updateScore,
        validateMatch,
        updateMatchPlayers,
        updateIdlePlayers,
        regenerateRoundMatches,
        addPlayer,
        removePlayer,
        exportTournament,
        importTournament,
        resetTournament,
        nextRound,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}