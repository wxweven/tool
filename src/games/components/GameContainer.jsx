import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ArrowUp, MessageCircle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';

const GameContainer = ({ 
  title, 
  description, 
  children, 
  onReset, 
  onTest, 
  testData = null,
  stats = null 
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // 监听滚动事件
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFeedback = () => {
    if (feedback.trim()) {
      // 这里可以添加发送反馈的逻辑
      alert('感谢您的反馈！');
      setFeedback('');
      setShowFeedback(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-0 max-w-4xl">
      {/* 页面标题 */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* 游戏主体 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>游戏区域</span>
            <div className="flex gap-2">
              {onTest && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onTest}
                >
                  测试示例
                </Button>
              )}
              {onReset && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onReset}
                >
                  重新开始
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>

      {/* 游戏统计 */}
      {stats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>游戏统计</CardTitle>
          </CardHeader>
          <CardContent>
            {stats}
          </CardContent>
        </Card>
      )}

      {/* 测试数据展示 */}
      {testData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>测试示例</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(testData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 底部按钮 */}
      <div className="flex justify-center gap-4 mb-8">
        <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              反馈
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>反馈建议</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="feedback">您的反馈</Label>
                <Textarea
                  id="feedback"
                  placeholder="请告诉我们您的建议或遇到的问题..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowFeedback(false)}>
                  取消
                </Button>
                <Button onClick={handleFeedback}>
                  提交反馈
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              关于
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>关于 {title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                这是一个轻量级的在线游戏工具，旨在为您提供简单有趣的游戏体验。
              </p>
              <p className="text-gray-600">
                游戏数据会保存在您的浏览器本地存储中，不会上传到服务器。
              </p>
              <p className="text-gray-600">
                如果您有任何问题或建议，欢迎使用反馈功能联系我们。
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 回到顶部按钮 */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 p-0 shadow-lg"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default GameContainer; 