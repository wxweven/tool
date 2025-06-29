// 游戏数据存储工具

const STORAGE_KEY = 'gameData';

// 获取存储的游戏数据
export const getGameData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      gameRecords: {},
      gameSettings: {}
    };
  } catch (error) {
    console.error('获取游戏数据失败:', error);
    return {
      gameRecords: {},
      gameSettings: {}
    };
  }
};

// 保存游戏数据
export const saveGameData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('保存游戏数据失败:', error);
    return false;
  }
};

// 获取特定游戏的记录
export const getGameRecord = (gameId) => {
  const data = getGameData();
  return data.gameRecords[gameId] || {
    bestScore: 0,
    playCount: 0,
    totalTime: 0,
    achievements: [],
    bestMoves: 0,
    bestTime: 0
  };
};

// 保存游戏记录
export const saveGameRecord = (gameId, record) => {
  const data = getGameData();
  data.gameRecords[gameId] = {
    ...getGameRecord(gameId),
    ...record
  };
  return saveGameData(data);
};

// 获取游戏设置
export const getGameSettings = (gameId) => {
  const data = getGameData();
  return data.gameSettings[gameId] || {
    difficulty: 'medium',
    theme: 'default',
    soundEnabled: true,
    autoSave: true
  };
};

// 保存游戏设置
export const saveGameSettings = (gameId, settings) => {
  const data = getGameData();
  data.gameSettings[gameId] = {
    ...getGameSettings(gameId),
    ...settings
  };
  return saveGameData(data);
};

// 更新游戏统计
export const updateGameStats = (gameId, stats) => {
  const currentRecord = getGameRecord(gameId);
  const updatedRecord = {
    ...currentRecord,
    playCount: currentRecord.playCount + 1,
    totalTime: currentRecord.totalTime + (stats.time || 0)
  };

  // 更新最佳记录
  if (stats.score && stats.score > currentRecord.bestScore) {
    updatedRecord.bestScore = stats.score;
  }

  if (stats.moves && (currentRecord.bestMoves === 0 || stats.moves < currentRecord.bestMoves)) {
    updatedRecord.bestMoves = stats.moves;
  }

  if (stats.time && (currentRecord.bestTime === 0 || stats.time < currentRecord.bestTime)) {
    updatedRecord.bestTime = stats.time;
  }

  // 检查成就
  const newAchievements = checkAchievements(gameId, updatedRecord);
  if (newAchievements.length > 0) {
    updatedRecord.achievements = [...new Set([...currentRecord.achievements, ...newAchievements])];
  }

  return saveGameRecord(gameId, updatedRecord);
};

// 检查成就
const checkAchievements = (gameId, record) => {
  const achievements = [];

  // 通用成就
  if (record.playCount >= 10) achievements.push('游戏新手');
  if (record.playCount >= 50) achievements.push('游戏达人');
  if (record.playCount >= 100) achievements.push('游戏大师');

  // 数字华容道特定成就
  if (gameId === 'number-puzzle') {
    if (record.bestMoves > 0 && record.bestMoves <= 50) achievements.push('效率专家');
    if (record.bestTime > 0 && record.bestTime <= 60) achievements.push('速度之王');
    if (record.bestScore >= 1000) achievements.push('华容道大师');
  }

  return achievements;
};

// 清除游戏数据
export const clearGameData = (gameId = null) => {
  if (gameId) {
    const data = getGameData();
    delete data.gameRecords[gameId];
    delete data.gameSettings[gameId];
    return saveGameData(data);
  } else {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  }
}; 