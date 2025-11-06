import { Player } from '../types/tournament';

/**
 * Generate balanced matches based on player levels
 * Tries to match players with similar skill levels
 */
export function generateBalancedMatches(
  players: Player[],
  isDoubles: boolean
): string[][] {
  // Sort players by level (descending) for better balancing
  const sortedPlayers = [...players].sort((a, b) => b.level - a.level);

  const matches: string[][] = [];

  if (isDoubles) {
    // For doubles: try to balance team strengths
    // Team strength = sum of player levels
    const playerIds = sortedPlayers.map(p => p.id);
    const playersById = Object.fromEntries(sortedPlayers.map(p => [p.id, p]));

    // Snake draft approach for fair teams
    while (playerIds.length >= 4) {
      const team1Player1 = playerIds.shift()!; // Strongest
      const team2Player1 = playerIds.shift()!; // Second strongest
      const team2Player2 = playerIds.shift()!; // Third strongest
      const team1Player2 = playerIds.shift()!; // Fourth strongest

      // This creates balanced teams by pairing strong with weak
      matches.push([team1Player1, team1Player2, team2Player1, team2Player2]);
    }
  } else {
    // For singles: pair similar levels when possible
    const playerIds = sortedPlayers.map(p => p.id);

    while (playerIds.length >= 2) {
      const player1 = playerIds.shift()!;
      const player2 = playerIds.shift()!;
      matches.push([player1, player2]);
    }
  }

  return matches;
}

/**
 * Calculate match balance score (lower is better)
 * For singles: absolute difference in levels
 * For doubles: difference in team total levels
 */
export function calculateMatchBalance(
  playerIds: string[],
  playersById: { [id: string]: Player }
): number {
  const players = playerIds.map(id => playersById[id]);

  if (players.length === 2) {
    // Singles: direct level difference
    return Math.abs(players[0].level - players[1].level);
  } else if (players.length === 4) {
    // Doubles: team strength difference
    const team1Strength = players[0].level + players[1].level;
    const team2Strength = players[2].level + players[3].level;
    return Math.abs(team1Strength - team2Strength);
  }

  return 0;
}

/**
 * Get level label for display
 */
export function getLevelLabel(level: number): string {
  const labels = {
    1: 'Débutant',
    2: 'Intermédiaire',
    3: 'Confirmé',
    4: 'Avancé',
    5: 'Expert',
  };
  return labels[level as keyof typeof labels] || 'Inconnu';
}

/**
 * Get level color for UI
 */
export function getLevelColor(level: number): string {
  const colors = {
    1: 'bg-gray-100 text-gray-700 border-gray-300',
    2: 'bg-green-100 text-green-700 border-green-300',
    3: 'bg-blue-100 text-blue-700 border-blue-300',
    4: 'bg-purple-100 text-purple-700 border-purple-300',
    5: 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-700';
}
