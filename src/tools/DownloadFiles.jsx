import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, Wand2Icon, DownloadIcon, ChevronUpIcon, LinkIcon, FileIcon, AlertCircleIcon, ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DownloadFiles = () => {
  const [input, setInput] = useState("");
  const [urls, setUrls] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [downloadResults, setDownloadResults] = useState([]);
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);
  const [isConcurrentMode, setIsConcurrentMode] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

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

  const parseUrls = () => {
    if (!input.trim()) return [];

    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // 去重并验证URL
    const uniqueUrls = [];
    const seen = new Set();
    
    lines.forEach(url => {
      if (!seen.has(url) && isValidUrl(url)) {
        seen.add(url);
        uniqueUrls.push(url);
      }
    });

    return uniqueUrls;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getFileNameFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop();
      return fileName || 'download';
    } catch {
      return 'download';
    }
  };

  const updateCompletedCount = () => {
    const completed = downloadResults.filter(result => 
      result.status === 'success' || result.status === 'error'
    ).length;
    setCompletedCount(completed);
  };

  const downloadSingleFile = async (url) => {
    const fileName = getFileNameFromUrl(url);
    
    setDownloadProgress(prev => ({
      ...prev,
      [url]: { status: 'downloading', progress: 0 }
    }));

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      
      setDownloadProgress(prev => ({
        ...prev,
        [url]: { status: 'success', progress: 100 }
      }));

      return {
        url,
        fileName,
        status: 'success',
        size: blob.size,
        blob
      };
    } catch (error) {
      setDownloadProgress(prev => ({
        ...prev,
        [url]: { status: 'error', progress: 0, error: error.message }
      }));

      return {
        url,
        fileName,
        status: 'error',
        error: error.message
      };
    }
  };

  const downloadFiles = async () => {
    if (!input.trim()) {
      alert('请先输入有效的URL');
      return;
    }

    // 自动解析URL
    const parsedUrls = parseUrls();
    if (parsedUrls.length === 0) {
      alert('没有找到有效的URL，请检查输入格式');
      return;
    }

    setUrls(parsedUrls);
    setIsDownloading(true);
    setDownloadProgress({});
    setDownloadResults([]);
    setCompletedCount(0);
    
    // 检查是否需要并发模式
    setIsConcurrentMode(parsedUrls.length > 50);

    const results = [];
    const downloadedFiles = [];

    if (isConcurrentMode) {
      // 并发下载模式
      const batchSize = 10; // 每批10个并发
      const batches = [];
      
      for (let i = 0; i < parsedUrls.length; i += batchSize) {
        batches.push(parsedUrls.slice(i, i + batchSize));
      }

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchPromises = batch.map(url => downloadSingleFile(url));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const fileResult = result.value;
            results.push(fileResult);
            
            if (fileResult.status === 'success' && fileResult.blob) {
              downloadedFiles.push({ name: fileResult.fileName, blob: fileResult.blob });
            }
          } else {
            // 处理Promise被拒绝的情况
            const url = batch[index];
            const fileName = getFileNameFromUrl(url);
            results.push({
              url,
              fileName,
              status: 'error',
              error: result.reason?.message || '下载失败'
            });
          }
        });

        // 更新结果和进度
        setDownloadResults([...results]);
        updateCompletedCount();
      }
    } else {
      // 顺序下载模式
      for (let i = 0; i < parsedUrls.length; i++) {
        const result = await downloadSingleFile(parsedUrls[i]);
        results.push(result);
        
        if (result.status === 'success' && result.blob) {
          downloadedFiles.push({ name: result.fileName, blob: result.blob });
        }

        // 每下载完一个文件就更新结果和进度
        setDownloadResults([...results]);
        updateCompletedCount();
      }
    }

    // 如果有成功下载的文件，创建zip
    if (downloadedFiles.length > 0) {
      await createAndDownloadZip(downloadedFiles);
    }

    setIsDownloading(false);
  };

  const createAndDownloadZip = async (files) => {
    try {
      // 使用JSZip库创建zip文件
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      files.forEach(({ name, blob }) => {
        zip.file(name, blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // 下载zip文件
      const link = document.createElement('a');
      const url = URL.createObjectURL(zipBlob);
      link.setAttribute('href', url);
      link.setAttribute('download', `下载文件_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('创建zip文件失败:', error);
      alert('创建zip文件失败，请检查浏览器是否支持');
    }
  };

  const clearAll = () => {
    setInput("");
    setUrls([]);
    setDownloadProgress({});
    setDownloadResults([]);
    setIsConcurrentMode(false);
    setCompletedCount(0);
  };

  const loadExample = () => {
    const example = `https://example.com/file1.pdf
https://example.com/image.jpg
https://example.com/document.docx
https://example.com/file1.pdf
https://invalid-url.com/file.txt`;
    setInput(example);
    setUrls([]);
    setDownloadProgress({});
    setDownloadResults([]);
    setIsConcurrentMode(false);
    setCompletedCount(0);
  };

  const copyToClipboard = () => {
    if (!input) return;
    navigator.clipboard.writeText(input);
  };

  const successCount = downloadResults.filter(r => r.status === 'success').length;
  const errorCount = downloadResults.filter(r => r.status === 'error').length;
  const progressPercentage = urls.length > 0 ? Math.round((completedCount / urls.length) * 100) : 0;
  const failedFiles = downloadResults.filter(r => r.status === 'error');

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>批量下载文件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="url-input">URL列表（每行一个）</Label>
                <Textarea
                  id="url-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请输入要下载的文件URL，每行一个&#10;例如：&#10;https://example.com/file1.pdf&#10;https://example.com/image.jpg"
                  rows={12}
                  className="font-mono mt-1"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={downloadFiles} disabled={isDownloading}>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {isDownloading ? '下载中...' : '开始下载'}
                </Button>
                <Button variant="secondary" onClick={clearAll} disabled={isDownloading}>
                  清空
                </Button>
                <Button variant="outline" onClick={loadExample} disabled={isDownloading}>
                  示例
                </Button>
                <Button variant="outline" onClick={copyToClipboard} disabled={!input}>
                  <CopyIcon className="mr-2 h-4 w-4" />
                  复制
                </Button>
              </div>

              {urls.length > 0 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <LinkIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">解析结果</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    共解析出 {urls.length} 个有效URL（已去重）
                  </p>
                  {isConcurrentMode && (
                    <div className="flex items-center gap-2 mt-2">
                      <ZapIcon className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-600 font-medium">已启用并发下载模式</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>下载状态</CardTitle>
              {downloadResults.length > 0 && (
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    成功: {successCount}
                  </Badge>
                  {errorCount > 0 && (
                    <Badge variant="destructive">
                      失败: {errorCount}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isDownloading && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">下载进度</span>
                  <span className="text-sm text-blue-600 font-semibold">{completedCount} / {urls.length}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-blue-600 mt-1">
                  进度: {progressPercentage}% ({completedCount} / {urls.length})
                </p>
              </div>
            )}

            {failedFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircleIcon className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">下载失败的文件</span>
                </div>
                {failedFiles.map((result, index) => (
                  <div key={index} className="p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircleIcon className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-700">{result.fileName}</span>
                    </div>
                    <p className="text-xs text-red-600 break-all">{result.url}</p>
                    <p className="text-xs text-red-500 mt-1">{result.error}</p>
                  </div>
                ))}
              </div>
            ) : downloadResults.length > 0 ? (
              <div className="text-center py-8 text-green-600">
                <FileIcon className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">所有文件下载成功！</p>
                <p className="text-sm text-green-500 mt-1">文件已打包为zip下载到本地</p>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>输入URL并点击开始下载</p>
                <p className="mt-2 text-sm">支持批量下载文件并打包为zip</p>
                <p className="mt-1 text-xs">超过50个URL时自动启用并发下载</p>
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

export default DownloadFiles; 