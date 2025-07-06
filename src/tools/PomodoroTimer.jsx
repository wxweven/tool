import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { Checkbox } from "../components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  Coffee, 
  Target,
  Settings,
  BarChart3,
  Volume2,
  CheckCircle,
  Plus,
  Trash2,
  Calendar
} from "lucide-react";

const PomodoroTimer = () => {
  // 计时器状态
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 默认25分钟
  const [currentSession, setCurrentSession] = useState('work'); // work, shortBreak, longBreak
  const [sessionCount, setSessionCount] = useState(0);
  
  // 设置
  const [workTime, setWorkTime] = useState([25]);
  const [shortBreakTime, setShortBreakTime] = useState([5]);
  const [longBreakTime, setLongBreakTime] = useState([15]);
  const [longBreakInterval, setLongBreakInterval] = useState([4]);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  
  // 音效设置
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSound, setSelectedSound] = useState('bell');
  
  // 任务管理
  const [currentTask, setCurrentTask] = useState('');
  const [tasks, setTasks] = useState([
    { id: 1, text: '完成项目文档', completed: false, pomodoros: 0, estimatedPomodoros: 3 },
    { id: 2, text: '回复邮件', completed: true, pomodoros: 1, estimatedPomodoros: 1 }
  ]);
  const [newTask, setNewTask] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  
  // 统计数据
  const [todayPomodoros, setTodayPomodoros] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0); // 分钟
  
  // 引用
  const intervalRef = useRef(null);
  
  // 获取当前会话配置
  const getCurrentSessionConfig = () => {
    switch (currentSession) {
      case 'work':
        return { time: workTime[0] * 60, label: '工作时间', color: 'bg-red-500' };
      case 'shortBreak':
        return { time: shortBreakTime[0] * 60, label: '短休息', color: 'bg-green-500' };
      case 'longBreak':
        return { time: longBreakTime[0] * 60, label: '长休息', color: 'bg-blue-500' };
      default:
        return { time: workTime[0] * 60, label: '工作时间', color: 'bg-red-500' };
    }
  };
  
  // 格式化时间显示
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 播放音效
  const playSound = () => {
    if (soundEnabled) {
      // 创建简单的提示音
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };
  
  // 发送通知
  const sendNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };
  
  // 开始计时器
  const startTimer = () => {
    setIsRunning(true);
  };
  
  // 暂停计时器
  const pauseTimer = () => {
    setIsRunning(false);
  };
  
  // 停止计时器
  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentSessionConfig().time);
  };
  
  // 重置计时器
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getCurrentSessionConfig().time);
  };
  
  // 切换会话类型
  const switchSession = (newSession) => {
    setIsRunning(false);
    setCurrentSession(newSession);
    
    // 设置新的时间
    const config = {
      work: workTime[0] * 60,
      shortBreak: shortBreakTime[0] * 60,
      longBreak: longBreakTime[0] * 60
    };
    setTimeLeft(config[newSession]);
  };
  
  // 完成一个番茄钟
  const completePomodoro = () => {
    if (currentSession === 'work') {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);
      setTodayPomodoros(prev => prev + 1);
      setTotalFocusTime(prev => prev + workTime[0]);
      
      // 更新当前任务的番茄钟数
      if (currentTask) {
        setTasks(prev => prev.map(task => 
          task.text === currentTask 
            ? { ...task, pomodoros: task.pomodoros + 1 }
            : task
        ));
      }
      
      // 决定下一个会话类型
      const isLongBreak = newCount % longBreakInterval[0] === 0;
      const nextSession = isLongBreak ? 'longBreak' : 'shortBreak';
      
      playSound();
      sendNotification(
        '番茄钟完成！', 
        `恭喜完成一个番茄钟！${isLongBreak ? '该长休息了' : '该短休息了'}`
      );
      
      if (autoStartBreaks) {
        switchSession(nextSession);
        setTimeout(() => setIsRunning(true), 1000);
      } else {
        switchSession(nextSession);
      }
    } else {
      // 休息结束
      playSound();
      sendNotification('休息结束！', '准备开始下一个番茄钟');
      
      if (autoStartPomodoros) {
        switchSession('work');
        setTimeout(() => setIsRunning(true), 1000);
      } else {
        switchSession('work');
      }
    }
  };
  
  // 添加任务
  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        pomodoros: 0,
        estimatedPomodoros: estimatedPomodoros
      };
      setTasks(prev => [...prev, task]);
      setNewTask('');
      setEstimatedPomodoros(1);
    }
  };
  
  // 删除任务
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    const deletedTask = tasks.find(task => task.id === id);
    if (deletedTask && deletedTask.text === currentTask) {
      setCurrentTask('');
    }
  };
  
  // 切换任务完成状态
  const toggleTaskComplete = (id) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  // 选择当前任务
  const selectCurrentTask = (taskText) => {
    setCurrentTask(taskText);
  };
  
  // 计时器效果
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completePomodoro();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);
  
  // 请求通知权限
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // 更新页面标题
  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${getCurrentSessionConfig().label}`;
    } else {
      document.title = '番茄钟工具';
    }
    
    return () => {
      document.title = '番茄钟工具';
    };
  }, [timeLeft, isRunning, currentSession]);
  
  const sessionConfig = getCurrentSessionConfig();
  const progress = ((sessionConfig.time - timeLeft) / sessionConfig.time) * 100;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">番茄钟工具</h2>
        <p className="text-muted-foreground">基于番茄工作法的时间管理工具，提高专注力和工作效率</p>
      </div>

      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer">计时器</TabsTrigger>
          <TabsTrigger value="tasks">任务管理</TabsTrigger>
          <TabsTrigger value="stats">统计数据</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                {/* 会话类型切换 */}
                <div className="flex justify-center gap-2">
                  <Button
                    variant={currentSession === 'work' ? 'default' : 'outline'}
                    onClick={() => switchSession('work')}
                    disabled={isRunning}
                    className={currentSession === 'work' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    工作
                  </Button>
                  <Button
                    variant={currentSession === 'shortBreak' ? 'default' : 'outline'}
                    onClick={() => switchSession('shortBreak')}
                    disabled={isRunning}
                    className={currentSession === 'shortBreak' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    短休息
                  </Button>
                  <Button
                    variant={currentSession === 'longBreak' ? 'default' : 'outline'}
                    onClick={() => switchSession('longBreak')}
                    disabled={isRunning}
                    className={currentSession === 'longBreak' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    长休息
                  </Button>
                </div>

                {/* 圆形计时器 */}
                <div className="relative w-80 h-80 mx-auto">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-transparent"
                    style={{
                      background: `conic-gradient(from 0deg, ${sessionConfig.color.replace('bg-', '')} ${progress}%, transparent ${progress}%)`,
                      borderRadius: '50%'
                    }}
                  ></div>
                  <div className="absolute inset-8 rounded-full bg-white shadow-inner flex flex-col items-center justify-center">
                    <div className="text-6xl font-mono font-bold text-gray-800">
                      {formatTime(timeLeft)}
                    </div>
                    <div className="text-lg text-gray-600 mt-2">
                      {sessionConfig.label}
                    </div>
                    {currentTask && (
                      <div className="text-sm text-gray-500 mt-1 px-4 text-center">
                        {currentTask}
                      </div>
                    )}
                  </div>
                </div>

                {/* 控制按钮 */}
                <div className="flex justify-center gap-4">
                  {!isRunning ? (
                    <Button onClick={startTimer} size="lg" className="px-8">
                      <Play className="h-5 w-5 mr-2" />
                      开始
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} size="lg" className="px-8" variant="outline">
                      <Pause className="h-5 w-5 mr-2" />
                      暂停
                    </Button>
                  )}
                  <Button onClick={resetTimer} size="lg" variant="outline">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    重置
                  </Button>
                  <Button onClick={stopTimer} size="lg" variant="outline">
                    <Square className="h-5 w-5 mr-2" />
                    停止
                  </Button>
                </div>

                {/* 进度条 */}
                <div className="w-full max-w-md mx-auto">
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-gray-500 mt-1">
                    {Math.round(progress)}% 完成
                  </div>
                </div>

                {/* 今日统计 */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{todayPomodoros}</div>
                    <div className="text-sm text-gray-500">今日番茄</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{sessionCount}</div>
                    <div className="text-sm text-gray-500">本轮番茄</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{Math.round(totalFocusTime / 60)}h</div>
                    <div className="text-sm text-gray-500">专注时间</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 添加任务 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  添加任务
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">任务描述</label>
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="输入任务描述..."
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">预估番茄钟数</label>
                  <Slider
                    value={[estimatedPomodoros]}
                    onValueChange={(value) => setEstimatedPomodoros(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{estimatedPomodoros} 个番茄钟</div>
                </div>
                <Button onClick={addTask} className="w-full" disabled={!newTask.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加任务
                </Button>
              </CardContent>
            </Card>

            {/* 当前任务 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  当前任务
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentTask ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="font-medium">{currentTask}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        正在专注进行中...
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentTask('')}
                    >
                      取消选择
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <div>未选择任务</div>
                    <div className="text-sm">从下方任务列表中选择一个任务</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 任务列表 */}
          <Card>
            <CardHeader>
              <CardTitle>任务列表 ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 ${
                        task.text === currentTask ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id)}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.text}
                        </div>
                        <div className="text-sm text-gray-500">
                          {task.pomodoros}/{task.estimatedPomodoros} 番茄钟
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!task.completed && task.text !== currentTask && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectCurrentTask(task.text)}
                          >
                            选择
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无任务</div>
                  <div className="text-sm mt-1">添加第一个任务开始专注工作</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">今日番茄钟</p>
                    <p className="text-2xl font-bold text-red-600">{todayPomodoros}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">完成任务</p>
                    <p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.completed).length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">总专注时间</p>
                    <p className="text-2xl font-bold text-green-600">{Math.round(totalFocusTime / 60)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>任务完成情况</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <CheckCircle className={`h-5 w-5 ${task.completed ? 'text-green-500' : 'text-gray-300'}`} />
                        <div>
                          <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.text}
                          </div>
                          <div className="text-sm text-gray-500">
                            完成进度: {task.pomodoros}/{task.estimatedPomodoros} 番茄钟
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={task.completed ? 'default' : 'outline'}>
                          {task.completed ? '已完成' : '进行中'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无统计数据</div>
                  <div className="text-sm mt-1">完成一些任务后会显示统计信息</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 时间设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  时间设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">工作时间</label>
                    <Badge variant="outline">{workTime[0]} 分钟</Badge>
                  </div>
                  <Slider
                    value={workTime}
                    onValueChange={setWorkTime}
                    max={60}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">短休息时间</label>
                    <Badge variant="outline">{shortBreakTime[0]} 分钟</Badge>
                  </div>
                  <Slider
                    value={shortBreakTime}
                    onValueChange={setShortBreakTime}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">长休息时间</label>
                    <Badge variant="outline">{longBreakTime[0]} 分钟</Badge>
                  </div>
                  <Slider
                    value={longBreakTime}
                    onValueChange={setLongBreakTime}
                    max={60}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">长休息间隔</label>
                    <Badge variant="outline">每 {longBreakInterval[0]} 个番茄钟</Badge>
                  </div>
                  <Slider
                    value={longBreakInterval}
                    onValueChange={setLongBreakInterval}
                    max={8}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 其他设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  其他设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="soundEnabled"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                  <label htmlFor="soundEnabled" className="text-sm font-medium">启用提醒音效</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoStartBreaks"
                    checked={autoStartBreaks}
                    onCheckedChange={setAutoStartBreaks}
                  />
                  <label htmlFor="autoStartBreaks" className="text-sm">工作结束后自动开始休息</label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoStartPomodoros"
                    checked={autoStartPomodoros}
                    onCheckedChange={setAutoStartPomodoros}
                  />
                  <label htmlFor="autoStartPomodoros" className="text-sm">休息结束后自动开始工作</label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• <strong>番茄工作法：</strong>25分钟专注工作 + 5分钟短休息，4个循环后进行15分钟长休息</div>
          <div>• <strong>任务管理：</strong>添加任务并选择当前专注的任务，系统会自动记录番茄钟数</div>
          <div>• <strong>音效提醒：</strong>支持提醒音效，帮助保持专注</div>
          <div>• <strong>数据统计：</strong>记录每日专注时间和完成的番茄钟数量</div>
          <div>• <strong>自定义设置：</strong>可根据个人习惯调整工作和休息时间</div>
          <div>• <strong>浏览器通知：</strong>支持桌面通知提醒，即使切换到其他标签页也不会错过</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroTimer; 