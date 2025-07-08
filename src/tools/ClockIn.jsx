import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import {
  PlusIcon,
  CheckIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
  TargetIcon,
  TrophyIcon,
  TrendingUpIcon,
  ChevronUpIcon
} from 'lucide-react';
import { toast } from "sonner";

// 目标图标选项
const goalIcons = [
  { name: '学习', icon: '📚' },
  { name: '运动', icon: '🏃' },
  { name: '阅读', icon: '📖' },
  { name: '冥想', icon: '🧘' },
  { name: '写作', icon: '✍️' },
  { name: '编程', icon: '💻' },
  { name: '绘画', icon: '🎨' },
  { name: '音乐', icon: '🎵' },
  { name: '烹饪', icon: '👨‍🍳' },
  { name: '摄影', icon: '📷' },
];

// 激励语库
const motivationalQuotes = [
  "坚持就是胜利！",
  "每一天都是新的开始！",
  "小步前进，大步跨越！",
  "你的努力终将开花结果！",
  "今天的坚持是明天的成功！",
  "每一个目标都值得被坚持！",
  "你比想象中更强大！",
  "坚持的路上，你并不孤单！",
  "今天的付出，明天的收获！",
  "相信自己，你可以做到！"
];

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return isVisible ? (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
    >
      <ChevronUpIcon className="h-5 w-5" />
    </Button>
  ) : null;
};

