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

  const checkUrlValidity = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ url, isValid: true });
      img.onerror = () => resolve({ url, isValid: false, reason: '加载失败或非图片' });
      img.src = url;
    });
  };

  const handleDetect = async (urls) => {
    if (urls.length === 0) {
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
    setProgress(0);
    setTotalUrlsToProcess(urls.length);

    let processedCount = 0;
    const totalUrls = urls.length;
    const showProgress = totalUrls > 500;

    const promises = urls.map(url =>
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
    results.forEach(result => {
      if (result.isValid) {
        newValidUrls.push(result.url);
      } else {
        newInvalidUrls.push(result.url);
      }
    });

    setValidUrls(newValidUrls);
    setInvalidUrls(newInvalidUrls);
    setIsLoading(false);

    toast({
        title: "检测完成",
        description: `共检测了 ${totalUrls} 个URL，其中 ${newValidUrls.length} 个有效，${newInvalidUrls.length} 个无效。`,
    });

    setTimeout(() => {
      outputCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleDetectFromText = () => {
    const urls = inputUrls.split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length > 200) {
      toast({
        title: "提示",
        description: "文本框输入URL数量超过200个，请改用文件上传功能。",
        variant: "destructive",
      });
      return;
    }
    handleDetect(urls);
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
        setInputUrls(urlsFromFile.join('\n'));
        handleDetect(urlsFromFile);
        toast({
          title: "文件上传成功",
          description: `成功从文件中解析出 ${urlsFromFile.length} 个URL，点击“开始检测”进行处理。`,
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
        输入一批图片URL，工具会自动检测哪些URL是无效的。URL是否有效定义: URL能正常访问且返回的类型为图片类型。
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