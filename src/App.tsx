import React from 'react';
import { TournamentProvider, useTournament } from './contexts/TournamentContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
    <ThemeProvider>
      <ToastProvider>
        <TournamentProvider>
          <AppContent />
        </TournamentProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;