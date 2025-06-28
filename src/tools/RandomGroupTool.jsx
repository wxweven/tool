import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Shuffle, Users, Gift, Plus, Trash2, RefreshCw } from "lucide-react";

/**
 * 随机抽签/分组工具
 * 功能：
 * - 随机抽签
 * - 随机分组
 * - 成员管理
 * - 历史记录
 */
const RandomGroupTool = () => {
  const [members, setMembers] = useState(['张三', '李四', '王五', '赵六', '钱七', '孙八']);
  const [newMember, setNewMember] = useState('');
  const [groupCount, setGroupCount] = useState(2);
  const [groupSize, setGroupSize] = useState(3);
  const [groupMode, setGroupMode] = useState('count'); // 'count' 或 'size'
  const [groups, setGroups] = useState([]);
  const [lotteryResult, setLotteryResult] = useState(null);
  const [lotteryCount, setLotteryCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // 默认成员列表
  const defaultMembers = [
    '张三', '李四', '王五', '赵六', '钱七', '孙八',
    '周九', '吴十', '郑十一', '王十二', '冯十三', '陈十四'
  ];

  // 从localStorage加载数据
  useEffect(() => {
    const savedMembers = localStorage.getItem('random_group_members');
    const savedHistory = localStorage.getItem('random_group_history');
    
    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    } else {
      setMembers([...defaultMembers]);
    }
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    if (members.length > 0) {
      localStorage.setItem('random_group_members', JSON.stringify(members));
    }
  }, [members]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('random_group_history', JSON.stringify(history));
    }
  }, [history]);

  // 添加成员
  const addMember = () => {
    if (!newMember.trim()) return;
    if (members.includes(newMember.trim())) {
      alert('该成员已存在');
      return;
    }
    setMembers(prev => [...prev, newMember.trim()]);
    setNewMember('');
  };

  // 删除成员
  const removeMember = (index) => {
    setMembers(prev => prev.filter((_, i) => i !== index));
  };

  // 批量添加成员
  const addMembersBatch = (text) => {
    const newMembers = text.split(/[,，\n]/).map(m => m.trim()).filter(m => m);
    const uniqueMembers = [...new Set([...members, ...newMembers])];
    setMembers(uniqueMembers);
  };

  // 清空成员列表
  const clearMembers = () => {
    setMembers([]);
  };

  // 重置为默认成员
  const resetToDefault = () => {
    setMembers([...defaultMembers]);
  };

  // 洗牌算法
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 随机分组
  const randomGroup = () => {
    if (members.length === 0) {
      alert('请先添加成员');
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      const shuffledMembers = shuffleArray(members);
      let newGroups = [];

      if (groupMode === 'count') {
        // 按组数分组
        const membersPerGroup = Math.ceil(shuffledMembers.length / groupCount);
        for (let i = 0; i < groupCount; i++) {
          const start = i * membersPerGroup;
          const end = start + membersPerGroup;
          const groupMembers = shuffledMembers.slice(start, end);
          if (groupMembers.length > 0) {
            newGroups.push({
              id: i + 1,
              name: `第${i + 1}组`,
              members: groupMembers
            });
          }
        }
      } else {
        // 按组内人数分组
        for (let i = 0; i < shuffledMembers.length; i += groupSize) {
          const groupMembers = shuffledMembers.slice(i, i + groupSize);
          newGroups.push({
            id: Math.floor(i / groupSize) + 1,
            name: `第${Math.floor(i / groupSize) + 1}组`,
            members: groupMembers
          });
        }
      }

      setGroups(newGroups);
      
      // 添加到历史记录
      const historyItem = {
        type: 'group',
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        mode: groupMode,
        value: groupMode === 'count' ? groupCount : groupSize,
        totalMembers: members.length,
        groups: newGroups
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      setIsAnimating(false);
    }, 1000);
  };

  // 随机抽签
  const randomLottery = () => {
    if (members.length === 0) {
      alert('请先添加成员');
      return;
    }

    if (lotteryCount > members.length) {
      alert('抽取数量不能超过成员总数');
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      const shuffledMembers = shuffleArray(members);
      const selected = shuffledMembers.slice(0, lotteryCount);
      setLotteryResult(selected);

      // 添加到历史记录
      const historyItem = {
        type: 'lottery',
        timestamp: Date.now(),
        date: new Date().toLocaleString('zh-CN'),
        count: lotteryCount,
        totalMembers: members.length,
        result: selected
      };
      setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      setIsAnimating(false);
    }, 1000);
  };

  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('random_group_history');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">随机抽签/分组工具</h2>
        <p className="text-muted-foreground">适合聚会、活动分组、抽奖等场景，支持成员管理和历史记录</p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">成员管理</TabsTrigger>
          <TabsTrigger value="group">随机分组</TabsTrigger>
          <TabsTrigger value="lottery">随机抽签</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                成员管理 ({members.length}人)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入成员姓名"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMember()}
                />
                <Button onClick={addMember} disabled={!newMember.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">批量添加（用逗号或换行分隔）</label>
                <Textarea
                  placeholder="张三,李四,王五&#10;或者&#10;张三&#10;李四&#10;王五"
                  onChange={(e) => e.target.value && addMembersBatch(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetToDefault}>
                  恢复默认
                </Button>
                <Button variant="outline" onClick={clearMembers} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空列表
                </Button>
              </div>

              {members.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">当前成员列表</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                        <span className="text-sm">{member}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="group" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                随机分组
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">分组方式</label>
                  <div className="flex gap-2">
                    <Button
                      variant={groupMode === 'count' ? 'default' : 'outline'}
                      onClick={() => setGroupMode('count')}
                      className="flex-1"
                    >
                      按组数
                    </Button>
                    <Button
                      variant={groupMode === 'size' ? 'default' : 'outline'}
                      onClick={() => setGroupMode('size')}
                      className="flex-1"
                    >
                      按人数
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {groupMode === 'count' ? '组数' : '每组人数'}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max={groupMode === 'count' ? members.length : members.length}
                    value={groupMode === 'count' ? groupCount : groupSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      if (groupMode === 'count') {
                        setGroupCount(value);
                      } else {
                        setGroupSize(value);
                      }
                    }}
                  />
                </div>
              </div>

              <Button 
                onClick={randomGroup} 
                disabled={members.length === 0 || isAnimating}
                className="w-full h-12"
              >
                {isAnimating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    分组中...
                  </>
                ) : (
                  <>
                    <Shuffle className="h-4 w-4 mr-2" />
                    开始分组
                  </>
                )}
              </Button>

              {groups.length > 0 && !isAnimating && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant="outline">
                      共{groups.length}组，{members.length}人
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group) => (
                      <Card key={group.id} className="border-2">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-center">
                            {group.name} ({group.members.length}人)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {group.members.map((member, index) => (
                              <Badge key={index} variant="secondary">
                                {member}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lottery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                随机抽签
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">抽取人数</label>
                <Input
                  type="number"
                  min="1"
                  max={members.length}
                  value={lotteryCount}
                  onChange={(e) => setLotteryCount(parseInt(e.target.value) || 1)}
                  placeholder="输入要抽取的人数"
                />
              </div>

              <Button 
                onClick={randomLottery} 
                disabled={members.length === 0 || isAnimating}
                className="w-full h-12"
              >
                {isAnimating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    抽签中...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    开始抽签
                  </>
                )}
              </Button>

              {lotteryResult && !isAnimating && (
                <Card className="border-2 border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-center text-yellow-800">
                      🎉 抽签结果 🎉
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-2xl font-bold text-yellow-800">
                        {lotteryResult.join(' • ')}
                      </div>
                      <Badge variant="outline" className="text-yellow-700">
                        从{members.length}人中抽取{lotteryResult.length}人
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  历史记录 ({history.length})
                </CardTitle>
                {history.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearHistory}>
                    清空历史
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <Card key={item.timestamp} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.type === 'group' ? 'default' : 'secondary'}>
                              {item.type === 'group' ? '分组' : '抽签'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {item.date}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            #{history.length - index}
                          </div>
                        </div>
                        
                        {item.type === 'group' ? (
                          <div className="text-sm">
                            <div>分组方式：{item.mode === 'count' ? `分${item.value}组` : `每组${item.value}人`}</div>
                            <div>参与人数：{item.totalMembers}人，共{item.groups.length}组</div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {item.groups.map((group, gIndex) => (
                                <Badge key={gIndex} variant="outline" className="text-xs">
                                  {group.name}({group.members.length}人)
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div>抽取人数：{item.count}人（共{item.totalMembers}人）</div>
                            <div className="mt-2">
                              <strong>结果：</strong>{item.result.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <RefreshCw className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无历史记录</div>
                  <div className="text-sm mt-1">进行分组或抽签后会显示在这里</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• <strong>成员管理：</strong>添加、删除成员，支持批量导入</div>
          <div>• <strong>随机分组：</strong>支持按组数或每组人数进行分组</div>
          <div>• <strong>随机抽签：</strong>从成员中随机抽取指定数量的人员</div>
          <div>• <strong>历史记录：</strong>自动保存每次操作的结果，方便回顾</div>
          <div>• <strong>数据保存：</strong>成员列表和历史记录会自动保存到本地</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RandomGroupTool; 