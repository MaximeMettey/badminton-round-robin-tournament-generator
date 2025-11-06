export interface MatchFormat {
  pointsToWin: number;
  requireTwoPointLead: boolean;
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
  const { pointsToWin, requireTwoPointLead } = matchFormat;

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

  // Winner must have at least pointsToWin
  if (maxScore < pointsToWin) {
    return {
      isValid: false,
      error: `Winner must have at least ${pointsToWin} points`,
    };
  }

  // If requireTwoPointLead is enabled
  if (requireTwoPointLead) {
    const scoreDiff = maxScore - minScore;

    // When score is at or above pointsToWin, must have 2-point lead
    if (maxScore >= pointsToWin && scoreDiff < 2) {
      return {
        isValid: false,
        error: 'Winner must win by at least 2 points',
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
