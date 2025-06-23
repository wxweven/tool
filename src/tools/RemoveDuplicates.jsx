import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, Wand2Icon, DownloadIcon, ChevronUpIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const RemoveDuplicates = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);
  const [stats, setStats] = useState({ original: 0, unique: 0, removed: 0 });
  const [isSorted, setIsSorted] = useState(false);
  const [sortDirection, setSortDirection] = useState('none'); // 'none', 'asc', 'desc'

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsScrollToTopVisible(true);
      } else {
        setIsScrollToTopVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const removeDuplicates = () => {
    if (!input.trim()) return;

    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const originalCount = lines.length;
    
    // 使用Set去重，保持原有顺序
    const uniqueLines = [];
    const seen = new Set();
    
    lines.forEach(line => {
      if (!seen.has(line)) {
        seen.add(line);
        uniqueLines.push(line);
      }
    });

    const uniqueCount = uniqueLines.length;
    const removedCount = originalCount - uniqueCount;
    
    setStats({ original: originalCount, unique: uniqueCount, removed: removedCount });
    setOutput(uniqueLines.join('\n'));
    setIsSorted(false); // 重置排序状态
    setSortDirection('none'); // 重置排序方向
  };

  const toggleSort = () => {
    if (!output) return;
    
    const lines = output.split('\n');
    let newDirection;
    let sortedLines;
    
    if (sortDirection === 'none' || sortDirection === 'desc') {
      // 升序排序
      sortedLines = lines.sort((a, b) => a.localeCompare(b, 'zh-CN'));
      newDirection = 'asc';
    } else {
      // 降序排序
      sortedLines = lines.sort((a, b) => b.localeCompare(a, 'zh-CN'));
      newDirection = 'desc';
    }
    
    setOutput(sortedLines.join('\n'));
    setIsSorted(true);
    setSortDirection(newDirection);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsCSV = () => {
    if (!output) return;
    
    const lines = output.split('\n');
    // 修复：直接使用行内容，不添加双引号
    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', '去重结果.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setStats({ original: 0, unique: 0, removed: 0 });
    setIsSorted(false);
    setSortDirection('none');
  };

  const loadExample = () => {
    const example = `苹果
香蕉
苹果
橙子
香蕉
葡萄
苹果
橙子
葡萄
西瓜`;
    setInput(example);
    setOutput("");
    setStats({ original: 0, unique: 0, removed: 0 });
    setIsSorted(false);
    setSortDirection('none');
  };

  const shouldShowDownload = output.split('\n').length > 100;

  // 根据排序方向选择图标
  const getSortIcon = () => {
    switch (sortDirection) {
      case 'asc':
        return <ArrowUpIcon className="mr-2 h-4 w-4" />;
      case 'desc':
        return <ArrowDownIcon className="mr-2 h-4 w-4" />;
      default:
        return <ArrowUpDownIcon className="mr-2 h-4 w-4" />;
    }
  };

  // 根据排序方向选择按钮文字
  const getSortText = () => {
    switch (sortDirection) {
      case 'asc':
        return '升序';
      case 'desc':
        return '降序';
      default:
        return '排序';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>文本去重</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="input-text">输入文本（每行一个）</Label>
                <Textarea
                  id="input-text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请输入要去重的文本，每行一个&#10;例如：&#10;苹果&#10;香蕉&#10;苹果&#10;橙子"
                  rows={12}
                  className="font-mono mt-1"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={removeDuplicates}>
                  <Wand2Icon className="mr-2 h-4 w-4" />
                  去重
                </Button>
                <Button variant="secondary" onClick={clearAll}>
                  清空
                </Button>
                <Button variant="outline" onClick={loadExample}>
                  示例
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>去重结果</CardTitle>
              <div className="flex gap-2">
                {output && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleSort}
                  >
                    {getSortIcon()}
                    {getSortText()}
                  </Button>
                )}
                {shouldShowDownload && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={downloadAsCSV}
                  >
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    下载CSV
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!output}
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  复制
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="space-y-4">
                {/* 统计信息 */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <div className="font-semibold text-blue-600">{stats.original}</div>
                    <div className="text-xs text-gray-500">原始行数</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="font-semibold text-green-600">{stats.unique}</div>
                    <div className="text-xs text-gray-500">去重后行数</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="font-semibold text-red-600">{stats.removed}</div>
                    <div className="text-xs text-gray-500">重复行数</div>
                  </div>
                </div>

                {/* 结果文本 */}
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto font-mono text-sm max-h-96">
                    {output}
                  </pre>
                  
                  {copied && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      已复制!
                    </div>
                  )}
                </div>

                {shouldShowDownload && (
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      结果超过100行，建议下载CSV文件
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>输入文本并点击去重按钮</p>
                <p className="mt-2 text-sm">支持去除重复行，保持原有顺序</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scroll to Top Button */}
      {isScrollToTopVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <ChevronUpIcon className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default RemoveDuplicates; 