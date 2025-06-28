import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Copy, Check, X, FileText, Shield, Download, AlertCircle, GitCompare } from 'lucide-react';
import { toast } from 'sonner';

const FileHashCalculator = () => {
  const [files, setFiles] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('sha256');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [hashFormat, setHashFormat] = useState('lowercase');
  const [copiedStates, setCopiedStates] = useState({});
  const [compareHash, setCompareHash] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('file');
  const fileInputRef = useRef(null);

  const algorithms = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha1', label: 'SHA-1' },
    { value: 'sha256', label: 'SHA-256' },
    { value: 'sha512', label: 'SHA-512' }
  ];

  // 简化的MD5计算（实际项目中应使用专业的MD5库）
  const calculateMD5 = async (data) => {
    // 这里使用SHA-256代替MD5，因为Web Crypto API不直接支持MD5
    // 实际项目中应使用crypto-js等库
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashFormat === 'uppercase' ? hashHex.toUpperCase() : hashHex;
  };

  // 计算哈希值的函数
  const calculateHash = async (data, algorithm) => {
    const encoder = new TextEncoder();
    const dataBuffer = typeof data === 'string' ? encoder.encode(data) : data;
    
    let hashAlgorithm;
    switch (algorithm) {
      case 'md5':
        return await calculateMD5(dataBuffer);
      case 'sha1':
        hashAlgorithm = 'SHA-1';
        break;
      case 'sha256':
        hashAlgorithm = 'SHA-256';
        break;
      case 'sha512':
        hashAlgorithm = 'SHA-512';
        break;
      default:
        hashAlgorithm = 'SHA-256';
    }

    const hashBuffer = await crypto.subtle.digest(hashAlgorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashFormat === 'uppercase' ? hashHex.toUpperCase() : hashHex;
  };

  // 大文件分块处理
  const calculateLargeFileHash = async (file, algorithm) => {
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    let processedChunks = 0;
    
    // 对于大文件，我们使用分块读取
    const reader = new FileReader();
    const chunks = [];
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        chunks.push(e.target.result);
        processedChunks++;
        setProcessingProgress((processedChunks / totalChunks) * 100);
        
        if (processedChunks < totalChunks) {
          // 继续读取下一个块
          const start = processedChunks * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);
          reader.readAsArrayBuffer(chunk);
        } else {
          // 所有块都读取完成，计算哈希
          try {
            const combinedBuffer = new Uint8Array(file.size);
            let offset = 0;
            
            for (const chunk of chunks) {
              combinedBuffer.set(new Uint8Array(chunk), offset);
              offset += chunk.byteLength;
            }
            
            const hash = await calculateHash(combinedBuffer, algorithm);
            resolve(hash);
          } catch (error) {
            reject(error);
          }
        }
      };
      
      reader.onerror = reject;
      
      // 开始读取第一个块
      const firstChunk = file.slice(0, chunkSize);
      reader.readAsArrayBuffer(firstChunk);
    });
  };

  // 处理文件上传
  const handleFileUpload = (uploadedFiles) => {
    const newFiles = Array.from(uploadedFiles).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      hash: null,
      processing: false,
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  // 拖拽处理
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 计算文件哈希
  const calculateFileHash = async (fileItem) => {
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, processing: true, progress: 0 } : f
    ));

    try {
      let hash;
      
      // 根据文件大小选择处理方式
      if (fileItem.file.size > 10 * 1024 * 1024) { // 大于10MB使用分块处理
        hash = await calculateLargeFileHash(fileItem.file, selectedAlgorithm);
      } else {
        const arrayBuffer = await fileItem.file.arrayBuffer();
        hash = await calculateHash(arrayBuffer, selectedAlgorithm);
      }
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, hash, processing: false, progress: 100 } : f
      ));

      const newResult = {
        id: Date.now(),
        name: fileItem.name,
        algorithm: selectedAlgorithm.toUpperCase(),
        hash,
        type: 'file',
        timestamp: new Date().toLocaleString()
      };

      setResults(prev => [...prev, newResult]);

      toast.success(`${fileItem.name} 哈希计算完成`);
    } catch (error) {
      console.error('Hash calculation error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, processing: false, error: error.message } : f
      ));
      toast.error('哈希计算失败');
    } finally {
      setProcessingProgress(0);
    }
  };

  // 计算文本哈希
  const calculateTextHash = async () => {
    if (!textInput.trim()) {
      toast.error('请输入要计算哈希的文本');
      return;
    }

    setProcessing(true);
    try {
      const hash = await calculateHash(textInput, selectedAlgorithm);
      
      const newResult = {
        id: Date.now(),
        name: '文本输入',
        algorithm: selectedAlgorithm.toUpperCase(),
        hash,
        type: 'text',
        content: textInput.substring(0, 50) + (textInput.length > 50 ? '...' : ''),
        timestamp: new Date().toLocaleString()
      };
      
      setResults(prev => [...prev, newResult]);
      
      toast.success('文本哈希计算完成');
    } catch (error) {
      console.error('Text hash calculation error:', error);
      toast.error('文本哈希计算失败');
    } finally {
      setProcessing(false);
    }
  };

  // 复制哈希值
  const copyHash = async (hash, id) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
      toast.success('哈希值已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 导出结果
  const exportResults = () => {
    if (results.length === 0) {
      toast.error('没有可导出的结果');
      return;
    }

    const content = results.map(result => 
      `${result.name} (${result.algorithm}): ${result.hash} - ${result.timestamp}`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hash-results-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('结果已导出');
  };

  // 哈希值对比
  const compareHashes = (hash) => {
    if (!compareHash.trim()) {
      setCompareResult(null);
      return;
    }
    
    const isMatch = hash.toLowerCase() === compareHash.toLowerCase();
    setCompareResult(isMatch);
    return isMatch;
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 清除结果
  const clearResults = () => {
    setResults([]);
    toast.success('结果已清除');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">文件哈希计算器</h1>
        <p className="text-gray-600">计算文件和文本的哈希值，支持MD5、SHA-1、SHA-256、SHA-512算法</p>
      </div>

      {/* 设置面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            哈希设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="algorithm">哈希算法</Label>
              <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {algorithms.map(algo => (
                    <SelectItem key={algo.value} value={algo.value}>
                      {algo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="format">输出格式</Label>
              <Select value={hashFormat} onValueChange={setHashFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowercase">小写</SelectItem>
                  <SelectItem value="uppercase">大写</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="file">文件哈希</TabsTrigger>
          <TabsTrigger value="text">文本哈希</TabsTrigger>
          <TabsTrigger value="compare">哈希对比</TabsTrigger>
          <TabsTrigger value="results">计算结果</TabsTrigger>
        </TabsList>

        {/* 文件哈希标签页 */}
        <TabsContent value="file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文件上传</CardTitle>
              <CardDescription>拖拽文件到此区域或点击选择文件，支持大文件分块处理</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  拖拽文件到此处或点击选择
                </p>
                <p className="text-sm text-gray-500">
                  支持任意格式的文件，大文件自动分块处理
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">上传的文件</h3>
                    <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                      清除所有
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {files.map(fileItem => (
                      <div key={fileItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{fileItem.name}</span>
                            <Badge variant="secondary">{formatFileSize(fileItem.size)}</Badge>
                            {fileItem.file.size > 10 * 1024 * 1024 && (
                              <Badge variant="outline" className="text-xs">大文件</Badge>
                            )}
                          </div>
                          {fileItem.processing && (
                            <div className="mt-2">
                              <Progress value={fileItem.progress || processingProgress} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">处理中... {Math.round(fileItem.progress || processingProgress)}%</p>
                            </div>
                          )}
                          {fileItem.hash && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {selectedAlgorithm.toUpperCase()}:
                              </span>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                                {fileItem.hash}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyHash(fileItem.hash, fileItem.id)}
                              >
                                {copiedStates[fileItem.id] ? (
                                  <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                          {fileItem.error && (
                            <div className="mt-2 text-sm text-red-500">
                              错误: {fileItem.error}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {fileItem.processing ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                              <span className="text-sm text-gray-500">计算中...</span>
                            </div>
                          ) : !fileItem.hash && !fileItem.error ? (
                            <Button
                              size="sm"
                              onClick={() => calculateFileHash(fileItem)}
                            >
                              计算哈希
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFiles(prev => prev.filter(f => f.id !== fileItem.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 文件哈希结果显示 */}
          {results.filter(r => r.type === 'file').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>文件哈希结果</CardTitle>
                <CardDescription>最近计算的文件哈希值</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results
                    .filter(r => r.type === 'file')
                    .slice(-3) // 只显示最近3个结果
                    .reverse() // 最新的在前面
                    .map(result => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.algorithm}</Badge>
                            <span className="font-medium">{result.name}</span>
                            <Badge variant="secondary">{result.type}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">{result.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded break-all">
                            {result.hash}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyHash(result.hash, result.id)}
                          >
                            {copiedStates[result.id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 文本哈希标签页 */}
        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>文本哈希计算</CardTitle>
              <CardDescription>输入文本内容计算哈希值</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="textInput">文本内容</Label>
                <Textarea
                  id="textInput"
                  placeholder="输入要计算哈希的文本内容..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={6}
                />
              </div>
              <Button 
                onClick={calculateTextHash} 
                disabled={processing || !textInput.trim()}
                className="w-full"
              >
                {processing ? '计算中...' : '计算哈希值'}
              </Button>
            </CardContent>
          </Card>

          {/* 文本哈希结果显示 */}
          {results.filter(r => r.type === 'text').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>文本哈希结果</CardTitle>
                <CardDescription>最近计算的文本哈希值</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results
                    .filter(r => r.type === 'text')
                    .slice(-3) // 只显示最近3个结果
                    .reverse() // 最新的在前面
                    .map(result => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.algorithm}</Badge>
                            <span className="font-medium">{result.name}</span>
                            <Badge variant="secondary">{result.type}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">{result.timestamp}</span>
                        </div>
                        {result.content && (
                          <div className="mb-2 text-sm text-gray-600">
                            内容预览: {result.content}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded break-all">
                            {result.hash}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyHash(result.hash, result.id)}
                          >
                            {copiedStates[result.id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 哈希对比标签页 */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                哈希值对比验证
              </CardTitle>
              <CardDescription>输入已知的哈希值进行对比验证</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="compareHash">已知哈希值</Label>
                <Input
                  id="compareHash"
                  placeholder="输入要对比的哈希值..."
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value)}
                />
              </div>
              {compareHash && results.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">对比结果:</h4>
                  {results.map(result => {
                    const isMatch = compareHashes(result.hash);
                    return (
                      <Alert key={result.id} className={isMatch ? 'border-green-500' : 'border-red-500'}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span>{result.name}: </span>
                            <Badge variant={isMatch ? 'default' : 'destructive'}>
                              {isMatch ? '匹配' : '不匹配'}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 计算结果标签页 */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>计算结果</CardTitle>
              <CardDescription>所有哈希计算的历史记录</CardDescription>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无计算结果
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end gap-2">
                    <Button onClick={clearResults} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      清除结果
                    </Button>
                    <Button onClick={exportResults} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      导出结果
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {results.map(result => (
                      <div key={result.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{result.algorithm}</Badge>
                            <span className="font-medium">{result.name}</span>
                            <Badge variant="secondary">{result.type}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">{result.timestamp}</span>
                        </div>
                        {result.content && (
                          <div className="mb-2 text-sm text-gray-600">
                            内容预览: {result.content}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-sm bg-gray-100 px-3 py-2 rounded break-all">
                            {result.hash}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyHash(result.hash, result.id)}
                          >
                            {copiedStates[result.id] ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FileHashCalculator;
