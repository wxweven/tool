import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, TrashIcon, PlayIcon, SquareIcon, ArrowUpIcon, GiftIcon, RefreshCwIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";

const LotteryTool = () => {
  const [participants, setParticipants] = useState("");
  const [rounds, setRounds] = useState([
    { id: 1, name: "第1轮", count: 1, prize: "奖品1", winners: [], isRunning: false, isCollapsed: false }
  ]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayNames, setDisplayNames] = useState([]);
  const animationRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const parseParticipants = () => {
    if (!participants.trim()) return [];
    return participants.split('\n').map(name => name.trim()).filter(name => name.length > 0);
  };

  const addRound = () => {
    const newId = rounds.length > 0 ? Math.max(...rounds.map(r => r.id)) + 1 : 1;
    const newRound = {
      id: newId,
      name: `第${rounds.length + 1}轮`,
      count: 1,
      prize: `奖品${rounds.length + 1}`,
      winners: [],
      isRunning: false,
      isCollapsed: false,
    };
    setRounds([...rounds, newRound]);
  };

  const removeRound = (roundId) => {
    if (rounds.length <= 1) return;
    setRounds(rounds.filter(round => round.id !== roundId));
  };

  const updateRound = (roundId, field, value) => {
    setRounds(rounds.map(round => round.id === roundId ? { ...round, [field]: value } : round));
  };

  const startLottery = (roundId) => {
    const participantList = parseParticipants();
    if (participantList.length === 0) {
      alert("请先输入参与者名单");
      return;
    }

    const round = rounds.find(r => r.id === roundId);
    if (!round) return;

    const allWinners = rounds.flatMap(r => r.winners);
    const availableParticipants = participantList.filter(p => !allWinners.includes(p));

    if (availableParticipants.length < round.count) {
      alert(`剩余参与者不足，需要${round.count}人，但只有${availableParticipants.length}人`);
      return;
    }

    setIsDrawing(true);
    setRounds(rounds.map(r => r.id === roundId ? { ...r, isRunning: true } : r));
    startAnimation(availableParticipants, round.count, roundId);
  };

  const stopLottery = (roundId) => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    const round = rounds.find(r => r.id === roundId);
    if (!round) return;

    const allWinners = rounds.flatMap(r => r.winners);
    const availableParticipants = parseParticipants().filter(p => !allWinners.includes(p));

    finishLottery(availableParticipants, round.count, roundId);
  };

  const startAnimation = (participants, winnerCount, roundId) => {
    let counter = 0;
    const interval = 50;
    animationRef.current = setInterval(() => {
      counter++;
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const displayCount = Math.min(winnerCount, participants.length);
      setDisplayNames(shuffled.slice(0, displayCount));

      if (counter >= 1200) { // 延长到1分钟 (1200 * 50ms)
        clearInterval(animationRef.current);
        animationRef.current = null;
        finishLottery(participants, winnerCount, roundId);
      }
    }, interval);
  };

  const finishLottery = (participants, winnerCount, roundId) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round) return;

    const actualWinnerCount = round.count;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, actualWinnerCount);

    setRounds(rounds.map(r => r.id === roundId ? { ...r, winners, isRunning: false } : r));
    setDisplayNames(winners);
    setIsDrawing(false);
  };

  const toggleCollapse = (roundId) => {
    setRounds(
      rounds.map((round) =>
        round.id === roundId ? { ...round, isCollapsed: !round.isCollapsed } : round
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>参与者名单</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Textarea
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="在此处输入所有参与抽奖的人员名单，每行一个，例如：&#10;张三&#10;李四&#10;王五"
              rows={8}
              className="mt-2 border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500 mt-2">
              当前参与者数量：{parseParticipants().length} 人
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {rounds.map((round) => (
          <div key={round.id} className="border rounded-lg p-6 relative bg-white dark:bg-gray-800 shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{round.name}抽奖</h3>
              <div className="flex items-center">
                {rounds.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"
                    onClick={() => removeRound(round.id)}
                    disabled={round.isRunning}
                    title="删除此轮"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => toggleCollapse(round.id)} title={round.isCollapsed ? '展开' : '收起'}>
                  {round.isCollapsed ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronUpIcon className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {!round.isCollapsed && (
              <>
                {round.winners.length === 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <Label htmlFor={`prize-${round.id}`}>奖品名称</Label>
                        <Input
                          id={`prize-${round.id}`}
                          value={round.prize}
                          onChange={(e) => updateRound(round.id, 'prize', e.target.value)}
                          placeholder="例如：iPhone 15 Pro"
                          className="mt-1"
                          disabled={round.isRunning}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`count-${round.id}`}>中奖人数</Label>
                        <Input
                          id={`count-${round.id}`}
                          type="number"
                          value={round.count || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateRound(round.id, 'count', value === '' ? '' : (parseInt(value) || 1));
                          }}
                          className="mt-1"
                          min="1"
                          placeholder="输入数字"
                          disabled={round.isRunning}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 text-center">
                      {!round.isRunning ? (
                        <>
                          <GiftIcon className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                          <p className="text-muted-foreground mb-6">准备好开始{round.name}抽奖了吗？</p>
                          <Button
                            onClick={() => startLottery(round.id)}
                            size="lg"
                            disabled={!participants.trim() || !round.count || isDrawing}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <RefreshCwIcon className="mr-2 h-4 w-4" />
                            开始抽奖
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-xl font-bold text-blue-600 mb-4">🎲 {round.name}正在抽奖...</div>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {displayNames.map((name, index) => (
                              <div key={index} className="bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-700 rounded-lg p-3 text-center animate-pulse">
                                <div className="font-medium text-blue-800 dark:text-blue-200">{name}</div>
                              </div>
                            ))}
                          </div>
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={() => stopLottery(round.id)}
                            className="mt-8"
                          >
                            <SquareIcon className="mr-2 h-4 w-4" />
                            停止
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-green-700 dark:text-green-300">🎉 {round.name}中奖结果</h4>
                      <Badge className="bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100">{round.prize}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {round.winners.map((winner, index) => (
                        <div key={index} className="bg-green-100 dark:bg-green-900/80 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
                          <div className="font-semibold text-green-800 dark:text-green-200">{winner}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        <div className="flex justify-center mt-8 pt-6 border-t border-dashed">
          <Button onClick={addRound} className="gap-2" variant="outline">
            <PlusIcon className="h-4 w-4" />
            添加新一轮抽奖
          </Button>
        </div>
      </div>

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