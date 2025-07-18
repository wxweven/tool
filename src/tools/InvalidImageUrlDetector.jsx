import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Search, Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import { Progress } from "@/components/ui/progress";

const InvalidImageUrlDetector = () => {
  const [inputUrls, setInputUrls] = useState('');
  const [invalidUrls, setInvalidUrls] = useState([]);
  const [validUrls, setValidUrls] = useState([]);
  const [uncertainUrls, setUncertainUrls] = useState([]); // 新增：无法验证的URL
  const [isLoading, setIsLoading] = useState(false);
  const [lineCount, setLineCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalUrlsToProcess, setTotalUrlsToProcess] = useState(0);
  const { toast } = useToast();
  const lineCounterRef = React.useRef(null);
  const textareaRef = React.useRef(null);
  const outputCardRef = React.useRef(null);

  React.useEffect(() => {
    const lines = inputUrls.split('\n').length;
    setLineCount(lines);
  }, [inputUrls]);

  const handleTextareaScroll = () => {
    if (lineCounterRef.current && textareaRef.current) {
      lineCounterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const checkUrlValidity = (url, timeout = 8000) => {
    return new Promise((resolve) => {
      // 首先尝试使用Image对象加载
      const img = new Image();
      let isResolved = false;

      // 设置超时
      const timer = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          // 超时后尝试fetch验证
          checkUrlWithFetch(url).then(result => resolve(result));
        }
      }, timeout);

      img.onload = () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          resolve({ url, isValid: true, method: 'image' });
        }
      };

      img.onerror = () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          // 图片加载失败，尝试fetch验证
          checkUrlWithFetch(url).then(result => resolve(result));
        }
      };

      // 尝试设置crossOrigin属性避免某些CORS问题
      try {
        img.crossOrigin = 'anonymous';
      } catch (e) {
        // 忽略crossOrigin设置失败
      }

      img.src = url;
    });
  };

  const checkUrlWithFetch = async (url) => {
    try {
      // 首先尝试HEAD请求（更轻量）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Image-Validator/1.0)'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('image/')) {
            return { url, isValid: true, method: 'fetch-head', contentType };
          } else {
            return { url, isValid: false, reason: '非图片类型', method: 'fetch-head', contentType };
          }
        } else {
          return { url, isValid: false, reason: `HTTP ${response.status}`, method: 'fetch-head' };
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        // 检查是否是CORS错误或网络错误
        if (fetchError.name === 'TypeError' && fetchError.message.includes('CORS')) {
          return { url, isValid: null, isUncertain: true, reason: 'CORS限制', method: 'fetch-cors' };
        }

        // 如果HEAD请求失败，尝试GET请求（某些服务器不支持HEAD）
        if (fetchError.name !== 'AbortError') {
          try {
            const getController = new AbortController();
            const getTimeoutId = setTimeout(() => getController.abort(), 5000);

            const getResponse = await fetch(url, {
              method: 'GET',
              signal: getController.signal,
              headers: {
                'Range': 'bytes=0-1023', // 只请求前1KB
                'User-Agent': 'Mozilla/5.0 (compatible; Image-Validator/1.0)'
              }
            });

            clearTimeout(getTimeoutId);

            if (getResponse.ok || getResponse.status === 206) {
              const contentType = getResponse.headers.get('content-type');
              if (contentType && contentType.startsWith('image/')) {
                return { url, isValid: true, method: 'fetch-get', contentType };
              } else {
                return { url, isValid: false, reason: '非图片类型', method: 'fetch-get', contentType };
              }
            }
          } catch (getError) {
            // 检查GET请求是否也是CORS错误
            if (getError.name === 'TypeError' && getError.message.includes('CORS')) {
              return { url, isValid: null, isUncertain: true, reason: 'CORS限制', method: 'fetch-cors' };
            }
          }
        }

        // 对于网络错误等，检查URL格式来判断是否可能有效
        if (isLikelyImageUrl(url)) {
          return { url, isValid: null, isUncertain: true, reason: '网络限制或CORS', method: 'network-restricted' };
        } else {
          return { url, isValid: false, reason: '网络错误', method: 'fetch-failed' };
        }
      }
    } catch (error) {
      // 对于其他错误，如果URL看起来像图片URL，标记为不确定
      if (isLikelyImageUrl(url)) {
        return { url, isValid: null, isUncertain: true, reason: '无法验证', method: 'error-uncertain' };
      }
      return { url, isValid: false, reason: '网络异常', method: 'fetch-error' };
    }
  };

  const isLikelyImageUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico'];

      // 检查文件扩展名
      if (imageExtensions.some(ext => pathname.endsWith(ext))) {
        return true;
      }

      // 检查URL中是否包含图片相关的关键词
      const imageKeywords = ['image', 'img', 'photo', 'pic', 'picture', 'avatar', 'thumbnail'];
      const fullUrl = url.toLowerCase();

      return imageKeywords.some(keyword => fullUrl.includes(keyword));
    } catch (e) {
      return false;
    }
  };

  const handleDetect = async (rawUrls) => {
    const uniqueUrls = [...new Set(rawUrls.filter(url => url))];
    if (uniqueUrls.length === 0) {
      toast({
        title: "提示",
        description: "请输入或上传至少一个URL。",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setInvalidUrls([]);
    setValidUrls([]);
    setUncertainUrls([]); // 清空无法验证的URL
    setProgress(0);
    setTotalUrlsToProcess(uniqueUrls.length);

    let processedCount = 0;
    const totalUrls = uniqueUrls.length;
    const showProgress = totalUrls > 500;

    const promises = uniqueUrls.map(url =>
      checkUrlValidity(url)
        .catch(err => ({ url, isValid: false, reason: '检测异常' }))
        .finally(() => {
          if (showProgress) {
            processedCount++;
            setProgress((processedCount / totalUrls) * 100);
          }
        })
    );
    const results = await Promise.all(promises);

    const newValidUrls = [];
    const newInvalidUrls = [];
    const newUncertainUrls = [];
    results.forEach(result => {
      if (result.isValid === true) {
        newValidUrls.push(result.url);
      } else if (result.isValid === false) {
        // 为无效URL添加详细信息
        const reasonInfo = result.reason ? ` (${result.reason})` : '';
        const methodInfo = result.method ? ` [${result.method}]` : '';
        newInvalidUrls.push(`${result.url}${reasonInfo}${methodInfo}`);
      } else if (result.isUncertain) {
        // 无法验证的URL
        const reasonInfo = result.reason ? ` (${result.reason})` : '';
        const methodInfo = result.method ? ` [${result.method}]` : '';
        newUncertainUrls.push(`${result.url}${reasonInfo}${methodInfo}`);
      }
    });

    setValidUrls(newValidUrls);
    setInvalidUrls(newInvalidUrls);
    setUncertainUrls(newUncertainUrls);
    setIsLoading(false);

    const corsCount = results.filter(r => r.reason && r.reason.includes('CORS')).length;
    const corsWarning = corsCount > 0 ?
      `\n注意：有 ${corsCount} 个URL因CORS限制无法验证，可能实际有效。` : '';

    toast({
        title: "检测完成",
        description: `共检测了 ${totalUrls} 个URL，其中 ${newValidUrls.length} 个有效，${newInvalidUrls.length} 个无效，${newUncertainUrls.length} 个无法验证。${corsWarning}`,
    });

    setTimeout(() => {
      outputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleDetectFromText = () => {
    const rawUrls = inputUrls.split('\n').map(url => url.trim());
    const uniqueUrls = [...new Set(rawUrls.filter(url => url))];
    if (uniqueUrls.length > 200) {
      toast({
        title: "提示",
        description: "文本框输入URL数量超过200个，请改用文件上传功能。",
        variant: "destructive",
      });
      return;
    }
    handleDetect(uniqueUrls);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const urlsFromFile = json.map(row => row[0]).filter(url => typeof url === 'string' && url.trim().startsWith('http'));
        const uniqueUrlsFromFile = [...new Set(urlsFromFile)];
        setInputUrls(uniqueUrlsFromFile.join('\n'));
        handleDetect(uniqueUrlsFromFile);
        toast({
          title: "文件上传成功",
          description: `成功从文件中解析出 ${uniqueUrlsFromFile.length} 个URL，点击“开始检测”进行处理。`,
        });
      } catch (error) {
        console.error("Error parsing file: ", error);
        toast({
          title: "文件解析失败",
          description: "请确保上传的是格式正确的Excel或CSV文件。",
          variant: "destructive",
        });
      }
    };
    reader.onerror = () => {
       toast({
          title: "文件读取失败",
          description: "读取文件时发生错误。",
          variant: "destructive",
        });
    };
    reader.readAsArrayBuffer(file);
    // 重置file input，以便可以再次上传同名文件
    event.target.value = null;
  };

  const handleDownload = (urls, filename) => {
    if (urls.length === 0) {
      toast({
        title: "提示",
        description: "没有URL可供下载。",
      });
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8,"
      + "URL\n"
      + urls.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = (urls, type) => {
    if (urls.length === 0) {
      toast({
        title: "提示",
        description: "没有内容可供复制。",
      });
      return;
    }
    navigator.clipboard.writeText(urls.join('\n')).then(() => {
      setCopied(type);
      toast({
        title: "成功",
        description: `${type} URL已复制到剪贴板。`,
      });
      setTimeout(() => setCopied(false), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      toast({
        title: "失败",
        description: "复制失败，请检查浏览器权限。",
        variant: "destructive",
      });
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold">无效图片URL检测工具</h1>
      <p className="text-muted-foreground">
        输入一批图片URL，工具会自动检测哪些URL是无效的。检测方法：首先尝试图片加载，如果失败则使用HTTP请求验证。
        <br />
        <span className="text-sm">
          结果分为三类：<strong>有效</strong>（可正常访问的图片）、<strong>无效</strong>（确认无法访问或非图片）、<strong>无法验证</strong>（因CORS限制等无法验证但可能有效）。
        </span>
      </p>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex-grow flex border rounded-md h-60">
              <div
                ref={lineCounterRef}
                className="p-2 text-right bg-muted text-muted-foreground select-none overflow-y-hidden"
                style={{ fontFamily: 'monospace' }}
              >
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <Textarea
                ref={textareaRef}
                placeholder="每行输入一个图片URL，最多支持200个（文件上传无此限制）。"
                value={inputUrls}
                onChange={(e) => setInputUrls(e.target.value)}
                onScroll={handleTextareaScroll}
                className="flex-grow rounded-none border-0 whitespace-pre overflow-auto h-full"
                style={{ fontFamily: 'monospace', resize: 'none' }}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button onClick={handleDetectFromText} disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? '检测中...' : '开始检测'}
              </Button>
              <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => document.getElementById('file-upload').click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      上传文件
                  </Button>
                  <input type="file" id="file-upload" className="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && totalUrlsToProcess > 500 && (
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              正在处理 {totalUrlsToProcess} 个URL，请稍候...
            </p>
            <Progress value={progress} />
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>有效的URL ({validUrls.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopy(validUrls, 'valid')} disabled={validUrls.length === 0}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied === 'valid' ? '已复制' : '复制结果'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(validUrls, 'valid_urls.csv')} disabled={validUrls.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  下载结果
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              readOnly
              value={validUrls.join('\n')}
              placeholder="这里将显示检测出的有效URL。"
              className="h-60"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>无法验证的URL ({uncertainUrls.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopy(uncertainUrls, 'uncertain')} disabled={uncertainUrls.length === 0}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied === 'uncertain' ? '已复制' : '复制结果'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(uncertainUrls, 'uncertain_urls.csv')} disabled={uncertainUrls.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  下载结果
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              readOnly
              value={uncertainUrls.join('\n')}
              placeholder="这里将显示无法通过图片加载或HTTP请求验证的URL。"
              className="h-60"
            />
          </CardContent>
        </Card>

        <Card ref={outputCardRef}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>无效的URL ({invalidUrls.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopy(invalidUrls, 'invalid')} disabled={invalidUrls.length === 0}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copied === 'invalid' ? '已复制' : '复制结果'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownload(invalidUrls, 'invalid_urls.csv')} disabled={invalidUrls.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  下载结果
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              readOnly
              value={invalidUrls.join('\n')}
              placeholder="这里将显示检测出的无效URL。"
              className="h-60"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvalidImageUrlDetector;