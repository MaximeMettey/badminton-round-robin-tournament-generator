import { Player, Match } from '../types/tournament';

export function generateRoundRobinMatches(
  players: Player[],
  mode: 'singles' | 'doubles',
  totalRounds: number
): { matches: Match[], idleHistory: { [round: number]: string[] } } {
  const matches: Match[] = [];
  const idleHistory: { [round: number]: string[] } = {};
  let matchId = 1;

  for (let round = 1; round <= totalRounds; round++) {
    const { roundMatches, idlePlayers } = generateRoundMatches(players, mode, round, matchId, idleHistory);
    matches.push(...roundMatches);
    idleHistory[round] = idlePlayers;
    matchId += roundMatches.length;
  }

  return { matches, idleHistory };
}

function generateRoundMatches(
  players: Player[],
  mode: 'singles' | 'doubles',
  round: number,
  startingId: number,
  previousIdleHistory: { [round: number]: string[] }
): { roundMatches: Match[], idlePlayers: string[] } {
  const matches: Match[] = [];
  const idlePlayers: string[] = [];
  let matchId = startingId;

  if (mode === 'singles') {
    // Simple round-robin for singles
    const availablePlayers = [...players];
    const usedPlayers = new Set<string>();

    for (let i = 0; i < availablePlayers.length; i++) {
      for (let j = i + 1; j < availablePlayers.length; j++) {
        if (matches.length >= Math.floor(availablePlayers.length / 2)) break;
        
        const player1 = availablePlayers[i];
        const player2 = availablePlayers[j];
        
        if (!usedPlayers.has(player1.id) && !usedPlayers.has(player2.id)) {
          matches.push({
            id: `match-${matchId}`,
            round,
            players: [player1.id, player2.id],
            scores: [0, 0],
            isCompleted: false,
            isDoubles: false,
          });
          usedPlayers.add(player1.id);
          usedPlayers.add(player2.id);
          matchId++;
        }
      }
    }

    // Handle odd number of players
    if (availablePlayers.length % 2 === 1) {
      const unusedPlayer = availablePlayers.find(p => !usedPlayers.has(p.id));
      if (unusedPlayer) {
        idlePlayers.push(unusedPlayer.id);
      }
    }
  } else {
    // Doubles mode with special idle rules
    const { roundMatches, idlePlayers: doublesIdlePlayers } = generateDoublesMatches(
      players, 
      round, 
      matchId, 
      previousIdleHistory
    );
    matches.push(...roundMatches);
    idlePlayers.push(...doublesIdlePlayers);
  }

  return { roundMatches: matches, idlePlayers };
}

