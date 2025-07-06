import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Quote, Heart, Zap, RefreshCw, Share, Star } from "lucide-react";
import { positiveQuotes, toxicQuotes } from "./data/quotes";

/**
 * 每日一句/毒鸡汤生成器
 * 功能：
 * - 随机生成正能量语录
 * - 随机生成幽默毒鸡汤
 * - 收藏喜欢的句子
 * - 分享功能
 */
const DailyQuote = () => {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [currentType, setCurrentType] = useState('positive');
  const [favorites, setFavorites] = useState([]);
  const [dailyQuote, setDailyQuote] = useState(null);



  // 从localStorage加载收藏
  useEffect(() => {
    const savedFavorites = localStorage.getItem('daily_quote_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // 获取今日语录
    const today = new Date().toDateString();
    const savedDailyQuote = localStorage.getItem('daily_quote_today');
    const savedDate = localStorage.getItem('daily_quote_date');
    
    if (savedDate === today && savedDailyQuote) {
      setDailyQuote(JSON.parse(savedDailyQuote));
    } else {
      // 生成新的今日语录
      generateDailyQuote();
    }
  }, []);

  // 保存收藏到localStorage
  useEffect(() => {
    localStorage.setItem('daily_quote_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // 生成今日语录
  const generateDailyQuote = () => {
    const allQuotes = [...positiveQuotes, ...toxicQuotes];
    const randomQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
    const type = positiveQuotes.includes(randomQuote) ? 'positive' : 'toxic';
    
    const todayQuote = {
      text: randomQuote,
      type: type,
      date: new Date().toLocaleDateString('zh-CN')
    };
    
    setDailyQuote(todayQuote);
    localStorage.setItem('daily_quote_today', JSON.stringify(todayQuote));
    localStorage.setItem('daily_quote_date', new Date().toDateString());
  };

  // 随机生成语录
  const generateQuote = (type) => {
    const quotes = type === 'positive' ? positiveQuotes : toxicQuotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote({ text: randomQuote, type });
    setCurrentType(type);
  };

  // 添加到收藏
  const addToFavorites = (quote) => {
    if (!favorites.find(fav => fav.text === quote.text)) {
      const newFavorite = {
        ...quote,
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('zh-CN')
      };
      setFavorites(prev => [newFavorite, ...prev]);
    }
  };

  // 从收藏中移除
  const removeFromFavorites = (quote) => {
    setFavorites(prev => prev.filter(fav => fav.text !== quote.text));
  };

  // 检查是否已收藏
  const isFavorited = (quote) => {
    return favorites.some(fav => fav.text === quote.text);
  };

  // 分享语录
  const shareQuote = (quote) => {
    if (navigator.share) {
      navigator.share({
        title: '分享语录',
        text: quote.text,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(quote.text);
      alert('语录已复制到剪贴板');
    }
  };

  // 清空收藏
  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">每日一句/毒鸡汤生成器</h2>
        <p className="text-muted-foreground">每天推送一句正能量语录或幽默毒鸡汤，增加生活趣味性</p>
      </div>

      {dailyQuote && (
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Star className="h-5 w-5" />
              今日语录 - {dailyQuote.date}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <blockquote className="text-lg font-medium text-gray-800 italic border-l-4 border-blue-400 pl-4">
                "{dailyQuote.text}"
              </blockquote>
              <div className="flex items-center justify-between">
                <Badge variant={dailyQuote.type === 'positive' ? 'default' : 'destructive'}>
                  {dailyQuote.type === 'positive' ? '正能量' : '毒鸡汤'}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToFavorites(dailyQuote)}
                    disabled={isFavorited(dailyQuote)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {isFavorited(dailyQuote) ? '已收藏' : '收藏'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareQuote(dailyQuote)}>
                    <Share className="h-4 w-4 mr-1" />
                    分享
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">随机生成</TabsTrigger>
          <TabsTrigger value="favorites">我的收藏</TabsTrigger>
          <TabsTrigger value="daily">更新今日</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5" />
                语录生成器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => generateQuote('positive')}
                  className="h-16 bg-green-500 hover:bg-green-600"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  生成正能量语录
                </Button>
                <Button 
                  onClick={() => generateQuote('toxic')}
                  variant="destructive"
                  className="h-16"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  生成毒鸡汤
                </Button>
              </div>

              {currentQuote && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <blockquote className="text-lg font-medium text-gray-800 italic border-l-4 border-gray-400 pl-4">
                        "{currentQuote.text}"
                      </blockquote>
                      <div className="flex items-center justify-between">
                        <Badge variant={currentQuote.type === 'positive' ? 'default' : 'destructive'}>
                          {currentQuote.type === 'positive' ? '正能量' : '毒鸡汤'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToFavorites(currentQuote)}
                            disabled={isFavorited(currentQuote)}
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {isFavorited(currentQuote) ? '已收藏' : '收藏'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => shareQuote(currentQuote)}>
                            <Share className="h-4 w-4 mr-1" />
                            分享
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => generateQuote(currentType)}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            换一句
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  我的收藏 ({favorites.length})
                </CardTitle>
                {favorites.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearFavorites}>
                    清空收藏
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {favorites.length > 0 ? (
                <div className="space-y-4">
                  {favorites.map((quote, index) => (
                    <Card key={quote.timestamp} className="p-4">
                      <div className="space-y-3">
                        <blockquote className="text-base font-medium text-gray-800 italic">
                          "{quote.text}"
                        </blockquote>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={quote.type === 'positive' ? 'default' : 'destructive'}>
                              {quote.type === 'positive' ? '正能量' : '毒鸡汤'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              收藏于 {quote.date}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => shareQuote(quote)}>
                              <Share className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeFromFavorites(quote)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Heart className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无收藏的语录</div>
                  <div className="text-sm mt-1">去生成一些语录并收藏吧！</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                更新今日语录
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                系统每天会自动生成一句今日语录。如果您想手动更新，可以点击下方按钮。
              </div>
              <Button onClick={generateDailyQuote} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                重新生成今日语录
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• 每天自动生成一句今日语录</div>
          <div>• 可以随机生成正能量语录或毒鸡汤</div>
          <div>• 支持收藏喜欢的语录</div>
          <div>• 支持分享语录到其他平台</div>
          <div>• 所有数据保存在本地，不会丢失</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyQuote; 