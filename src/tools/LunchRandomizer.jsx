import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { PlusIcon, XIcon, Dices, ClockIcon, UtensilsIcon } from "lucide-react";

/**
 * 随机午餐/晚餐生成器
 * 功能：
 * - 输入常吃的菜品或餐厅
 * - 一键随机选择"今天吃什么"
 * - 支持历史记录和收藏
 */
const LunchRandomizer = () => {
  const [currentInput, setCurrentInput] = useState('');
  const [foodList, setFoodList] = useState([
    '宫保鸡丁', '麻婆豆腐', '回锅肉', '鱼香肉丝', '糖醋里脊',
    '黄焖鸡米饭', '兰州拉面', '沙县小吃', '麦当劳', '肯德基',
    '火锅', '烧烤', '日料', '韩餐', '西餐'
  ]);
  const [selectedFood, setSelectedFood] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState([]);

  // 从localStorage加载数据
  useEffect(() => {
    const savedFoodList = localStorage.getItem('lunchRandomizer_foodList');
    const savedHistory = localStorage.getItem('lunchRandomizer_history');
    
    if (savedFoodList) {
      setFoodList(JSON.parse(savedFoodList));
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('lunchRandomizer_foodList', JSON.stringify(foodList));
  }, [foodList]);

  useEffect(() => {
    localStorage.setItem('lunchRandomizer_history', JSON.stringify(history));
  }, [history]);

  const addFood = () => {
    if (currentInput.trim() && !foodList.includes(currentInput.trim())) {
      setFoodList([...foodList, currentInput.trim()]);
      setCurrentInput('');
    }
  };

  const removeFood = (food) => {
    setFoodList(foodList.filter(item => item !== food));
  };

  const randomSelect = () => {
    if (foodList.length === 0) return;
    
    setIsRolling(true);
    setSelectedFood('');
    
    // 模拟转盘效果
    let count = 0;
    const maxCount = 15 + Math.floor(Math.random() * 10);
    
    const rollInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * foodList.length);
      setSelectedFood(foodList[randomIndex]);
      count++;
      
      if (count >= maxCount) {
        clearInterval(rollInterval);
        setIsRolling(false);
        
        // 添加到历史记录
        const newRecord = {
          food: foodList[randomIndex],
          time: new Date().toLocaleString('zh-CN'),
          timestamp: Date.now()
        };
        setHistory(prev => [newRecord, ...prev.slice(0, 19)]); // 只保留最近20条
      }
    }, 100);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const resetFoodList = () => {
    setFoodList([
      '宫保鸡丁', '麻婆豆腐', '回锅肉', '鱼香肉丝', '糖醋里脊',
      '黄焖鸡米饭', '兰州拉面', '沙县小吃', '麦当劳', '肯德基',
      '火锅', '烧烤', '日料', '韩餐', '西餐'
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">随机午餐/晚餐生成器</h2>
        <p className="text-muted-foreground">解决选择困难症，让随机来决定今天吃什么！</p>
      </div>

      <Tabs defaultValue="random" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="random">随机选择</TabsTrigger>
          <TabsTrigger value="manage">管理菜品</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="random" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsIcon className="h-5 w-5" />
                今天吃什么？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg mb-4">
                  {selectedFood ? (
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${isRolling ? 'animate-pulse' : 'text-primary'}`}>
                        {selectedFood}
                      </div>
                      {!isRolling && (
                        <div className="text-sm text-muted-foreground mt-2">
                          就决定是你了！
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Dices className="h-12 w-12 mx-auto mb-2" />
                      <div>点击下方按钮开始随机选择</div>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={randomSelect} 
                  disabled={isRolling || foodList.length === 0}
                  size="lg"
                  className="px-8"
                >
                  <Dices className="h-5 w-5 mr-2" />
                  {isRolling ? '正在选择...' : '随机选择'}
                </Button>
                
                {foodList.length === 0 && (
                  <p className="text-sm text-red-500 mt-2">
                    请先在"管理菜品"中添加一些菜品
                  </p>
                )}
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">
                  当前菜品库 ({foodList.length} 个)：
                </div>
                <div className="flex flex-wrap gap-2">
                  {foodList.slice(0, 10).map((food, index) => (
                    <Badge key={index} variant="secondary">
                      {food}
                    </Badge>
                  ))}
                  {foodList.length > 10 && (
                    <Badge variant="outline">
                      +{foodList.length - 10} 更多...
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>管理菜品库</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入菜品名称..."
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFood()}
                />
                <Button onClick={addFood} disabled={!currentInput.trim()}>
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetFoodList}>
                  重置为默认菜品
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFoodList([])}
                  disabled={foodList.length === 0}
                >
                  清空所有菜品
                </Button>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-muted-foreground mb-3">
                  当前菜品 ({foodList.length} 个)：
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {foodList.map((food, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 border rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm">{food}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFood(food)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <XIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {foodList.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <UtensilsIcon className="h-12 w-12 mx-auto mb-2" />
                    <div>暂无菜品，请添加一些菜品</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  选择历史
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
                <div className="space-y-2">
                  {history.map((record, index) => (
                    <div 
                      key={record.timestamp}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{record.food}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {record.time}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        #{history.length - index}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无选择历史</div>
                  <div className="text-sm mt-1">开始随机选择来创建历史记录吧！</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LunchRandomizer; 