function generateDoublesMatches(
  players: Player[],
  round: number,
  startingId: number,
  previousIdleHistory: { [round: number]: string[] }
): { roundMatches: Match[], idlePlayers: string[] } {
  const matches: Match[] = [];
  const idlePlayers: string[] = [];
  let matchId = startingId;

  // Get all players who have been idle in previous rounds
  const allPreviousIdlePlayers = new Set<string>();
  Object.values(previousIdleHistory).forEach(roundIdlePlayers => {
    roundIdlePlayers.forEach(playerId => allPreviousIdlePlayers.add(playerId));
  });

  // Calculate optimal match distribution
  const totalPlayers = players.length;
  
  let doublesMatches = 0;
  let singlesMatches = 0;
  let idlePlayersCount = 0;
  
  // Calculate based on remainder when dividing by 4
  const remainder = totalPlayers % 4;
  const maxDoublesMatches = Math.floor(totalPlayers / 4);
  
  if (remainder === 0) {
    // Perfect for doubles only (4, 8, 12, etc.)
    doublesMatches = maxDoublesMatches;
    singlesMatches = 0;
    idlePlayersCount = 0;
  } else if (remainder === 1) {
    // 1 player left over - make them idle (5, 9, 13, etc.)
    doublesMatches = maxDoublesMatches;
    singlesMatches = 0;
    idlePlayersCount = 1;
  } else if (remainder === 2) {
    // 2 players left over - they play singles (6, 10, 14, etc.)
    doublesMatches = maxDoublesMatches;
    singlesMatches = 1;
    idlePlayersCount = 0;
  } else if (remainder === 3) {
    // 3 players left over - 2 play singles, 1 is idle (7, 11, 15, etc.)
    doublesMatches = maxDoublesMatches;
    singlesMatches = 1;
    idlePlayersCount = 1;
  }

  console.log(`Round ${round}: ${totalPlayers} players -> ${doublesMatches} doubles, ${singlesMatches} singles, ${idlePlayersCount} idle`);

  // Sort players by idle priority (those who haven't been idle should be idle first)
  const playersWithIdlePriority = players.map(player => ({
    ...player,
    hasBeenIdle: allPreviousIdlePlayers.has(player.id),
    idleCount: Object.values(previousIdleHistory).filter(roundIdle => roundIdle.includes(player.id)).length
  }));

  // For idle selection, prioritize those who haven't been idle
  const playersWhoHaventBeenIdle = playersWithIdlePriority.filter(p => !p.hasBeenIdle);
  const playersWhoHaveBeenIdle = playersWithIdlePriority.filter(p => p.hasBeenIdle);
  
  // Sort players who have been idle by their idle count (ascending)
  playersWhoHaveBeenIdle.sort((a, b) => a.idleCount - b.idleCount);
  
  // Select idle players first
  const selectedIdlePlayers: Player[] = [];
  if (idlePlayersCount > 0) {
    // Check if everyone else has been idle at least once
    const everyoneElseHasBeenIdle = players.length <= allPreviousIdlePlayers.size + idlePlayersCount;
    
    const idleCandidates = playersWhoHaventBeenIdle.length > 0 ? playersWhoHaventBeenIdle : playersWhoHaveBeenIdle;
    
    for (let i = 0; i < idlePlayersCount && i < idleCandidates.length; i++) {
      const candidate = idleCandidates[i];
      if (!candidate.hasBeenIdle || everyoneElseHasBeenIdle) {
        selectedIdlePlayers.push(candidate);
        idlePlayers.push(candidate.id);
      }
    }
  }

  // Remove idle players from available players and shuffle
  const availablePlayers = shuffleArray(
    players.filter(p => !selectedIdlePlayers.some(idle => idle.id === p.id))
  );
  
  console.log(`Available players after idle selection: ${availablePlayers.length}`);
  
  // Create doubles matches
  for (let i = 0; i < doublesMatches && availablePlayers.length >= 4; i++) {
    const team1 = availablePlayers.splice(0, 2);
    const team2 = availablePlayers.splice(0, 2);
    
    matches.push({
      id: `match-${matchId}`,
      round,
      players: [team1[0].id, team1[1].id, team2[0].id, team2[1].id],
      scores: [0, 0],
      isCompleted: false,
      isDoubles: true,
    });
    matchId++;
    console.log(`Created doubles match ${i + 1}: ${team1[0].name} & ${team1[1].name} vs ${team2[0].name} & ${team2[1].name}`);
  }
  
  // Create singles matches
  for (let i = 0; i < singlesMatches && availablePlayers.length >= 2; i++) {
    const player1 = availablePlayers.splice(0, 1)[0];
    const player2 = availablePlayers.splice(0, 1)[0];
    
    matches.push({
      id: `match-${matchId}`,
      round,
      players: [player1.id, player2.id],
      scores: [0, 0],
      isCompleted: false,
      isDoubles: false,
      isSingles: true,
    });
    matchId++;
    console.log(`Created singles match ${i + 1}: ${player1.name} vs ${player2.name}`);
  }

  console.log(`Final round ${round} result: ${matches.length} matches (${matches.filter(m => m.isDoubles).length} doubles, ${matches.filter(m => !m.isDoubles).length} singles), ${idlePlayers.length} idle players`);

  return { roundMatches: matches, idlePlayers };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function calculatePlayerPoints(
  playerScore: number,
  opponentScore: number,
  isWin: boolean
): number {
  if (isWin) {
    return 3; // Win
  } else {
    const pointDifference = Math.abs(playerScore - opponentScore);
    return pointDifference <= 4 ? 2 : 1; // Close loss vs distant loss
  }
}

export function updatePlayerStats(
  player: Player,
  playerScore: number,
  _opponentScore: number, // Keep for backward compatibility but mark as unused
  isWin: boolean
): Player {
  return {
    ...player,
    matchesPlayed: player.matchesPlayed + 1,
    wins: player.wins + (isWin ? 1 : 0),
    totalPointsScored: player.totalPointsScored + playerScore,
    gamesPlayed: player.gamesPlayed + 1,
  };
}