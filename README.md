# Badminton Round-Robin Tournament Generator

A modern web application for creating and managing round-robin style badminton tournaments, featuring automatic match scheduling, real-time score tracking, and individual player rankings.

![Badminton Tournament Screenshot](screenshot.png)

## ✨ Features

### 🏸 Tournament Setup
- Create tournaments for singles or doubles play
- Customize match format (points to win, win by 2 points)
- Set number of rounds
- Add/remove players at any time

### 📊 Real-time Management
- Automatic match scheduling
- Score tracking with validation
- Dynamic schedule adjustments
- Player statistics and rankings

### 🏆 Smart Match Composition
- Intelligent pairing to avoid repeated matchups
- Handles odd numbers of players with standby system
- Balances player participation
- Maintains competitive balance

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MaximeMettey/badminton-round-robin-tournament-generator.git
   cd badminton-round-robin-tournament-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

This will create a `dist` folder with the production-ready files.

## 📱 PWA Support

The app is installable as a Progressive Web App (PWA) on both desktop and mobile devices for offline use.

## 🛠 Tech Stack
- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) with SASS for custom styling
- **State Management**: React Context API with useReducer
- **Internationalization**: react-i18next (French by default)
- **Routing**: React Router DOM
- **Build Tool**: Vite

## 📁 Project Structure
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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.