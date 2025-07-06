import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Calculator, Heart, Target, TrendingUp } from "lucide-react";

/**
 * 健康BMI计算器
 * 功能：
 * - 输入身高体重计算BMI
 * - 显示健康状态和建议
 * - BMI历史记录
 */
const BMICalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState(null);
  const [history, setHistory] = useState([]);

  // BMI分类标准
  const bmiCategories = [
    { min: 0, max: 18.5, label: '偏瘦', color: 'bg-blue-500', textColor: 'text-blue-600', advice: '建议增加营养摄入，适当增重' },
    { min: 18.5, max: 24, label: '正常', color: 'bg-green-500', textColor: 'text-green-600', advice: '保持良好的生活习惯，继续维持' },
    { min: 24, max: 28, label: '偏胖', color: 'bg-yellow-500', textColor: 'text-yellow-600', advice: '注意饮食控制，增加运动量' },
    { min: 28, max: 32, label: '肥胖', color: 'bg-orange-500', textColor: 'text-orange-600', advice: '建议制定减重计划，咨询营养师' },
    { min: 32, max: 100, label: '重度肥胖', color: 'bg-red-500', textColor: 'text-red-600', advice: '建议及时就医，制定专业减重方案' }
  ];

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('bmi_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 保存历史记录到localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('bmi_history', JSON.stringify(history));
    }
  }, [history]);

  // 计算BMI
  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (!h || !w || h <= 0 || w <= 0) {
      alert('请输入有效的身高和体重');
      return;
    }

    // BMI = 体重(kg) / (身高(m))²
    const heightInMeters = h / 100; // 转换为米
    const calculatedBMI = w / (heightInMeters * heightInMeters);
    
    setBmi(calculatedBMI);
    
    // 确定BMI分类
    const category = bmiCategories.find(cat => calculatedBMI >= cat.min && calculatedBMI < cat.max);
    setBmiCategory(category);

    // 添加到历史记录
    const newRecord = {
      date: new Date().toLocaleDateString('zh-CN'),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      height: h,
      weight: w,
      bmi: calculatedBMI,
      category: category?.label,
      timestamp: Date.now()
    };
    
    setHistory(prev => [newRecord, ...prev.slice(0, 9)]); // 只保留最近10条
  };

  // 清空输入
  const clearInputs = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setBmiCategory(null);
  };

  // 清空历史记录
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('bmi_history');
  };

  // 计算理想体重范围
  const getIdealWeightRange = () => {
    if (!height) return null;
    const h = parseFloat(height) / 100;
    const minWeight = (18.5 * h * h).toFixed(1);
    const maxWeight = (24 * h * h).toFixed(1);
    return { min: minWeight, max: maxWeight };
  };

  const idealWeight = getIdealWeightRange();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">健康BMI计算器</h2>
        <p className="text-muted-foreground">输入身高体重，自动计算BMI并给出健康建议</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            BMI计算
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">身高 (cm)</label>
              <Input
                placeholder="请输入身高，如：170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                type="number"
                min="50"
                max="250"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">体重 (kg)</label>
              <Input
                placeholder="请输入体重，如：65"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                type="number"
                min="20"
                max="300"
                step="0.1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateBMI} disabled={!height || !weight} className="flex-1">
              <Calculator className="h-4 w-4 mr-2" />
              计算BMI
            </Button>
            <Button variant="outline" onClick={clearInputs}>
              清空
            </Button>
          </div>

          {idealWeight && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <Target className="h-4 w-4 inline mr-1" />
                根据您的身高，理想体重范围：<strong>{idealWeight.min} - {idealWeight.max} kg</strong>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {bmi && bmiCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              BMI结果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{bmi.toFixed(1)}</div>
              <Badge className={bmiCategory.color} variant="secondary">
                {bmiCategory.label}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">BMI指数范围</div>
              <Progress value={(bmi / 35) * 100} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>18.5</span>
                <span>24</span>
                <span>28</span>
                <span>32</span>
                <span>35+</span>
              </div>
            </div>

            <Alert>
              <Heart className="h-4 w-4" />
              <AlertDescription className={bmiCategory.textColor}>
                <strong>健康建议：</strong>{bmiCategory.advice}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-muted-foreground">身高</div>
                <div className="font-semibold">{height} cm</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-muted-foreground">体重</div>
                <div className="font-semibold">{weight} kg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                历史记录
              </CardTitle>
              <Button variant="outline" size="sm" onClick={clearHistory}>
                清空历史
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((record, index) => (
                <div key={record.timestamp} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {record.date} {record.time}
                    </div>
                    <div className="text-sm">
                      {record.height}cm / {record.weight}kg
                    </div>
                    <Badge variant="outline" className="text-xs">
                      BMI {record.bmi.toFixed(1)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {record.category}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    #{history.length - index}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>BMI标准参考</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bmiCategories.map((category, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <span className="font-medium">{category.label}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {category.min} - {category.max === 100 ? '∞' : category.max}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            * BMI仅供参考，具体健康状况请咨询专业医生
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BMICalculator; 