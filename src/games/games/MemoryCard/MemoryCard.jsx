import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { RotateCcw, Trophy, Clock, Zap, Target } from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import GameContainer from '../../components/GameContainer';
import { getGameRecord, updateGameStats } from '../../utils/gameStorage';
import { formatTime, shuffleArray } from '../../utils/gameUtils';

const MemoryCard = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [size, setSize] = useState(4);
  const [theme, setTheme] = useState('animals');
  const [gameMode, setGameMode] = useState('classic');
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameRecord, setGameRecord] = useState({});
  const [timer, setTimer] = useState(null);
  const [timeLimit, setTimeLimit] = useState(120);
  const { toast } = useToast();

  // 主题配置
  const themes = {
    animals: {
      name: '动物',
      icons: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌']
    },
    fruits: {
      name: '水果',
      icons: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯']
    },
    emojis: {
      name: '表情',
      icons: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏']
    },
    numbers: {
      name: '数字',
      icons: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '1️⃣1️⃣', '1️⃣2️⃣', '1️⃣3️⃣', '1️⃣4️⃣', '1️⃣5️⃣', '1️⃣6️⃣', '1️⃣7️⃣', '1️⃣8️⃣', '1️⃣9️⃣', '2️⃣0️⃣', '2️⃣1️⃣', '2️⃣2️⃣', '2️⃣3️⃣', '2️⃣4️⃣', '2️⃣5️⃣', '2️⃣6️⃣', '2️⃣7️⃣', '2️⃣8️⃣', '2️⃣9️⃣', '3️⃣0️⃣', '3️⃣1️⃣', '3️⃣2️⃣']
    }
  };

  // 初始化游戏记录
  useEffect(() => {
    const record = getGameRecord('memory-card');
    setGameRecord(record);
    // 自动初始化棋盘
    initializeGame();
    // eslint-disable-next-line
  }, []);

  // 生成卡片数据
  const generateCards = useCallback((size, themeKey) => {
    const totalPairs = (size * size) / 2;
    const themeIcons = themes[themeKey].icons.slice(0, totalPairs);
    const cardPairs = [...themeIcons, ...themeIcons];
    const shuffledCards = shuffleArray(cardPairs);
    
    return shuffledCards.map((icon, index) => ({
      id: index,
      icon,
      isFlipped: false,
      isMatched: false
    }));
  }, []);

  // 初始化游戏
  const initializeGame = useCallback((newSize = size, newTheme = theme, newMode = gameMode) => {
    const newCards = generateCards(newSize, newTheme);
    setCards(newCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setCombo(0);
    setMaxCombo(0);
    setTime(0);
    setIsPlaying(true);
    setIsCompleted(false);
    setSize(newSize);
    setTheme(newTheme);
    setGameMode(newMode);
    
    if (newMode === 'time-challenge') {
      setTimeLimit(newSize === 4 ? 60 : newSize === 6 ? 120 : 180);
    }
  }, [size, theme, gameMode, generateCards]);

  // 开始计时器
  useEffect(() => {
    if (isPlaying && !isCompleted) {
      const interval = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1;
          if (gameMode === 'time-challenge' && newTime >= timeLimit) {
            setIsPlaying(false);
            setIsCompleted(true);
            toast({
              title: "时间到！",
              description: "时间挑战模式结束，游戏失败",
              variant: "destructive"
            });
          }
          return newTime;
        });
      }, 1000);
      setTimer(interval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isCompleted, gameMode, timeLimit, toast]);

  // 检查游戏是否完成
  useEffect(() => {
    if (isPlaying && matchedPairs.length > 0 && matchedPairs.length === (size * size) / 2) {
      setIsCompleted(true);
      setIsPlaying(false);
      
      const stats = {
        score: Math.max(0, 1000 - moves * 5 - time * 2 + maxCombo * 10),
        moves,
        time,
        maxCombo
      };
      updateGameStats('memory-card', stats);
      
      const newRecord = getGameRecord('memory-card');
      setGameRecord(newRecord);
      
      toast({
        title: "恭喜！",
        description: `您成功完成了 ${size}×${size} 的记忆翻牌游戏！`,
      });
    }
  }, [matchedPairs, isPlaying, size, moves, time, maxCombo, toast]);

  // 翻转卡片
  const flipCard = useCallback((cardId) => {
    if (!isPlaying || isCompleted) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    if (flippedCards.length >= 2) return;
    
    const newCards = cards.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = newCards.find(c => c.id === firstId);
      const secondCard = newCards.find(c => c.id === secondId);
      
      if (firstCard.icon === secondCard.icon) {
        setMatchedPairs(prev => [...prev, firstCard.icon]);
        setCombo(prev => {
          const newCombo = prev + 1;
          setMaxCombo(current => Math.max(current, newCombo));
          return newCombo;
        });
        
        setTimeout(() => {
          setCards(current => current.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true, isFlipped: true }
              : c
          ));
          setFlippedCards([]);
        }, 500);
        
        if (combo + 1 > 1) {
          toast({
            title: "连击！",
            description: `${combo + 1}连击！继续加油！`,
            duration: 1000
          });
        }
      } else {
        setCombo(0);
        
        setTimeout(() => {
          setCards(current => current.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [cards, flippedCards, isPlaying, isCompleted, combo, toast]);

  // 重新开始
  const handleReset = () => {
    if (timer) clearInterval(timer);
    initializeGame();
  };

  // 测试示例
  const handleTest = () => {
    const testCards = generateCards(4, 'animals');
    const matchedIcons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻'];
    
    const testCardsWithMatches = testCards.map((card, index) => {
      if (matchedIcons.includes(card.icon) && index % 2 === 0) {
        return { ...card, isMatched: true, isFlipped: true };
      }
      return card;
    });
    
    setCards(testCardsWithMatches);
    setMatchedPairs(matchedIcons);
    setSize(4);
    setTheme('animals');
    setGameMode('classic');
    setMoves(5);
    setTime(30);
    setCombo(2);
    setMaxCombo(3);
    setIsPlaying(true);
    setIsCompleted(false);
  };

  // 渲染卡片
  const renderCard = (card) => {
    const isFlipped = card.isFlipped || card.isMatched;
    const isHighlighted = flippedCards.includes(card.id);
    
    return (
      <button
        key={card.id}
        onClick={() => flipCard(card.id)}
        disabled={!isPlaying || isCompleted || card.isMatched}
        className={`
          w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold
          transition-all duration-300 transform hover:scale-105
          ${isFlipped 
            ? 'bg-green-500 text-white shadow-lg' 
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
          }
          ${isHighlighted ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
          ${card.isMatched ? 'bg-green-600' : ''}
          ${!isPlaying || isCompleted || card.isMatched ? 'cursor-default' : 'cursor-pointer'}
        `}
      >
        {isFlipped ? card.icon : '❓'}
      </button>
    );
  };

  // 渲染游戏统计
  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Target className="h-4 w-4 text-blue-500" />
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
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-gray-600">当前连击</span>
        </div>
        <div className="text-2xl font-bold text-yellow-600">{combo}</div>
      </div>
      
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-gray-600">最佳连击</span>
        </div>
        <div className="text-2xl font-bold text-purple-600">
          {gameRecord.maxCombo || '-'}
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
      description="经典的记忆翻牌游戏，考验您的记忆力和反应速度"
      onReset={handleReset}
      onTest={handleTest}
      stats={renderStats()}
    >
      {/* 游戏控制 */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={size.toString()} onValueChange={(value) => initializeGame(parseInt(value), theme, gameMode)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4×4</SelectItem>
              <SelectItem value="6">6×6</SelectItem>
              <SelectItem value="8">8×8</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={theme} onValueChange={(value) => initializeGame(size, value, gameMode)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="animals">动物</SelectItem>
              <SelectItem value="fruits">水果</SelectItem>
              <SelectItem value="emojis">表情</SelectItem>
              <SelectItem value="numbers">数字</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={gameMode} onValueChange={(value) => initializeGame(size, theme, value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">经典模式</SelectItem>
              <SelectItem value="time-challenge">时间挑战</SelectItem>
            </SelectContent>
          </Select>
          
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

      {/* 时间挑战模式提示 */}
      {gameMode === 'time-challenge' && isPlaying && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            ⏰ 时间挑战模式：剩余时间 {formatTime(Math.max(0, timeLimit - time))}
          </AlertDescription>
        </Alert>
      )}

      {/* 游戏完成提示 */}
      {isCompleted && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            🎉 恭喜！您成功完成了 {size}×{size} 的记忆翻牌游戏！
            <br />
            用时: {formatTime(time)} | 步数: {moves} | 最大连击: {maxCombo}
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
          {cards.map(card => renderCard(card))}
        </div>
      </div>

      {/* 游戏进度 */}
      {isPlaying && !isCompleted && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>游戏进度</span>
            <span>{Math.round((matchedPairs.length / ((size * size) / 2)) * 100)}%</span>
          </div>
          <Progress value={(matchedPairs.length / ((size * size) / 2)) * 100} className="h-2" />
        </div>
      )}

      {/* 连击显示 */}
      {combo > 1 && (
        <div className="mb-4 text-center">
          <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
            <Zap className="h-4 w-4 mr-2" />
            {combo} 连击！
          </Badge>
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
          <p>• 点击卡片翻开，找到相同的图案配对</p>
          <p>• 连续配对成功可以获得连击奖励</p>
          <p>• 时间挑战模式需要在限定时间内完成</p>
          <p>• 游戏会自动保存您的记录</p>
        </CardContent>
      </Card>
    </GameContainer>
  );
};

export default MemoryCard; 