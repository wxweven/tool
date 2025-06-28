import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { PlusCircle, MinusCircle, Wallet, TrendingUp, TrendingDown, Download, Trash2 } from "lucide-react";

const ExpenseTracker = () => {
  const [records, setRecords] = useState([
    {
      id: Date.now() - 1000000,
      type: 'income',
      amount: 5000,
      category: '工资',
      description: '月工资',
      date: new Date(Date.now() - 86400000).toLocaleDateString('zh-CN'),
      timestamp: Date.now() - 86400000
    },
    {
      id: Date.now() - 900000,
      type: 'expense',
      amount: 50,
      category: '餐饮',
      description: '午餐',
      date: new Date().toLocaleDateString('zh-CN'),
      timestamp: Date.now() - 7200000
    }
  ]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');

  // 分类选项
  const categories = {
    income: ['工资', '奖金', '投资收益', '兼职', '其他收入'],
    expense: ['餐饮', '交通', '购物', '娱乐', '医疗', '教育', '房租', '水电费', '其他支出']
  };

  // 添加记录
  const addRecord = () => {
    if (!amount || !category || parseFloat(amount) <= 0) {
      alert('请填写完整信息且金额大于0');
      return;
    }

    const newRecord = {
      id: Date.now(),
      type,
      amount: parseFloat(amount),
      category,
      description: description || '无备注',
      date: new Date().toLocaleDateString('zh-CN'),
      timestamp: Date.now()
    };

    setRecords(prev => [newRecord, ...prev]);
    
    // 清空表单
    setAmount('');
    setCategory('');
    setDescription('');
  };

  // 删除记录
  const deleteRecord = (id) => {
    setRecords(prev => prev.filter(record => record.id !== id));
  };

  // 计算统计数据
  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">记账/小账本工具</h2>
        <p className="text-muted-foreground">简单的日常收支记录，支持分类统计和数据导出</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">总收入</p>
                <p className="text-2xl font-bold text-green-700">¥{totalIncome.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">总支出</p>
                <p className="text-2xl font-bold text-red-700">¥{totalExpense.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${balance >= 0 ? 'border-blue-200 bg-blue-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>余额</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  ¥{balance.toFixed(2)}
                </p>
              </div>
              <Wallet className={`h-8 w-8 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">添加记录</TabsTrigger>
          <TabsTrigger value="records">记录列表</TabsTrigger>
        </TabsList>

        <TabsContent value="add" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                添加收支记录
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">类型</label>
                  <div className="flex gap-2">
                    <Button
                      variant={type === 'income' ? 'default' : 'outline'}
                      onClick={() => setType('income')}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      收入
                    </Button>
                    <Button
                      variant={type === 'expense' ? 'default' : 'outline'}
                      onClick={() => setType('expense')}
                      className="flex-1"
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      支出
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">金额</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">分类</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories[type].map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">备注（可选）</label>
                <Textarea
                  placeholder="添加备注信息..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <Button onClick={addRecord} className="w-full" disabled={!amount || !category}>
                <PlusCircle className="h-4 w-4 mr-2" />
                添加记录
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>记录列表 ({records.length}条)</CardTitle>
            </CardHeader>
            <CardContent>
              {records.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {records.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${record.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {record.type === 'income' ? 
                            <TrendingUp className="h-4 w-4 text-green-600" /> : 
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <div className="font-medium">{record.category}</div>
                          <div className="text-sm text-muted-foreground">{record.description}</div>
                          <div className="text-xs text-muted-foreground">{record.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-lg font-bold ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {record.type === 'income' ? '+' : '-'}¥{record.amount.toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecord(record.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Wallet className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无记录</div>
                  <div className="text-sm mt-1">开始添加您的第一笔记录吧！</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpenseTracker; 