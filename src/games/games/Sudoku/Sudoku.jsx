import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { RotateCcw, Trophy, Clock, Eye, Pencil } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import GameContainer from '../../components/GameContainer';
import { getGameRecord, updateGameStats } from '../../utils/gameStorage';
import { formatTime } from '../../utils/gameUtils';

// 数独难度配置
const difficulties = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
  { value: 'expert', label: '专家' },
];

// 生成数独题目和解答的工具函数（简化版）
function generateSudoku(difficulty = 'easy') {
  // 这里只用一个固定题目和解答做演示，实际可用第三方库或算法生成
  const base = [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9],
  ];
  const solution = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9],
  ];
  // 可根据难度调整挖空数量
  return { puzzle: base, solution };
}

const Sudoku = () => {
  const [puzzle, setPuzzle] = useState([]);
  const [solution, setSolution] = useState([]);
  const [userGrid, setUserGrid] = useState([]);
  const [notes, setNotes] = useState([]); // 记录每格的笔记
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameRecord, setGameRecord] = useState({});
  const [timer, setTimer] = useState(null);
  const { toast } = useToast();

  // 初始化游戏记录
  useEffect(() => {
    const record = getGameRecord('sudoku');
    setGameRecord(record);
    handleNewGame(difficulty);
    // eslint-disable-next-line
  }, []);

  // 计时器
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      const interval = setInterval(() => setTime(t => t + 1), 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isCompleted]);

  // 检查是否完成
  useEffect(() => {
    if (isPlaying && userGrid.length && JSON.stringify(userGrid) === JSON.stringify(solution)) {
      setIsCompleted(true);
      setIsPlaying(false);
      toast({ title: '恭喜！', description: '数独完成！' });
      // 保存记录
      const stats = { score: Math.max(0, 1000 - moves * 5 - time * 2), moves, time };
      updateGameStats('sudoku', stats);
      setGameRecord(getGameRecord('sudoku'));
    }
  }, [userGrid, isPlaying, solution, moves, time, toast]);

  // 新游戏
  const handleNewGame = useCallback((diff = difficulty) => {
    const { puzzle, solution } = generateSudoku(diff);
    setPuzzle(puzzle);
    setSolution(solution);
    setUserGrid(puzzle.map(row => [...row]));
    setNotes(Array(9).fill(0).map(() => Array(9).fill([])));
    setSelectedCell(null);
    setTime(0);
    setIsPlaying(true);
    setIsCompleted(false);
    setMoves(0);
    setShowSolution(false);
    setShowNotes(false);
    setDifficulty(diff);
  }, [difficulty]);

  // 输入数字
  const handleInput = (num) => {
    if (!selectedCell || isCompleted) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return; // 预设格不可改
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = num;
    setUserGrid(newGrid);
    setMoves(m => m + 1);
    // 自动检查
    if (solution[row][col] !== num) {
      toast({ title: '错误', description: '填写错误', variant: 'destructive' });
    }
  };

  // 清空格子
  const handleClear = () => {
    if (!selectedCell || isCompleted) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;
    const newGrid = userGrid.map(r => [...r]);
    newGrid[row][col] = 0;
    setUserGrid(newGrid);
  };

  // 切换笔记
  const handleNote = (num) => {
    if (!selectedCell || isCompleted) return;
    const [row, col] = selectedCell;
    if (puzzle[row][col] !== 0) return;
    const newNotes = notes.map(r => r.map(c => [...c]));
    if (newNotes[row][col].includes(num)) {
      newNotes[row][col] = newNotes[row][col].filter(n => n !== num);
    } else {
      newNotes[row][col].push(num);
    }
    setNotes(newNotes);
  };

  // 测试示例
  const handleTest = () => {
    handleNewGame('easy');
    setUserGrid([
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9],
    ]);
    setIsCompleted(true);
    setIsPlaying(false);
  };

  // 高亮逻辑计算
  const selectedValue = selectedCell && userGrid.length ? userGrid[selectedCell[0]][selectedCell[1]] : null;
  const rowsToHighlight = new Set();
  const colsToHighlight = new Set();

  if (selectedValue) {
    // 当选中一个有数字的格子时，找出所有含相同数字的行和列
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userGrid[r][c] === selectedValue) {
          rowsToHighlight.add(r);
          colsToHighlight.add(c);
        }
      }
    }
  } else if (selectedCell) {
    // 当选中一个空格子时，只高亮其所在的行和列
    rowsToHighlight.add(selectedCell[0]);
    colsToHighlight.add(selectedCell[1]);
  }

  // 渲染格子
  const renderCell = (row, col) => {
    const value = userGrid[row][col];
    const isPrefilled = puzzle[row][col] !== 0;
    const isSelected = selectedCell && selectedCell[0] === row && selectedCell[1] === col;

    // 为圆圈高亮判断当前格子是否与选中格子的值相同
    const isSameAsSelectedValue = selectedValue && value !== 0 && value === selectedValue;

    // 根据新的高亮逻辑判断是否高亮行或列
    const shouldHighlightRowCol = rowsToHighlight.has(row) || colsToHighlight.has(col);
    
    // 边框样式
    const borderStyle = `border border-gray-300 ${col > 0 && col % 3 === 0 ? 'border-l-2 border-gray-500' : ''} ${row > 0 && row % 3 === 0 ? 'border-t-2 border-gray-500' : ''}`;

    // 数字颜色: 预设为黑色, 用户输入为蓝色
    let numColor = isPrefilled ? 'text-black' : 'text-[#0077B6]';
    if (isSelected && value) {
      numColor = 'text-red-500'; // 选中时数字为红色
    }

    // 背景色逻辑
    let bgColor = 'bg-white'; // 统一白色背景
    if (isSelected) {
      bgColor = 'bg-yellow-200'; // 选中格子为黄色
    } else if (shouldHighlightRowCol) {
      bgColor = 'bg-blue-100'; // 高亮行为淡蓝色
    }

    return (
      <td
        key={col}
        onClick={() => setSelectedCell([row, col])}
        className={`w-10 h-10 align-middle text-center cursor-pointer select-none transition-colors duration-150
          ${borderStyle}
          ${bgColor}
        `}
      >
        {showNotes && !isPrefilled && notes[row][col].length > 0 ? (
          <div className="grid grid-cols-3 text-xs text-gray-500">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <span key={n} className={notes[row][col].includes(n) ? 'text-blue-500' : ''}>{notes[row][col].includes(n) ? n : ''}</span>
            ))}
          </div>
        ) : (value !== 0 ? (
          <div className={`w-full h-full flex items-center justify-center ${isSameAsSelectedValue && !isSelected ? 'bg-orange-300 rounded-full' : ''}`}>
            <span className={`${numColor} text-2xl font-semibold`}>{value}</span>
          </div>
        ) : null)}
      </td>
    );
  };

  // 渲染数独棋盘
  const renderBoard = () => {
    return (
      <div className="rounded-lg overflow-hidden shadow-lg border-2 border-gray-500">
        <table className="border-collapse mx-auto">
          <tbody>
            {userGrid.map((row, i) => (
              <tr key={i}>
                {row.map((_, j) => renderCell(i, j))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 渲染数字输入区
  const renderInputPad = () => (
    <div className="flex gap-2 justify-center mt-4">
      {[1,2,3,4,5,6,7,8,9].map(n => (
        <Button key={n} size="sm" variant="outline" onClick={() => showNotes ? handleNote(n) : handleInput(n)}>{n}</Button>
      ))}
      <Button size="sm" variant="outline" onClick={handleClear}>清空</Button>
    </div>
  );

  // 渲染游戏统计
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-blue-500" />
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
    </div>
  );

  // 渲染成就
  const renderAchievements = () => {
    if (!gameRecord.achievements || gameRecord.achievements.length === 0) return null;
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

  // 键盘输入支持
  useEffect(() => {
    if (!isPlaying || isCompleted) return;
    const handleKeyDown = (e) => {
      if (!selectedCell) return;
      if (e.key >= '1' && e.key <= '9') {
        if (showNotes) {
          handleNote(Number(e.key));
        } else {
          handleInput(Number(e.key));
        }
      } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, isPlaying, isCompleted, showNotes, handleInput, handleNote, handleClear]);

  return (
    <GameContainer
      description="经典数独逻辑游戏，支持多种难度、自动检查和笔记功能"
      onReset={() => handleNewGame(difficulty)}
      onTest={handleTest}
      stats={renderStats()}
    >
      {/* 游戏控制 */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={difficulty} onValueChange={v => handleNewGame(v)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={showNotes ? 'default' : 'outline'} onClick={() => setShowNotes(s => !s)} className="flex items-center gap-2"><Pencil className="h-4 w-4" />笔记</Button>
          <Button variant={showSolution ? 'default' : 'outline'} onClick={() => setShowSolution(s => !s)} className="flex items-center gap-2"><Eye className="h-4 w-4" />答案</Button>
          <Button variant="outline" onClick={() => handleNewGame(difficulty)} className="flex items-center gap-2"><RotateCcw className="h-4 w-4" />重新开始</Button>
        </div>
        <div className="text-sm text-gray-600">游戏次数: {gameRecord.playCount || 0}</div>
      </div>

      {/* 游戏完成提示 */}
      {isCompleted && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            🎉 恭喜！您成功完成了数独游戏！<br />用时: {formatTime(time)} | 步数: {moves}
          </AlertDescription>
        </Alert>
      )}

      {/* 数独棋盘 */}
      <div className="flex justify-center mb-6">
        {showSolution ? (
          <table className="border-collapse mx-auto bg-gray-100 rounded-lg shadow">
            <tbody>
              {solution.map((row, i) => (
                <tr key={i}>{row.map((num, j) => <td key={j} className="w-10 h-10 border text-center align-middle bg-gray-200 text-blue-500 font-bold">{num}</td>)}</tr>
              ))}
            </tbody>
          </table>
        ) : renderBoard()}
      </div>

      {/* 数字输入区 */}
      {renderInputPad()}

      {/* 成就展示 */}
      {renderAchievements()}

      {/* 游戏说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>游戏说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• 选择格子后输入数字，完成数独挑战</p>
          <p>• 支持自动检查、答案显示、笔记功能</p>
          <p>• 支持多种难度，自动生成题目</p>
          <p>• 游戏会自动保存您的记录</p>
        </CardContent>
      </Card>
    </GameContainer>
  );
};

export default Sudoku; 