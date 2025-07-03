import React from 'react';
import { TournamentProvider, useTournament } from './contexts/TournamentContext';
import { TournamentSetup } from './components/tournament/TournamentSetup';
import { TournamentDashboard } from './components/tournament/TournamentDashboard';

function AppContent() {
  const { state } = useTournament();
  
  if (!state.tournament) {
    return <TournamentSetup />;
  }
  
  return <TournamentDashboard />;
}

function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}

export default App;