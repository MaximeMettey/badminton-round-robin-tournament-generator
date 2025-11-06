export interface MatchFormat {
  pointsToWin: number;
  requireTwoPointLead: boolean;
  maxDeuceScore?: number; // Optional: max score when playing with deuce
}

export interface ScoreValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateMatchScore(
  score1: number,
  score2: number,
  matchFormat: MatchFormat
): ScoreValidationResult {
  const { pointsToWin, requireTwoPointLead, maxDeuceScore } = matchFormat;

  // Check for negative scores
  if (score1 < 0 || score2 < 0) {
    return {
      isValid: false,
      error: 'Scores cannot be negative',
    };
  }

  // Check for 0-0
  if (score1 === 0 && score2 === 0) {
    return {
      isValid: false,
      error: 'Both scores cannot be zero',
    };
  }

  // Determine winner
  const maxScore = Math.max(score1, score2);
  const minScore = Math.min(score1, score2);
  const scoreDiff = maxScore - minScore;

  // Winner must have at least pointsToWin
  if (maxScore < pointsToWin) {
    return {
      isValid: false,
      error: `Winner must have at least ${pointsToWin} points`,
    };
  }

  // If requireTwoPointLead is enabled
  if (requireTwoPointLead) {
    // Check if max deuce score is exceeded
    if (maxDeuceScore && maxScore > maxDeuceScore) {
      return {
        isValid: false,
        error: `Maximum score is ${maxDeuceScore} (deuce limit)`,
      };
    }

    // When score is at or above pointsToWin, must have EXACTLY 2-point lead
    if (maxScore >= pointsToWin && scoreDiff !== 2) {
      // Special case: if we've reached maxDeuceScore, allow 1 point difference
      if (maxDeuceScore && maxScore === maxDeuceScore && scoreDiff === 1) {
        return { isValid: true };
      }

      return {
        isValid: false,
        error: scoreDiff < 2
          ? 'Winner must win by exactly 2 points'
          : 'Winner can only win by exactly 2 points in deuce',
      };
    }
  } else {
    // Without two-point lead requirement, can't have tied score
    if (score1 === score2) {
      return {
        isValid: false,
        error: 'Match cannot end in a tie',
      };
    }
  }

  return { isValid: true };
}

/**
 * Normalize scores for leaderboard statistics
 * Caps scores at pointsToWin to avoid advantage from extended matches
 * Example: 26-24 with pointsToWin=21 → 21-19
 */
export function normalizeScoreForStats(
  playerScore: number,
  opponentScore: number,
  matchFormat: MatchFormat
): { normalizedPlayerScore: number; normalizedOpponentScore: number } {
  const { pointsToWin } = matchFormat;
  const isWinner = playerScore > opponentScore;
  const maxScore = Math.max(playerScore, opponentScore);
  const minScore = Math.min(playerScore, opponentScore);

  // If match ended at exactly pointsToWin or below, no normalization needed
  if (maxScore <= pointsToWin) {
    return {
      normalizedPlayerScore: playerScore,
      normalizedOpponentScore: opponentScore,
    };
  }

  // Calculate how much over pointsToWin the winner went
  const overage = maxScore - pointsToWin;

  // Normalize: cap winner at pointsToWin, reduce loser by same overage
  const normalizedMaxScore = pointsToWin;
  const normalizedMinScore = Math.max(0, minScore - overage);

  return {
    normalizedPlayerScore: isWinner ? normalizedMaxScore : normalizedMinScore,
    normalizedOpponentScore: isWinner ? normalizedMinScore : normalizedMaxScore,
  };
}
