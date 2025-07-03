import { Tournament } from '../types/tournament';

const STORAGE_KEY = 'badminton-tournament';

export function saveTournament(tournament: Tournament): void {
  try {
    const serialized = JSON.stringify({
      ...tournament,
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    console.error('Failed to save tournament:', error);
  }
}

export function loadTournament(): Tournament | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    
    const parsed = JSON.parse(serialized);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
    };
  } catch (error) {
    console.error('Failed to load tournament:', error);
    return null;
  }
}

export function clearTournament(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportTournamentData(tournament: Tournament): void {
  const dataStr = JSON.stringify(tournament, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `tournament-${tournament.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importTournamentData(file: File): Promise<Tournament> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const tournament: Tournament = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        };
        resolve(tournament);
      } catch (error) {
        reject(new Error('Invalid tournament file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}