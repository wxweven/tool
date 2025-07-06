import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Lightbulb, RotateCcw, Trophy, Clock, Move } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import GameContainer from '../../components/GameContainer';
import { getGameRecord, saveGameRecord, updateGameStats } from '../../utils/gameStorage';
import { formatTime, shuffleArray, isArraySorted } from '../../utils/gameUtils';

const NumberPuzzle = () => {
  const [board, setBoard] = useState([]);
  const [size, setSize] = useState(3);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [gameRecord, setGameRecord] = useState({});
  const [timer, setTimer] = useState(null);
  const { toast } = useToast();

  // 初始化游戏记录
  useEffect(() => {
    const record = getGameRecord('number-puzzle');
    setGameRecord(record);
    // 自动开始游戏
    initializeGame();
  }, []);

  // 生成目标状态
  const generateTargetState = useCallback((size) => {
    const total = size * size;
    const target = [];
    for (let i = 1; i < total; i++) {
      target.push(i);
    }
    target.push(0); // 空白格
    return target;
  }, []);

  // 检查是否可解
  const isSolvable = useCallback((puzzle) => {
    const size = Math.sqrt(puzzle.length);
    let inversions = 0;
    
    for (let i = 0; i < puzzle.length - 1; i++) {
      for (let j = i + 1; j < puzzle.length; j++) {
        if (puzzle[i] !== 0 && puzzle[j] !== 0 && puzzle[i] > puzzle[j]) {
          inversions++;
        }
      }
    }
    
    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(puzzle.indexOf(0) / size);
      return (inversions + emptyRow) % 2 === 0;
    }
  }, []);

  // 生成可解的打乱状态
  const generateShuffledState = useCallback((size) => {
    const target = generateTargetState(size);
    let shuffled;
    
    do {
      shuffled = shuffleArray(target);
    } while (!isSolvable(shuffled) || isArraySorted(shuffled));
    
    return shuffled;
  }, [generateTargetState, isSolvable]);

  // 初始化游戏
  const initializeGame = useCallback((newSize = size) => {
    const shuffledState = generateShuffledState(newSize);
    setBoard(shuffledState);
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setIsCompleted(false);
    setShowHint(false);
    setSize(newSize);
  }, [size, generateShuffledState]);

  // 开始计时器
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      const interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isCompleted]);

  // 检查游戏是否完成
  useEffect(() => {
    if (isPlaying && board.length > 0) {
      const target = generateTargetState(size);
      if (JSON.stringify(board) === JSON.stringify(target)) {
        setIsCompleted(true);
        setIsPlaying(false);
        
        // 保存游戏记录
        const stats = {
          score: Math.max(0, 1000 - moves * 10 - time * 2),
          moves,
          time
        };
        updateGameStats('number-puzzle', stats);
        
        // 更新本地记录
        const newRecord = getGameRecord('number-puzzle');
        setGameRecord(newRecord);
      }
    }
  }, [board, isPlaying, size, moves, time, generateTargetState]);

  // 移动方块
  const moveTile = useCallback((index) => {
    if (!isPlaying || isCompleted) return;

    const emptyIndex = board.indexOf(0);
    const size = Math.sqrt(board.length);
    
    // 检查是否可以移动
    const canMove = (
      (index === emptyIndex - 1 && index % size !== size - 1) || // 右
      (index === emptyIndex + 1 && index % size !== 0) || // 左
      (index === emptyIndex - size) || // 下
      (index === emptyIndex + size) // 上
    );

    if (canMove) {
      const newBoard = [...board];
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      setBoard(newBoard);
      setMoves(prev => prev + 1);
    }
  }, [board, isPlaying, isCompleted]);

  // 获取提示
  const getHint = useCallback(() => {
    if (!isPlaying || isCompleted) return;
    
    // 找到空白位置
    const emptyIndex = board.indexOf(0);
    const size = Math.sqrt(board.length);
    
    // 找到可以移动到空白位置的方块
    const movableTiles = [];
    const directions = [
      { dx: -1, dy: 0, name: '左' },  // 左
      { dx: 1, dy: 0, name: '右' },   // 右
      { dx: 0, dy: -1, name: '上' },  // 上
      { dx: 0, dy: 1, name: '下' }    // 下
    ];
    
    directions.forEach(({ dx, dy, name }) => {
      const newX = (emptyIndex % size) + dx;
      const newY = Math.floor(emptyIndex / size) + dy;
      
      if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
        const newIndex = newY * size + newX;
        const target = generateTargetState(size);
        
        // 检查移动这个方块是否有意义（是否更接近目标状态）
        const currentValue = board[newIndex];
        const targetValue = target[newIndex];
        
        // 如果这个方块不在正确位置，移动它可能有用
        if (currentValue !== targetValue && currentValue !== 0) {
          movableTiles.push({
            index: newIndex,
            value: currentValue,
            direction: name,
            priority: Math.abs(currentValue - targetValue) // 优先级：距离目标位置越远优先级越高
          });
        }
      }
    });
    
    // 按优先级排序，选择最有用的移动
    movableTiles.sort((a, b) => b.priority - a.priority);
    
    if (movableTiles.length > 0) {
      const bestMove = movableTiles[0];
      setShowHint(true);
      
      // 显示提示信息
      const hintMessage = `建议移动数字 ${bestMove.value}（${bestMove.direction}方向）`;
      
      // 使用 toast 显示提示
      toast({
        title: "提示",
        description: hintMessage,
        duration: 2000
      });
      
      // 2秒后关闭提示
      setTimeout(() => {
        setShowHint(false);
      }, 2000);
    } else {
      // 如果没有明显的移动，显示一般性提示
      setShowHint(true);
      toast({
        title: "提示",
        description: '尝试将数字移动到空白位置，目标是按顺序排列',
        duration: 2000
      });
      
      // 2秒后关闭提示
      setTimeout(() => {
        setShowHint(false);
      }, 2000);
    }
  }, [board, isPlaying, isCompleted, size, generateTargetState, toast]);

  // 重新开始
  const handleReset = () => {
    if (timer) clearInterval(timer);
    initializeGame();
  };

  // 测试示例
  const handleTest = () => {
    // 创建一个简单的3x3测试用例
    setSize(3);
    setBoard([1, 2, 3, 4, 0, 6, 7, 5, 8]); // 接近完成的状态
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setIsCompleted(false);
    setShowHint(false);
  };

  // 渲染方块
  const renderTile = (value, index) => {
    if (value === 0) {
      return (
        <div 
          key={index}
          className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold text-lg cursor-default relative"
        >
          {showHint && index === board.indexOf(0) && (
            <div className="absolute inset-0 bg-blue-200 rounded-lg opacity-50 animate-pulse" />
          )}
        </div>
      );
    }

    // 检查这个方块是否可以移动
    const emptyIndex = board.indexOf(0);
    const size = Math.sqrt(board.length);
    const canMove = (
      (index === emptyIndex - 1 && index % size !== size - 1) || // 右
      (index === emptyIndex + 1 && index % size !== 0) || // 左
      (index === emptyIndex - size) || // 下
      (index === emptyIndex + size) // 上
    );

    return (
      <button
        key={index}
        onClick={() => moveTile(index)}
        className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
          showHint && canMove
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {value}
      </button>
    );
  };

  // 渲染游戏统计
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Move className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">步数</span>
        </div>
        <div className="text-2xl font-bold text-blue-600">{moves}</div>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">时间</span>
        </div>
        <div className="text-2xl font-bold text-green-600">{formatTime(time)}</div>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-gray-600">最佳步数</span>
        </div>
        <div className="text-2xl font-bold text-yellow-600">
          {gameRecord.bestMoves || '-'}
        </div>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-gray-600">最佳时间</span>
        </div>
        <div className="text-2xl font-bold text-purple-600">
          {gameRecord.bestTime ? formatTime(gameRecord.bestTime) : '-'}
        </div>
      </div>
    </div>
  );

  // 渲染成就
  const renderAchievements = () => {
    if (!gameRecord.achievements || gameRecord.achievements.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">成就</h3>
        <div className="flex flex-wrap gap-2">
          {gameRecord.achievements.map((achievement, index) => (
            <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
              {achievement}
            </Badge>
          ))}
        </div>
      </div>
    );
  };

  return (
    <GameContainer
      description="经典的滑块拼图游戏，将数字按顺序排列完成挑战"
      onReset={handleReset}
      onTest={handleTest}
      stats={renderStats()}
    >
      {/* 游戏控制 */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={size.toString()} onValueChange={(value) => initializeGame(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3×3</SelectItem>
              <SelectItem value="4">4×4</SelectItem>
              <SelectItem value="5">5×5</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={getHint}
            disabled={!isPlaying || isCompleted}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            提示
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            重新开始
          </Button>
        </div>
        
        <div className="text-sm text-gray-600">
          游戏次数: {gameRecord.playCount || 0}
        </div>
      </div>

      {/* 游戏完成提示 */}
      {isCompleted && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            🎉 恭喜！您成功完成了 {size}×{size} 的数字华容道！
            <br />
            用时: {formatTime(time)} | 步数: {moves}
          </AlertDescription>
        </Alert>
      )}

      {/* 游戏棋盘 */}
      <div className="flex justify-center mb-6">
        <div 
          className="grid gap-2 p-4 bg-gray-100 rounded-xl shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`
          }}
        >
          {board.map((value, index) => renderTile(value, index))}
        </div>
      </div>

      {/* 游戏进度 */}
      {isPlaying && !isCompleted && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>游戏进度</span>
            <span>{Math.round((moves / (size * size * 10)) * 100)}%</span>
          </div>
          <Progress value={Math.min((moves / (size * size * 10)) * 100, 100)} className="h-2" />
        </div>
      )}

      {/* 成就展示 */}
      {renderAchievements()}

      {/* 游戏说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>游戏说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• 点击数字方块可以将其移动到空白位置</p>
          <p>• 目标是将数字按 1, 2, 3... 的顺序排列</p>
          <p>• 使用提示功能可以获得帮助</p>
          <p>• 游戏会自动保存您的记录</p>
        </CardContent>
      </Card>
    </GameContainer>
  );
};

export default NumberPuzzle; 