import React, { useState } from 'react';
import { Plus, Minus, Play, Users, Trophy, Upload, List, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTournament } from '../../contexts/TournamentContext';
import { useToast } from '../../contexts/ToastContext';
import { Modal } from '../ui/Modal';

export function TournamentSetup() {
  const { createTournament, importTournament } = useTournament();
  const { showError, showSuccess } = useToast();
  const [tournamentName, setTournamentName] = useState('');
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [playerLevels, setPlayerLevels] = useState<number[]>([3, 3]);
  const [mode, setMode] = useState<'singles' | 'doubles'>('singles');
  const [totalRounds, setTotalRounds] = useState(3);
  const [pointsToWin, setPointsToWin] = useState(21);
  const [requireTwoPointLead, setRequireTwoPointLead] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  
  const addPlayer = () => {
    setPlayerNames([...playerNames, '']);
    setPlayerLevels([...playerLevels, 3]); // Default level 3
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
      setPlayerLevels(playerLevels.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const updatePlayerLevel = (index: number, level: number) => {
    const updated = [...playerLevels];
    updated[index] = level;
    setPlayerLevels(updated);
  };

  const handleBulkImport = () => {
    const names = bulkInput
      .split('\n')
      .map(name => name.trim())
      .filter(name => name !== '');

    if (names.length === 0) {
      showError('Please enter at least one player name');
      return;
    }

    // Remove duplicates
    const uniqueNames = Array.from(new Set(names));

    if (uniqueNames.length !== names.length) {
      showError(`Removed ${names.length - uniqueNames.length} duplicate name(s)`);
    }

    setPlayerNames(uniqueNames);
    setPlayerLevels(uniqueNames.map(() => 3)); // Default all to level 3
    setBulkInput('');
    setShowBulkInput(false);
    showSuccess(`Added ${uniqueNames.length} player(s) successfully!`);
  };

  const clearAllPlayers = () => {
    setPlayerNames(['', '']);
    setPlayerLevels([3, 3]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validNames = playerNames.filter(name => name.trim() !== '');
    if (validNames.length < 2) {
      showError('Please enter at least 2 players');
      return;
    }

    if (mode === 'doubles' && validNames.length < 4) {
      showError('Doubles mode requires at least 4 players');
      return;
    }

    if (!tournamentName.trim()) {
      showError('Please enter a tournament name');
      return;
    }

    // Filter levels to match valid names
    const validLevels = playerNames
      .map((name, index) => ({ name, level: playerLevels[index] || 3 }))
      .filter(item => item.name.trim() !== '')
      .map(item => item.level);

    createTournament(
      tournamentName.trim(),
      validNames,
      validLevels,
      mode,
      totalRounds,
      { pointsToWin, requireTwoPointLead }
    );
    showSuccess('Tournament created successfully!');
  };

  const handleImport = async () => {
    if (fileInput) {
      try {
        await importTournament(fileInput);
        setShowImport(false);
        setFileInput(null);
        showSuccess('Tournament imported successfully!');
      } catch (error) {
        showError('Failed to import tournament. Please make sure the file is valid.');
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
                  Players <span className="text-emerald-600 font-bold">({playerNames.filter(name => name.trim() !== '').length})</span>
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={List}
                    onClick={() => setShowBulkInput(true)}
                  >
                    Bulk Import
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    onClick={addPlayer}
                  >
                    Add One
                  </Button>
                  {playerNames.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={clearAllPlayers}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              {/* Player Grid */}
              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto p-2 bg-gray-50 rounded-lg border-2 border-gray-200">
                {playerNames.map((name, index) => (
                  <div key={index} className="bg-white p-3 rounded-md shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                      <Input
                        value={name}
                        onChange={(val) => updatePlayerName(index, val)}
                        placeholder={`Player ${index + 1} name`}
                        className="flex-1"
                      />
                      {playerNames.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePlayer(index)}
                          className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                          aria-label="Remove player"
                        >
                          <Minus className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <label className="text-xs font-medium text-gray-600 w-12">Level:</label>
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => updatePlayerLevel(index, level)}
                            className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition-all border-2 ${
                              playerLevels[index] === level
                                ? 'bg-emerald-600 text-white border-emerald-600 scale-110'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
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

      {/* Bulk Import Modal */}
      <Modal
        isOpen={showBulkInput}
        onClose={() => setShowBulkInput(false)}
        title="Bulk Import Players"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">How to use</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Enter one player name per line</li>
              <li>• Empty lines will be ignored</li>
              <li>• Duplicate names will be automatically removed</li>
              <li>• This will replace your current player list</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Names (one per line)
            </label>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Alice&#10;Bob&#10;Charlie&#10;Diana"
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              {bulkInput.split('\n').filter(name => name.trim() !== '').length} player(s) detected
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setBulkInput('');
                setShowBulkInput(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkImport}
              disabled={bulkInput.trim() === ''}
            >
              Import Players
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}