const ClockIn = () => {
  const [goals, setGoals] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('goals');

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    targetDays: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  // 加载数据
  useEffect(() => {
    const savedGoals = localStorage.getItem('clockInGoals');
    const savedCheckIns = localStorage.getItem('clockInCheckIns');

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    if (savedCheckIns) {
      setCheckIns(JSON.parse(savedCheckIns));
    }
  }, []);

  // 保存数据
  const saveData = useCallback(() => {
    localStorage.setItem('clockInGoals', JSON.stringify(goals));
    localStorage.setItem('clockInCheckIns', JSON.stringify(checkIns));
  }, [goals, checkIns]);

  useEffect(() => {
    saveData();
  }, [goals, checkIns, saveData]);

  // 创建目标
  const handleCreateGoal = () => {
    if (!formData.name.trim()) {
      toast.error('请输入目标名称');
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      targetDays: formData.targetDays ? parseInt(formData.targetDays) : null,
      startDate: formData.startDate,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setGoals(prev => [newGoal, ...prev]);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      targetDays: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsCreateDialogOpen(false);
    toast.success('目标创建成功！');
  };

  // 编辑目标
  const handleEditGoal = () => {
    if (!formData.name.trim()) {
      toast.error('请输入目标名称');
      return;
    }

    const updatedGoal = {
      ...editingGoal,
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      targetDays: formData.targetDays ? parseInt(formData.targetDays) : null
    };

    setGoals(prev => prev.map(goal =>
      goal.id === editingGoal.id ? updatedGoal : goal
    ));

    setEditingGoal(null);
    setFormData({
      name: '',
      description: '',
      icon: '📚',
      targetDays: '',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsEditDialogOpen(false);
    toast.success('目标更新成功！');
  };

  // 删除目标
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('确定要删除这个目标吗？相关的打卡记录也会被删除。')) {
      setGoals(prev => prev.filter(goal => goal.id !== goalId));
      setCheckIns(prev => prev.filter(checkIn => checkIn.goalId !== goalId));
      toast.success('目标删除成功！');
    }
  };

  // 打卡
  const handleCheckIn = (goalId) => {
    const today = new Date().toISOString().split('T')[0];
    const existingCheckIn = checkIns.find(
      checkIn => checkIn.goalId === goalId && checkIn.date === today
    );

    if (existingCheckIn) {
      toast.error('今天已经打卡了！');
      return;
    }

    const newCheckIn = {
      id: Date.now().toString(),
      goalId,
      date: today,
      time: new Date().toLocaleTimeString(),
      createdAt: new Date().toISOString()
    };

    setCheckIns(prev => [newCheckIn, ...prev]);

    // 显示随机激励语
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    toast.success(`打卡成功！${randomQuote}`);
  };

  // 获取目标统计
  const getGoalStats = (goalId) => {
    const goalCheckIns = checkIns.filter(checkIn => checkIn.goalId === goalId);
    const totalDays = goalCheckIns.length;

    // 计算连续天数
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const sortedCheckIns = goalCheckIns
      .map(checkIn => new Date(checkIn.date))
      .sort((a, b) => b - a);

    if (sortedCheckIns.length > 0) {
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < sortedCheckIns.length; i++) {
        const checkInDate = new Date(sortedCheckIns[i]);
        checkInDate.setHours(0, 0, 0, 0);

        const diffTime = currentDate - checkInDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === i) {
          tempStreak++;
          if (i === 0) currentStreak = tempStreak;
        } else {
          if (tempStreak > maxStreak) maxStreak = tempStreak;
          tempStreak = 0;
        }
      }

      if (tempStreak > maxStreak) maxStreak = tempStreak;
    }

    return { totalDays, currentStreak, maxStreak };
  };

  // 获取今日是否已打卡
  const isTodayCheckedIn = (goalId) => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.some(checkIn =>
      checkIn.goalId === goalId && checkIn.date === today
    );
  };

  // 获取日历数据
  const getCalendarData = (goalId) => {
    const goalCheckIns = checkIns.filter(checkIn => checkIn.goalId === goalId);
    const checkInDates = goalCheckIns.map(checkIn => new Date(checkIn.date));
    return checkInDates;
  };

  // 打开编辑对话框
  const openEditDialog = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      icon: goal.icon,
      targetDays: goal.targetDays ? goal.targetDays.toString() : '',
      startDate: goal.startDate
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TargetIcon className="h-5 w-5" />
            打卡统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{goals.length}</div>
              <div className="text-sm text-gray-600">总目标数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {checkIns.filter(checkIn =>
                  checkIn.date === new Date().toISOString().split('T')[0]
                ).length}
              </div>
              <div className="text-sm text-gray-600">今日打卡</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{checkIns.length}</div>
              <div className="text-sm text-gray-600">总打卡次数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 标签页 */}
      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-4 ${activeTab === 'goals' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('goals')}
        >
          目标管理
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'calendar' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('calendar')}
        >
          日历视图
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('stats')}
        >
          数据统计
        </button>
      </div>

      {/* 目标管理标签页 */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {/* 创建目标按钮 */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">我的目标</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  创建目标
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新目标</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">目标名称 *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="例如：每日背单词"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">目标描述</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="描述你的目标..."
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label>选择图标</Label>
                    <div className="grid grid-cols-5 gap-2 mt-2">
                      {goalIcons.map((iconOption) => (
                        <button
                          key={iconOption.name}
                          type="button"
                          className={`p-2 rounded border-2 text-lg ${
                            formData.icon === iconOption.icon
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.icon }))}
                        >
                          {iconOption.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="targetDays">目标天数（可选）</Label>
                    <Input
                      id="targetDays"
                      type="number"
                      value={formData.targetDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDays: e.target.value }))}
                      placeholder="例如：30"
                      min="1"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleCreateGoal}>
                      创建目标
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 目标列表 */}
          {goals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <TargetIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">还没有创建任何目标</p>
                <p className="text-sm text-gray-400 mt-2">点击"创建目标"开始你的打卡之旅</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const stats = getGoalStats(goal.id);
                const isCheckedIn = isTodayCheckedIn(goal.id);
                const progress = goal.targetDays ? (stats.totalDays / goal.targetDays) * 100 : 0;

                return (
                  <Card key={goal.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{goal.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                            {goal.description && (
                              <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(goal)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* 统计信息 */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold">{stats.totalDays}</div>
                          <div className="text-xs text-gray-600">总天数</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">{stats.currentStreak}</div>
                          <div className="text-xs text-gray-600">连续天数</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-blue-600">{stats.maxStreak}</div>
                          <div className="text-xs text-gray-600">最高记录</div>
                        </div>
                      </div>

                      {/* 进度条 */}
                      {goal.targetDays && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>进度</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-gray-500 mt-1">
                            {stats.totalDays} / {goal.targetDays} 天
                          </div>
                        </div>
                      )}

                      {/* 打卡按钮 */}
                      <Button
                        className={`w-full gap-2 ${
                          isCheckedIn
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        onClick={() => handleCheckIn(goal.id)}
                        disabled={isCheckedIn}
                      >
                        {isCheckedIn ? (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            今日已打卡
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4" />
                            立即打卡
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 日历视图标签页 */}
      {activeTab === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              打卡日历
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">还没有创建任何目标</p>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal) => {
                  const checkInDates = getCalendarData(goal.id);
                  const selectedDates = checkInDates.map(date => date.toISOString().split('T')[0]);

                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">{goal.icon}</span>
                        <h3 className="font-semibold">{goal.name}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">打卡日历</h4>
                          <Calendar
                            mode="multiple"
                            selected={selectedDates}
                            className="rounded-md border"
                            disabled={(date) => date > new Date()}
                          />
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">打卡统计</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                              <span className="text-sm">本月打卡</span>
                              <span className="font-semibold text-blue-600">
                                {checkInDates.filter(date => {
                                  const now = new Date();
                                  return date.getMonth() === now.getMonth() &&
                                         date.getFullYear() === now.getFullYear();
                                }).length}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm">连续天数</span>
                              <span className="font-semibold text-green-600">
                                {getGoalStats(goal.id).currentStreak}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                              <span className="text-sm">总打卡天数</span>
                              <span className="font-semibold text-purple-600">
                                {checkInDates.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 数据统计标签页 */}
      {activeTab === 'stats' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              数据统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">还没有创建任何目标</p>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal) => {
                  const stats = getGoalStats(goal.id);
                  const recentCheckIns = checkIns
                    .filter(checkIn => checkIn.goalId === goal.id)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 7);

                  return (
                    <div key={goal.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">{goal.icon}</span>
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 统计卡片 */}
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-xl font-bold text-blue-600">{stats.totalDays}</div>
                              <div className="text-sm text-gray-600">总打卡</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">{stats.currentStreak}</div>
                              <div className="text-sm text-gray-600">连续天数</div>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-xl font-bold text-purple-600">{stats.maxStreak}</div>
                              <div className="text-sm text-gray-600">最高记录</div>
                            </div>
                          </div>

                          {/* 成就徽章 */}
                          <div>
                            <h4 className="font-medium mb-2">成就徽章</h4>
                            <div className="flex gap-2">
                              {stats.currentStreak >= 7 && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <TrophyIcon className="h-3 w-3 mr-1" />
                                  坚持一周
                                </Badge>
                              )}
                              {stats.currentStreak >= 30 && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  <TrophyIcon className="h-3 w-3 mr-1" />
                                  坚持一月
                                </Badge>
                              )}
                              {stats.maxStreak >= 100 && (
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                  <TrophyIcon className="h-3 w-3 mr-1" />
                                  百日达人
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 最近打卡记录 */}
                        <div>
                          <h4 className="font-medium mb-2">最近打卡记录</h4>
                          <div className="space-y-2">
                            {recentCheckIns.length === 0 ? (
                              <p className="text-gray-500 text-sm">还没有打卡记录</p>
                            ) : (
                              recentCheckIns.map((checkIn) => (
                                <div key={checkIn.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                  <span className="text-sm">{checkIn.date}</span>
                                  <span className="text-xs text-gray-500">{checkIn.time}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 编辑目标对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑目标</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">目标名称 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如：每日背单词"
                maxLength={20}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">目标描述</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述你的目标..."
                maxLength={100}
              />
            </div>
            <div>
              <Label>选择图标</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {goalIcons.map((iconOption) => (
                  <button
                    key={iconOption.name}
                    type="button"
                    className={`p-2 rounded border-2 text-lg ${
                      formData.icon === iconOption.icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, icon: iconOption.icon }))}
                  >
                    {iconOption.icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-targetDays">目标天数（可选）</Label>
              <Input
                id="edit-targetDays"
                type="number"
                value={formData.targetDays}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDays: e.target.value }))}
                placeholder="例如：30"
                min="1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleEditGoal}>
                保存修改
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ScrollToTop />
    </div>
  );
};

export default ClockIn;