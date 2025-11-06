import { useState } from 'react';
import {
  Trophy,
  Calendar,
  Download,
  RotateCcw,
  Settings,
  Plus,
  Minus,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTournament } from '../../contexts/TournamentContext';
import { useToast } from '../../contexts/ToastContext';
import { MatchSchedule } from './MatchSchedule';
import { Leaderboard } from './Leaderboard';
import { exportLeaderboardToCSV, exportMatchHistoryToCSV } from '../../utils/csvExport';

export function TournamentDashboard() {
  const {
    state,
    addPlayer,
    removePlayer,
    exportTournament,
    resetTournament,
    nextRound
  } = useTournament();
  const { showSuccess } = useToast();
  
  const [activeTab, setActiveTab] = useState<'matches' | 'leaderboard'>('matches');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  
  if (!state.tournament) return null;
  
  const { tournament } = state;
  
  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset the tournament? This action cannot be undone.')) {
      resetTournament();
    }
  };

  const handleExportCSVLeaderboard = () => {
    exportLeaderboardToCSV(tournament);
    showSuccess('Leaderboard exported to CSV successfully!');
  };

  const handleExportCSVMatches = () => {
    exportMatchHistoryToCSV(tournament);
    showSuccess('Match history exported to CSV successfully!');
  };
  
  const canAdvanceRound = () => {
    const currentRoundMatches = tournament.matches.filter(
      match => match.round === tournament.currentRound
    );
    return currentRoundMatches.every(match => match.isCompleted);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Trophy className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tournament.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {tournament.mode === 'singles' ? 'Singles' : 'Doubles'} Tournament • {tournament.players.length} players
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                icon={Settings}
                onClick={() => setShowSettings(true)}
              >
                Settings
              </Button>

              {tournament.currentRound < tournament.totalRounds && canAdvanceRound() && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                  onClick={nextRound}
                >
                  Next Round
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'matches'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Matches</span>
          </button>
          
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>
        </div>
        
        {/* Content */}
        {activeTab === 'matches' && <MatchSchedule />}
        {activeTab === 'leaderboard' && <Leaderboard />}
        
        {/* Settings Modal */}
        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="Tournament Settings"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Export Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={exportTournament}
                  className="w-full"
                >
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  icon={FileText}
                  onClick={handleExportCSVLeaderboard}
                  className="w-full"
                >
                  Export Leaderboard CSV
                </Button>
                <Button
                  variant="outline"
                  icon={FileText}
                  onClick={handleExportCSVMatches}
                  className="w-full"
                >
                  Export Matches CSV
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tournament Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  icon={Plus}
                  onClick={() => setShowAddPlayer(true)}
                  className="w-full"
                >
                  Add Player
                </Button>
                <Button
                  variant="error"
                  icon={RotateCcw}
                  onClick={handleReset}
                  className="w-full"
                >
                  Reset Tournament
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Current Players</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tournament.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{player.name}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Minus}
                      onClick={() => removePlayer(player.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
        
        {/* Add Player Modal */}
        <Modal
          isOpen={showAddPlayer}
          onClose={() => setShowAddPlayer(false)}
          title="Add New Player"
        >
          <div className="space-y-4">
            <Input
              label="Player Name"
              value={newPlayerName}
              onChange={setNewPlayerName}
              placeholder="Enter player name"
              required
            />
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddPlayer(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
              >
                Add Player
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}