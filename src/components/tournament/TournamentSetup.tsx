import React, { useState } from 'react';
import { Plus, Minus, Play, Users, Trophy, Upload } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTournament } from '../../contexts/TournamentContext';
import { Modal } from '../ui/Modal';

export function TournamentSetup() {
  const { createTournament, importTournament } = useTournament();
  const [tournamentName, setTournamentName] = useState('');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [mode, setMode] = useState<'singles' | 'doubles'>('singles');
  const [totalRounds, setTotalRounds] = useState(3);
  const [pointsToWin, setPointsToWin] = useState(21);
  const [requireTwoPointLead, setRequireTwoPointLead] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [fileInput, setFileInput] = useState<File | null>(null);
  
  const addPlayer = () => {
    setPlayerNames([...playerNames, '']);
  };
  
  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };
  
  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validNames = playerNames.filter(name => name.trim() !== '');
    if (validNames.length < 2) {
      alert('Please enter at least 2 players');
      return;
    }
    
    if (mode === 'doubles' && validNames.length < 4) {
      alert('Doubles mode requires at least 4 players');
      return;
    }
    
    if (!tournamentName.trim()) {
      alert('Please enter a tournament name');
      return;
    }
    
    createTournament(
      tournamentName.trim(),
      validNames,
      mode,
      totalRounds,
      { pointsToWin, requireTwoPointLead }
    );
  };

  const handleImport = async () => {
    if (fileInput) {
      try {
        await importTournament(fileInput);
        setShowImport(false);
        setFileInput(null);
      } catch (error) {
        alert('Failed to import tournament. Please make sure the file is valid.');
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-emerald-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Badminton Tournament</h1>
          </div>
          <p className="text-gray-600">Create and manage your round-robin tournament</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Tournament Name"
              value={tournamentName}
              onChange={setTournamentName}
              placeholder="Enter tournament name"
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Mode
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="singles"
                      checked={mode === 'singles'}
                      onChange={(e) => setMode(e.target.value as 'singles' | 'doubles')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <Users className="w-4 h-4 ml-2 mr-1" />
                    <span>Singles</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="doubles"
                      checked={mode === 'doubles'}
                      onChange={(e) => setMode(e.target.value as 'singles' | 'doubles')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <Users className="w-4 h-4 ml-2 mr-1" />
                    <span>Doubles</span>
                  </label>
                </div>
              </div>
              
              <Input
                label="Total Rounds"
                type="number"
                value={totalRounds}
                onChange={(val) => setTotalRounds(Math.max(1, parseInt(val) || 1))}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Points to Win"
                type="number"
                value={pointsToWin}
                onChange={(val) => setPointsToWin(Math.max(1, parseInt(val) || 21))}
                required
              />
              
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="twoPointLead"
                  checked={requireTwoPointLead}
                  onChange={(e) => setRequireTwoPointLead(e.target.checked)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="twoPointLead" className="text-sm text-gray-700">
                  Require 2-point lead
                </label>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Players ({playerNames.filter(name => name.trim() !== '').length})
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={addPlayer}
                >
                  Add Player
                </Button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {playerNames.map((name, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={name}
                      onChange={(val) => updatePlayerName(index, val)}
                      placeholder={`Player ${index + 1} name`}
                      className="flex-1"
                    />
                    {playerNames.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={Minus}
                        onClick={() => removePlayer(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col space-y-4 mt-8">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Play}
                className="w-full"
              >
                Create Tournament
              </Button>
              
              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                icon={Upload}
                onClick={() => setShowImport(true)}
                className="w-full"
              >
                Import Tournament
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import Tournament"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Tournament File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setFileInput(e.target.files?.[0] || null)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Select a previously exported tournament file (.json)
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowImport(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!fileInput}
            >
              Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}