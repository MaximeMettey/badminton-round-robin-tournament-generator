# Badminton Round-Robin Tournament Generator

This is a web application to easily create and manage round-robin style badminton tournaments (singles or doubles), with automatic match scheduling, score tracking, and real-time individual rankings.

## Features & Workflow

### 1. Tournament Setup
- Enter players: Input player names and total number of participants.
- Select mode: Choose between singles or doubles.
- Select match format: By default, matches are played to 21 points, no 2-point lead required.
- Enter number of rounds: Specify how many rounds you want to generate.
- Generate tournament: The app schedules all rounds and displays the matches.

### 2. Match & Score Management
- Each match shows the player or team names.
- Enter the score and click the validate button to save it.
- Scores can be edited at any time.
- You can add or remove players during the tournament; the schedule will adjust accordingly.

### 3. Special Rules for Match Composition
- In doubles, if two players are left without a match, they will play a singles match.
- If one player is left alone, they are on standby and cannot be on standby again in future rounds.
- Try to avoid pairing the same teammates multiple times as much as possible.
- Also aim to minimize repeated opponents to ensure varied matches.

### 4. Real-time Individual Ranking
Regardless of singles or doubles, the ranking is individual.

Points awarded per match:
- Win: 3 points
- Loss by ≤ 4 points: 2 points
- Loss by ≥ 5 points: 1 point

### 5. Leaderboard (DataTable)
Columns:
| Player | Points (Rank) | Matches Played | Wins | Total Points Scored | Avg Points / Match |

### 6. Save, Import/Export & Reset
- **Automatic save**: Tournament data is stored in the browser's LocalStorage
- **Export**: Download a JSON file of your tournament data
- **Import**: Upload a JSON file to restore a saved tournament
- **Reset**: Button to reset the tournament with confirmation

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) with SASS for custom styling
- **State Management**: React Context API with useReducer
- **Internationalization**: react-i18next (French by default)
- **Routing**: React Router DOM
- **Build Tool**: Vite

## Project Structure
```
src/
├── assets/           # Static assets
├── components/       # Reusable UI components
├── contexts/         # React contexts
├── i18n/             # Internationalization files
├── styles/           # Global styles and SASS files
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Getting Started

### Prerequisites
- Node.js (v20.19.0 or later recommended)
- npm (v9.2.0 or later)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Building for Production
```bash
npm run build
```

## Contributing
Feel free to submit issues and enhancement requests.

## License
This project is open source and available under the [MIT License](LICENSE).