import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useTournament } from '../../contexts/TournamentContext';

export function Leaderboard() {
  const { state } = useTournament();
  
  if (!state.tournament) return null;
  
  const { tournament } = state;
  
  // Sort players by average points per match (descending), then by wins
  const sortedPlayers = [...tournament.players].map(player => ({
    ...player,
    avgPoints: player.matchesPlayed > 0 ? player.totalPointsScored / player.matchesPlayed : 0
  })).sort((a, b) => {
    if (a.avgPoints !== b.avgPoints) return b.avgPoints - a.avgPoints;
    if (a.wins !== b.wins) return b.wins - a.wins;
    return 0;
  });
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500">#{rank}</span>;
    }
  };
  
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Rank</th>
              <th className="text-left py-3 px-2 font-semibold text-gray-700">Player</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Matches</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Wins</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Total Scored</th>
              <th className="text-center py-3 px-2 font-semibold text-gray-700">Avg Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              
              return (
                <tr
                  key={player.id}
                  className={`border-b border-gray-100 ${getRankColor(rank)} transition-all duration-200 hover:shadow-md`}
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(rank)}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-medium text-gray-900">{player.name}</div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="text-gray-700">{player.matchesPlayed}</div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="text-gray-700">{player.wins}</div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="text-gray-700">{player.totalPointsScored}</div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="font-bold text-emerald-600">{player.avgPoints.toFixed(1)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {sortedPlayers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No players in the tournament yet
        </div>
      )}
      
      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
        <h3 className="font-semibold text-emerald-800 mb-2">Ranking System</h3>
        <div className="text-sm text-emerald-700 space-y-1">
          <div>• Players are ranked by average points per match</div>
          <div>• In case of a tie, player with more wins is ranked higher</div>
        </div>
      </div>
    </div>
  );
}