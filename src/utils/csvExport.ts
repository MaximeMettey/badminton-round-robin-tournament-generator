import { Tournament } from '../types/tournament';

export function exportLeaderboardToCSV(tournament: Tournament): void {
  // Calculate player statistics
  const playersWithStats = tournament.players.map(player => ({
    ...player,
    avgPoints: player.matchesPlayed > 0 ? (player.totalPointsScored / player.matchesPlayed).toFixed(2) : '0.00',
    winRate: player.matchesPlayed > 0 ? ((player.wins / player.matchesPlayed) * 100).toFixed(1) + '%' : '0.0%'
  })).sort((a, b) => {
    const aAvg = parseFloat(a.avgPoints);
    const bAvg = parseFloat(b.avgPoints);
    if (aAvg !== bAvg) return bAvg - aAvg;
    return b.wins - a.wins;
  });

  // Create CSV content
  const headers = ['Rank', 'Player Name', 'Matches Played', 'Wins', 'Win Rate', 'Total Points Scored', 'Avg Points'];
  const rows = playersWithStats.map((player, index) => [
    (index + 1).toString(),
    player.name,
    player.matchesPlayed.toString(),
    player.wins.toString(),
    player.winRate,
    player.totalPointsScored.toString(),
    player.avgPoints
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${tournament.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_leaderboard.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportMatchHistoryToCSV(tournament: Tournament): void {
  const getPlayerName = (playerId: string) => {
    return tournament.players.find(p => p.id === playerId)?.name || 'Unknown';
  };

  const completedMatches = tournament.matches.filter(m => m.isCompleted);

  const headers = ['Round', 'Match Type', 'Team 1', 'Team 2', 'Score'];
  const rows = completedMatches.map(match => {
    const matchType = match.isDoubles ? 'Doubles' : 'Singles';
    let team1 = '';
    let team2 = '';

    if (match.isDoubles) {
      team1 = `${getPlayerName(match.players[0])} & ${getPlayerName(match.players[1])}`;
      team2 = `${getPlayerName(match.players[2])} & ${getPlayerName(match.players[3])}`;
    } else {
      team1 = getPlayerName(match.players[0]);
      team2 = getPlayerName(match.players[1]);
    }

    const score = `${match.scores[0]}-${match.scores[1]}`;

    return [
      match.round.toString(),
      matchType,
      team1,
      team2,
      score
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${tournament.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_matches.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
