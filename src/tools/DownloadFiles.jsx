import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, Wand2Icon, DownloadIcon, ChevronUpIcon, LinkIcon, FileIcon, AlertCircleIcon, ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DownloadFiles = () => {
  const [input, setInput] = useState("");
  const [urls, setUrls] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});
  const [downloadResults, setDownloadResults] = useState([]);
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);
  const [isConcurrentMode, setIsConcurrentMode] = useState(false);

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
    if (!input.trim()) return;

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

    setUrls(uniqueUrls);
    // 检查是否需要并发模式
    setIsConcurrentMode(uniqueUrls.length > 50);
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
    if (urls.length === 0) {
      alert('请先输入有效的URL');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress({});
    setDownloadResults([]);

    const results = [];
    const downloadedFiles = [];

    if (isConcurrentMode) {
      // 并发下载模式
      const batchSize = 10; // 每批10个并发
      const batches = [];
      
      for (let i = 0; i < urls.length; i += batchSize) {
        batches.push(urls.slice(i, i + batchSize));
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
      }
    } else {
      // 顺序下载模式
      for (let i = 0; i < urls.length; i++) {
        const result = await downloadSingleFile(urls[i]);
        results.push(result);
        
        if (result.status === 'success' && result.blob) {
          downloadedFiles.push({ name: result.fileName, blob: result.blob });
        }
      }
    }

    setDownloadResults(results);

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
  };

  const copyToClipboard = () => {
    if (!input) return;
    navigator.clipboard.writeText(input);
  };

  const successCount = downloadResults.filter(r => r.status === 'success').length;
  const errorCount = downloadResults.filter(r => r.status === 'error').length;

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
                <Button onClick={parseUrls} disabled={isDownloading}>
                  <Wand2Icon className="mr-2 h-4 w-4" />
                  解析URL
                </Button>
                <Button onClick={downloadFiles} disabled={urls.length === 0 || isDownloading}>
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
            {downloadResults.length > 0 ? (
              <div className="space-y-3">
                {downloadResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {result.status === 'success' ? (
                          <FileIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircleIcon className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium truncate">{result.fileName}</span>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status === 'success' ? '成功' : '失败'}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{result.url}</p>
                      {result.status === 'success' && (
                        <p className="text-xs text-gray-400">
                          大小: {(result.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                      {result.status === 'error' && (
                        <p className="text-xs text-red-500">{result.error}</p>
                      )}
                    </div>
                    {downloadProgress[result.url]?.status === 'downloading' && (
                      <div className="ml-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>输入URL并点击解析按钮</p>
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