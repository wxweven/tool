import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, TrashIcon, PlayIcon, SquareIcon, ArrowUpIcon } from "lucide-react";

const LotteryTool = () => {
  const [participants, setParticipants] = useState("");
  const [rounds, setRounds] = useState([
    { id: 1, name: "第1轮", count: 1, prize: "一等奖", winners: [], isRunning: false }
  ]);
  const [currentRound, setCurrentRound] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayNames, setDisplayNames] = useState([]);
  const animationRef = useRef(null);
  const [remainingParticipants, setRemainingParticipants] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(true); // 控制历史记录的显示
  const [showScrollTop, setShowScrollTop] = useState(false); // 控制回到顶部按钮的显示

  // 监听rounds状态变化，确保历史记录正确显示
  useEffect(() => {
    // 检查是否有中奖记录
    const hasWinners = rounds.some(round => round.winners && round.winners.length > 0);
    console.log('rounds状态更新，是否有中奖记录:', hasWinners, rounds);
    setHistoryVisible(hasWinners);
  }, [rounds]);

  // 监听页面滚动，控制回到顶部按钮的显示
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300); // 滚动超过300px时显示按钮
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 回到顶部函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 解析参与者名单
  const parseParticipants = () => {
    if (!participants.trim()) return [];
    return participants
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
  };

  // 添加新轮次
  const addRound = () => {
    const newRound = {
      id: rounds.length + 1,
      name: `第${rounds.length + 1}轮`,
      count: 1,
      prize: `第${rounds.length + 1}轮奖品`,
      winners: [],
      isRunning: false
    };
    setRounds([...rounds, newRound]);
  };

  // 删除轮次
  const removeRound = (roundId) => {
    if (rounds.length <= 1) return;
    setRounds(rounds.filter(round => round.id !== roundId));
  };

  // 更新轮次信息
  const updateRound = (roundId, field, value) => {
    setRounds(rounds.map(round => 
      round.id === roundId ? { ...round, [field]: value } : round
    ));
  };

  // 开始抽奖
  const startLottery = (roundId) => {
    const participantList = parseParticipants();
    if (participantList.length === 0) {
      alert("请先输入参与者名单");
      return;
    }

    const round = rounds.find(r => r.id === roundId);
    if (!round) return;

    // 计算剩余参与者（排除已中奖的）
    const allWinners = rounds.flatMap(r => r.winners);
    const availableParticipants = participantList.filter(p => !allWinners.includes(p));
    
    if (availableParticipants.length < round.count) {
      alert(`剩余参与者不足，需要${round.count}人，但只有${availableParticipants.length}人`);
      return;
    }

    setRemainingParticipants(availableParticipants);
    setCurrentRound(roundId);
    setIsDrawing(true);
    
    // 更新当前轮次为运行状态
    setRounds(rounds.map(round => 
      round.id === roundId 
        ? { ...round, isRunning: true }
        : { ...round, isRunning: false }
    ));
    
    // 开始动画
    startAnimation(availableParticipants, round.count, roundId);
  };

  // 停止抽奖
  const stopLottery = (roundId) => {
    // 清除动画计时器
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    
    // 获取当前轮次和参与者信息
    const currentRound = rounds.find(r => r.id === roundId);
    if (!currentRound) return;
    
    const participantList = parseParticipants();
    if (participantList.length === 0) return;
    
    // 计算剩余参与者（排除已中奖的）
    const allWinners = rounds.flatMap(r => r.winners);
    const availableParticipants = participantList.filter(p => !allWinners.includes(p));
    
    if (availableParticipants.length < currentRound.count) {
      alert(`剩余参与者不足，需要${currentRound.count}人，但只有${availableParticipants.length}人`);
      return;
    }
    
    // 随机选择获奖者
    const shuffled = [...availableParticipants].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, currentRound.count);
    
    // 更新轮次结果和状态
    const updatedRounds = rounds.map(round => 
      round.id === roundId 
        ? { ...round, winners, isRunning: false }
        : round
    );
    
    // 先设置轮次结果，再更新其他状态
    setRounds(updatedRounds);
    setDisplayNames(winners);
    setIsDrawing(false);
    
    console.log('手动停止抽奖，生成结果:', { roundId, winners, updatedRounds });
  };

  // 抽奖动画
  const startAnimation = (participants, winnerCount, roundId) => {
    let counter = 0;
    const interval = 50; // 每50ms切换一次显示

    animationRef.current = setInterval(() => {
      counter++;
      
      // 随机显示参与者名字，显示数量与实际中奖人数一致
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const displayCount = Math.min(winnerCount, participants.length); // 显示数量与实际中奖人数一致
      setDisplayNames(shuffled.slice(0, displayCount));

      // 动画持续3秒后停止
      if (counter >= 60) {
        clearInterval(animationRef.current);
        animationRef.current = null;
        finishLottery(participants, winnerCount, roundId);
      }
    }, interval);
  };

  // 完成抽奖
  const finishLottery = (participants, winnerCount, roundId) => {
    // 获取当前轮次的最新设置
    const currentRound = rounds.find(r => r.id === roundId);
    if (!currentRound) return;
    
    const actualWinnerCount = currentRound ? currentRound.count : winnerCount;
    
    // 随机选择获奖者
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, actualWinnerCount);
    
    // 更新轮次结果
    const updatedRounds = rounds.map(round => 
      round.id === roundId 
        ? { ...round, winners, isRunning: false }
        : round
    );
    
    // 先设置轮次结果，再更新其他状态
    setRounds(updatedRounds);
    
    // 显示当前轮次的中奖结果
    setDisplayNames(winners);
    setIsDrawing(false);
    
    console.log('自动完成抽奖，生成结果:', { roundId, winners, updatedRounds });
  };

  // 重置所有轮次
  const resetAll = () => {
    setRounds(rounds.map(round => ({ ...round, winners: [], isRunning: false })));
    setDisplayNames([]);
    setIsDrawing(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };

  // 清空所有数据
  const clearAll = () => {
    setParticipants("");
    setRounds([{ id: 1, name: "第1轮", count: 1, prize: "第1轮奖品", winners: [], isRunning: false }]);
    setDisplayNames([]);
    setIsDrawing(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
  };

  // 获取所有中奖者
  const getAllWinners = () => {
    return rounds.flatMap(round => 
      round.winners.map(winner => ({
        name: winner,
        round: round.name,
        prize: round.prize
      }))
    );
  };

  // 显示指定轮次的中奖结果
  const showRoundResult = (roundId) => {
    const round = rounds.find(r => r.id === roundId);
    if (round && round.winners.length > 0) {
      setDisplayNames(round.winners);
    }
  };

  return (
    <div className="space-y-6">
      {/* 参与者输入 */}
      <Card>
        <CardHeader>
          <CardTitle>参与者名单</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="participants">参与者名单（每行一个名字）</Label>
              <Textarea
                id="participants"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="请输入参与者名单，每行一个名字"
                rows={6}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearAll}>
                清空所有
              </Button>
              <Button variant="outline" onClick={resetAll}>
                重置抽奖
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 抽奖轮次设置 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>抽奖轮次</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rounds.map((round) => (
              <div key={round.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg px-3 py-2 min-w-[120px]">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {round.name}
                      </div>
                    </div>
                    <Input
                      type="number"
                      value={round.count || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateRound(round.id, 'count', value === '' ? '' : parseInt(value) || 1);
                      }}
                      className="w-20 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400"
                      min="1"
                      placeholder="人数"
                    />
                    <span className="text-sm text-muted-foreground">人</span>
                    <Input
                      value={round.prize}
                      onChange={(e) => updateRound(round.id, 'prize', e.target.value)}
                      placeholder="奖品名称"
                      className="w-40 bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400"
                    />
                  </div>
                  <div className="flex gap-2">
                    {round.winners.length > 0 ? (
                      <Badge 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => showRoundResult(round.id)}
                      >
                        已抽奖: {round.winners.join(', ')}
                      </Badge>
                    ) : (
                      <div className="flex gap-2">
                        {!round.isRunning ? (
                          <Button 
                            size="sm" 
                            onClick={() => startLottery(round.id)}
                            disabled={!participants.trim() || !round.count || isDrawing}
                          >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            开始抽奖
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => stopLottery(round.id)}
                          >
                            <SquareIcon className="h-4 w-4 mr-1" />
                            停止
                          </Button>
                        )}
                      </div>
                    )}
                    {rounds.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => removeRound(round.id)}
                        disabled={round.isRunning}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* 显示当前轮次的中奖结果 */}
                {round.winners.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-green-800 dark:text-green-200">
                        🎉 {round.name}中奖结果
                      </h4>
                      <Badge variant="outline" className="text-green-700 dark:text-green-300">
                        {round.prize}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {round.winners.map((winner, index) => (
                        <div 
                          key={index}
                          className="bg-green-100 dark:bg-green-800 border border-green-300 dark:border-green-700 rounded-lg p-2 text-center"
                        >
                          <div className="text-sm font-medium text-green-800 dark:text-green-200">
                            {winner}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 显示当前轮次的抽奖动画 */}
                {round.isRunning && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 mb-4">🎲 {round.name}正在抽奖...</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {displayNames.map((name, index) => (
                          <div 
                            key={index}
                            className="bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded-lg p-3 text-center animate-pulse"
                          >
                            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              {name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* 添加轮次按钮 - 移到最新一轮的下方 */}
            <div className="flex justify-center mt-4">
              <Button onClick={addRound} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                添加轮次
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 抽奖结果显示 - 简化为显示所有轮次概览 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>抽奖概览</CardTitle>
            {getAllWinners().length > 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const allWinners = getAllWinners();
                    setDisplayNames(allWinners.map(w => `${w.name} (${w.round})`));
                  }}
                >
                  查看全部中奖者
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {displayNames.length > 0 && !isDrawing ? (
            <div className="text-center py-8">
              <div className="text-2xl font-bold text-green-600 mb-4">🎉 恭喜中奖者 🎉</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {displayNames.map((name, index) => (
                  <div 
                    key={index}
                    className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4 text-center"
                  >
                    <div className="text-lg font-semibold text-green-800 dark:text-green-200">
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>输入参与者名单并开始抽奖</p>
              <p className="mt-2 text-sm">支持多轮抽奖，每轮可设置不同人数和奖品</p>
              {getAllWinners().length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">📋 历史中奖记录</h3>
                  <div className="space-y-4">
                    {rounds.filter(r => r.winners && r.winners.length > 0).map(round => (
                      <div key={round.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {round.name} - {round.prize}
                          </h4>
                          <Badge variant="outline">
                            {round.winners.length}人
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                          {round.winners.map((winner, index) => (
                            <div 
                              key={index}
                              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-center"
                            >
                              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {winner}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const allWinners = getAllWinners();
                          setDisplayNames(allWinners.map(w => `${w.name} (${w.round})`));
                        }}
                      >
                        查看全部中奖者汇总
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDisplayNames([])}
                      >
                        清空显示
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 专门用于展示历史中奖记录的区域 */}
      {historyVisible && (
        <Card className="mt-6 border-2 border-green-500 dark:border-green-700">
          <CardHeader className="bg-green-50 dark:bg-green-900/30">
            <CardTitle className="flex items-center text-green-700 dark:text-green-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              历史中奖记录
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {rounds.filter(r => r.winners && r.winners.length > 0).map(round => (
                <div key={round.id} className="border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
                  <div className="bg-green-100 dark:bg-green-900/50 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      {round.name}
                    </h3>
                    <Badge className="bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100">
                      {round.prize}
                    </Badge>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {round.winners.map((winner, index) => (
                        <div 
                          key={index}
                          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2 text-center"
                        >
                          <div className="text-sm font-medium text-green-800 dark:text-green-200">
                            {winner}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 回到顶部按钮 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110"
          title="回到顶部"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default LotteryTool; 