interface LevelUpResult {
  xp: number;
  health: number;
  level: number;
  levelUpXp: number;
  levelUpHealth: number;
  totalStatePoints: number;
  leveledUp: boolean;
}

export function calculateLevelUp({
  currentXp,
  currentHp,
  xpGain,
  healthGain,
  currentLevel,
  currentLevelUpXp,
  currentLevelUpHealth,
  currentStatPoints,
}: {
  currentXp: number;
  currentHp: number;
  healthGain: number;
  xpGain: number;
  currentLevel: number;
  currentLevelUpXp: number;
  currentLevelUpHealth: number;
  currentStatPoints: number;
}): LevelUpResult {
  const xp = currentXp + xpGain;
  let level = currentLevel;
  let levelUpXp = currentLevelUpXp;
  let levelUpHealth = currentLevelUpHealth;
  let totalStatePoints = currentStatPoints;
  let leveledUp = false;
  let newHealth = currentHp + healthGain;

  while (xp >= levelUpXp) {
    level += 1;
    levelUpXp = Math.floor(levelUpXp * 1.5);
    levelUpHealth = Math.floor(levelUpHealth * 1.2);
    totalStatePoints += 5;
    leveledUp = true;
  }
  if (newHealth > levelUpHealth) {
    newHealth = levelUpHealth;
  }
  return {
    xp,
    health: newHealth,
    level,
    levelUpXp,
    levelUpHealth,
    totalStatePoints,
    leveledUp,
  };
}
