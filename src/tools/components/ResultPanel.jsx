import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileOutputIcon, 
  CopyIcon, 
  DownloadIcon, 
  BarChartIcon,
  EyeIcon,
  CheckIcon,
  LoaderIcon
} from 'lucide-react';

const ResultPanel = ({ outputText, statistics, inputText, isProcessing }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('result');

  const copyToClipboard = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsText = () => {
    if (!outputText) return;

    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '文本处理结果.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = () => {
    if (!outputText) return;

    const lines = outputText.split('\n');
    const csvContent = lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', '文本处理结果.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shouldShowDownload = outputText && outputText.split('\n').length > 50;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileOutputIcon className="h-5 w-5" />
            处理结果
          </CardTitle>
          <div className="flex gap-2">
            {outputText && (
              <>
                {shouldShowDownload && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsText}
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      下载TXT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsCSV}
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      下载CSV
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <CheckIcon className="mr-2 h-4 w-4" />
                  ) : (
                    <CopyIcon className="mr-2 h-4 w-4" />
                  )}
                  {copied ? '已复制' : '复制'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isProcessing ? (
          <div className="text-center py-12">
            <LoaderIcon className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-lg font-medium">正在处理中...</p>
            <p className="mt-2 text-sm text-gray-500">请稍候，正在按照选定的操作处理您的文本</p>
          </div>
        ) : outputText ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="result" className="flex items-center gap-2">
                <FileOutputIcon className="h-4 w-4" />
                处理结果
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                统计信息
              </TabsTrigger>
              <TabsTrigger value="compare" className="flex items-center gap-2">
                <EyeIcon className="h-4 w-4" />
                对比视图
              </TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="space-y-4">
              {/* 快速统计 */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <div className="font-semibold text-blue-600">{statistics.originalLines}</div>
                  <div className="text-xs text-gray-500">原始行数</div>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="font-semibold text-green-600">{statistics.processedLines}</div>
                  <div className="text-xs text-gray-500">处理后行数</div>
                </div>
                <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="font-semibold text-red-600">{statistics.removedLines}</div>
                  <div className="text-xs text-gray-500">移除行数</div>
                </div>
                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                  <div className="font-semibold text-purple-600">{statistics.words}</div>
                  <div className="text-xs text-gray-500">单词数</div>
                </div>
              </div>

              {/* 结果文本 */}
              <div className="relative">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto font-mono text-sm max-h-96 whitespace-pre-wrap">
                  {outputText}
                </pre>
                
                {copied && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    已复制到剪贴板!
                  </div>
                )}
              </div>

              {shouldShowDownload && (
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    结果超过50行，建议下载文件查看完整内容
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">文本统计</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">原始行数:</span>
                      <Badge variant="outline">{statistics.originalLines}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">处理后行数:</span>
                      <Badge variant="outline">{statistics.processedLines}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">空行数:</span>
                      <Badge variant="outline">{statistics.emptyLines}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">字符数:</span>
                      <Badge variant="outline">{statistics.characters}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">单词数:</span>
                      <Badge variant="outline">{statistics.words}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm">处理效果</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">移除行数:</span>
                      <Badge variant="destructive">{statistics.removedLines}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">压缩比例:</span>
                      <Badge variant="secondary">
                        {statistics.originalLines > 0 
                          ? `${(((statistics.originalLines - statistics.processedLines) / statistics.originalLines) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">平均行长:</span>
                      <Badge variant="outline">
                        {statistics.processedLines > 0 
                          ? `${(statistics.characters / statistics.processedLines).toFixed(1)}`
                          : '0'
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compare" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-600">原始文本</h4>
                  <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md overflow-auto font-mono text-xs max-h-80 whitespace-pre-wrap">
                    {inputText || '暂无输入'}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2 text-gray-600">处理结果</h4>
                  <pre className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md overflow-auto font-mono text-xs max-h-80 whitespace-pre-wrap">
                    {outputText || '暂无结果'}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileOutputIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>请输入文本并选择处理操作</p>
            <p className="mt-2 text-sm">支持去重、排序、删除空行、处理空白字符等操作</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultPanel; 