import { useState } from 'react';
import { Calendar, Users, Trophy, CheckCircle2, Clock, Coffee, Edit3, Save, X, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { useTournament } from '../../contexts/TournamentContext';

export function MatchSchedule() {
  const { state, updateScore, validateMatch, updateMatchPlayers, updateIdlePlayers, regenerateRoundMatches } = useTournament();
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [viewingRound, setViewingRound] = useState<number | null>(null);
  const [tempMatchPlayers, setTempMatchPlayers] = useState<{ [matchId: string]: string[] }>({});
  const [tempIdlePlayers, setTempIdlePlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    playerId: string;
    matchId: string | 'idle';
    position: number;
  } | null>(null);
  
  if (!state.tournament) return null;
  
  const { tournament } = state;
  
  // Initialize viewingRound to currentRound if not set
  const roundToView = viewingRound !== null ? viewingRound : tournament.currentRound;
  
  const currentRoundMatches = tournament.matches.filter(
    match => match.round === roundToView
  );
  
  const currentRoundIdlePlayers = tournament.idleHistory[roundToView] || [];
  
  const getPlayerName = (playerId: string) => {
    const player = tournament.players.find(p => p.id === playerId);
    return player?.name || 'Unknown';
  };
  
  const getTeamNames = (playerIds: string[]) => {
    if (playerIds.length === 2) {
      return `${getPlayerName(playerIds[0])} vs ${getPlayerName(playerIds[1])}`;
    } else if (playerIds.length === 4) {
      return `${getPlayerName(playerIds[0])} & ${getPlayerName(playerIds[1])} vs ${getPlayerName(playerIds[2])} & ${getPlayerName(playerIds[3])}`;
    }
    return 'Invalid match';
  };
  
  const handleScoreChange = (matchId: string, teamIndex: number, score: string) => {
    const numScore = parseInt(score) || 0;
    updateScore(matchId, teamIndex, numScore);
  };
  
  const handleValidateMatch = (matchId: string) => {
    validateMatch(matchId);
    setEditingMatch(null);
    
    // If we're in a different round than the current one, update the viewing round
    if (viewingRound !== null && viewingRound !== state.tournament?.currentRound) {
      setViewingRound(state.tournament?.currentRound || viewingRound);
    }
  };
  
  const openEditModal = () => {
    setEditingRound(tournament.currentRound);
    
    // Initialize temp state with current matches
    const tempMatches: { [matchId: string]: string[] } = {};
    currentRoundMatches.forEach(match => {
      tempMatches[match.id] = [...match.players];
    });
    setTempMatchPlayers(tempMatches);
    setTempIdlePlayers([...currentRoundIdlePlayers]);
    setSelectedPlayer(null);
    setShowEditModal(true);
  };
  
  const handlePlayerClick = (playerId: string, matchId: string | 'idle', position: number) => {
    if (!selectedPlayer) {
      // First click - select player
      setSelectedPlayer({ playerId, matchId, position });
    } else {
      // Second click - perform swap
      if (selectedPlayer.playerId === playerId && selectedPlayer.matchId === matchId && selectedPlayer.position === position) {
        // Clicking the same player - deselect
        setSelectedPlayer(null);
        return;
      }
      
      // Perform the swap
      const newTempMatches = { ...tempMatchPlayers };
      const newTempIdle = [...tempIdlePlayers];
      
      // Get the two players being swapped
      const firstPlayer = selectedPlayer.playerId;
      const secondPlayer = playerId;
      
      // Update first player's position
      if (matchId === 'idle') {
        newTempIdle[position] = firstPlayer;
      } else {
        newTempMatches[matchId][position] = firstPlayer;
      }
      
      // Update second player's position
      if (selectedPlayer.matchId === 'idle') {
        newTempIdle[selectedPlayer.position] = secondPlayer;
      } else {
        newTempMatches[selectedPlayer.matchId][selectedPlayer.position] = secondPlayer;
      }
      
      setTempMatchPlayers(newTempMatches);
      setTempIdlePlayers(newTempIdle);
      setSelectedPlayer(null);
    }
  };
  
  const saveMatchChanges = () => {
    if (editingRound === null) return;
    
    // Update matches
    Object.entries(tempMatchPlayers).forEach(([matchId, players]) => {
      updateMatchPlayers(matchId, players);
    });
    
    // Update idle players for this round
    updateIdlePlayers(editingRound, tempIdlePlayers);
    
    setShowEditModal(false);
    setEditingRound(null);
    setSelectedPlayer(null);
  };
  
  const regenerateRound = () => {
    if (confirm('Are you sure you want to regenerate this round? This will create new random matches and reset any scores.')) {
      regenerateRoundMatches(tournament.currentRound);
    }
  };
  
  const isPlayerSelected = (playerId: string, matchId: string | 'idle', position: number) => {
    return selectedPlayer?.playerId === playerId && 
           selectedPlayer?.matchId === matchId && 
           selectedPlayer?.position === position;
  };
  
  const completedMatches = currentRoundMatches.filter(match => match.isCompleted).length;
  const totalMatches = currentRoundMatches.length;
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Round {roundToView} of {tournament.totalRounds}
              {roundToView < tournament.currentRound && ' (Completed)'}
              {roundToView > tournament.currentRound && ' (Upcoming)'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingRound(Math.max(1, roundToView - 1))}
                disabled={roundToView === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <select
                value={roundToView}
                onChange={(e) => setViewingRound(Number(e.target.value))}
                className="rounded-md border-gray-300 py-1.5 text-sm text-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
              >
                {Array.from({ length: tournament.totalRounds }, (_, i) => i + 1).map((round) => (
                  <option key={round} value={round}>
                    Round {round}
                  </option>
                ))}
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingRound(Math.min(tournament.totalRounds, roundToView + 1))}
                disabled={roundToView === tournament.totalRounds}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {roundToView === tournament.currentRound && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                  onClick={openEditModal}
                >
                  Edit Round
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={RotateCcw}
                  onClick={regenerateRound}
                >
                  Regenerate
                </Button>
              </>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4" />
              <span>{completedMatches} / {totalMatches} matches completed</span>
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0}%` }}
          />
        </div>
        
        {/* Idle Players Section */}
        {currentRoundIdlePlayers.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Idle Players</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentRoundIdlePlayers.map(playerId => (
                <span
                  key={playerId}
                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                >
                  {getPlayerName(playerId)}
                </span>
              ))}
            </div>
            <p className="text-sm text-amber-700 mt-2">
              {currentRoundIdlePlayers.length === 1 
                ? 'This player is taking a break this round.'
                : 'These players are taking a break this round.'
              }
            </p>
          </div>
        )}
        
        <div className="grid gap-4">
          {currentRoundMatches.map((match) => (
            <div
              key={match.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                match.isCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {getTeamNames(match.players)}
                  </span>
                  {match.isSingles && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Singles
                    </span>
                  )}
                  {match.isDoubles && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Doubles
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {match.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {match.isDoubles ? 'Team 1' : getPlayerName(match.players[0])}:
                    </span>
                    <Input
                      type="number"
                      value={match.scores[0]}
                      onChange={(val) => handleScoreChange(match.id, 0, val)}
                      disabled={match.isCompleted && editingMatch !== match.id}
                      className="w-16"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {match.isDoubles ? 'Team 2' : getPlayerName(match.players[1])}:
                    </span>
                    <Input
                      type="number"
                      value={match.scores[1]}
                      onChange={(val) => handleScoreChange(match.id, 1, val)}
                      disabled={match.isCompleted && editingMatch !== match.id}
                      className="w-16"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {match.isCompleted && editingMatch !== match.id ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMatch(match.id)}
                    >
                      Edit
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleValidateMatch(match.id)}
                        disabled={match.scores[0] === 0 && match.scores[1] === 0}
                      >
                        {match.isCompleted ? 'Save' : 'Validate'}
                      </Button>
                      {match.isCompleted && editingMatch === match.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingMatch(null)}
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {currentRoundMatches.length === 0 && currentRoundIdlePlayers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No matches scheduled for this round
          </div>
        )}
      </div>
      
      {/* Edit Round Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPlayer(null);
        }}
        title={`Edit Round ${editingRound} Matches`}
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">How to Edit Matches</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Click on any player name to select them (highlighted in green)</li>
              <li>• Click on another player to swap their positions</li>
              <li>• You can move players between matches or to/from idle</li>
              <li>• Doubles matches need 4 players, singles need 2</li>
              <li>• Click the same player again to deselect</li>
            </ul>
            {selectedPlayer && (
              <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                <strong>Selected:</strong> {getPlayerName(selectedPlayer.playerId)} 
                {selectedPlayer.matchId === 'idle' ? ' (Idle)' : ' (Match)'}
              </div>
            )}
          </div>
          
          {/* Idle Players */}
          {tempIdlePlayers.length > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-3">Idle Players</h4>
              <div className="flex flex-wrap gap-2">
                {tempIdlePlayers.map((playerId, index) => (
                  <button
                    key={`idle-${index}`}
                    className={`px-3 py-2 text-amber-800 rounded-lg text-sm font-medium transition-all border-2 ${
                      isPlayerSelected(playerId, 'idle', index)
                        ? 'bg-green-200 border-green-400 shadow-md'
                        : 'bg-amber-100 hover:bg-amber-200 border-transparent hover:border-amber-300'
                    }`}
                    onClick={() => handlePlayerClick(playerId, 'idle', index)}
                  >
                    {getPlayerName(playerId)}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Matches */}
          <div className="space-y-4">
            {Object.entries(tempMatchPlayers).map(([matchId, players]) => {
              const isDoubles = players.length === 4;
              
              return (
                <div key={matchId} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">
                      {isDoubles ? 'Doubles Match' : 'Singles Match'}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isDoubles ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isDoubles ? 'Doubles' : 'Singles'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-600">
                        {isDoubles ? 'Team 1' : 'Player 1'}
                      </h5>
                      <div className="space-y-1">
                        {(isDoubles ? players.slice(0, 2) : players.slice(0, 1)).map((playerId, index) => (
                          <button
                            key={`${matchId}-team1-${index}`}
                            className={`w-full px-3 py-2 text-gray-800 rounded border-2 transition-all text-left ${
                              isPlayerSelected(playerId, matchId, index)
                                ? 'bg-green-100 border-green-400 shadow-md'
                                : 'bg-white hover:bg-emerald-50 border-transparent hover:border-emerald-200'
                            }`}
                            onClick={() => handlePlayerClick(playerId, matchId, index)}
                          >
                            {getPlayerName(playerId)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-600">
                        {isDoubles ? 'Team 2' : 'Player 2'}
                      </h5>
                      <div className="space-y-1">
                        {(isDoubles ? players.slice(2, 4) : players.slice(1, 2)).map((playerId, index) => {
                          const actualIndex = isDoubles ? index + 2 : index + 1;
                          return (
                            <button
                              key={`${matchId}-team2-${index}`}
                              className={`w-full px-3 py-2 text-gray-800 rounded border-2 transition-all text-left ${
                                isPlayerSelected(playerId, matchId, actualIndex)
                                  ? 'bg-green-100 border-green-400 shadow-md'
                                  : 'bg-white hover:bg-emerald-50 border-transparent hover:border-emerald-200'
                              }`}
                              onClick={() => handlePlayerClick(playerId, matchId, actualIndex)}
                            >
                              {getPlayerName(playerId)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              icon={X}
              onClick={() => {
                setShowEditModal(false);
                setSelectedPlayer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Save}
              onClick={saveMatchChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}