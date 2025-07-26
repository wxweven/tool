import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Download, AlertCircle, FileText, Archive } from 'lucide-react';
import { toast } from 'sonner';
import JSZip from 'jszip';

const FileSplitter = () => {
  const [file, setFile] = useState(null);
  const [splitLines, setSplitLines] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/plain' && !selectedFile.name.endsWith('.txt')) {
        setError('请选择文本文件 (.txt)');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      setError('');
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSplitLinesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSplitLines(value);
    }
  };

  const processText = async (content) => {
    setProcessing(true);
    setError('');
    setResults([]);
    
    try {
      // 按行分割文本
      const lines = content.split('\n');
      const totalLines = lines.length;
      
      // 计算需要分割成多少个文件
      const fileCount = Math.ceil(totalLines / splitLines);
      
      const newResults = [];
      
      for (let i = 0; i < fileCount; i++) {
        const start = i * splitLines;
        const end = Math.min(start + splitLines, totalLines);
        const chunkLines = lines.slice(start, end);
        const chunkContent = chunkLines.join('\n');
        
        const result = {
          id: i + 1,
          name: `${fileName}_part${i + 1}.txt`,
          content: chunkContent,
          lineCount: chunkLines.length
        };
        
        newResults.push(result);
      }
      
      setResults(newResults);
      toast.success(`文件分割成功，共生成 ${fileCount} 个文件`);
    } catch (err) {
      setError('处理文件时发生错误: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessFile = async () => {
    if (!file) {
      setError('请选择一个文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      await processText(content);
    };
    reader.onerror = () => {
      setError('读取文件时发生错误');
    };
    reader.readAsText(file);
  };

  const handleProcessText = async () => {
    if (!text.trim()) {
      setError('请输入文本内容');
      return;
    }
    
    setFileName('text_input');
    await processText(text);
  };

  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    results.forEach((result, index) => {
      setTimeout(() => {
        downloadFile(result.content, result.name);
      }, index * 100); // 添加小延迟以避免浏览器阻止多个下载
    });
  };

  const downloadAsZip = async () => {
    try {
      const zip = new JSZip();
      
      // 添加所有文件到 zip
      results.forEach(result => {
        zip.file(result.name, result.content);
      });
      
      // 生成 zip 文件
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      // 下载 zip 文件
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `${fileName || 'split_files'}_all.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
      
      toast.success('ZIP 文件下载成功');
    } catch (error) {
      console.error('创建 ZIP 文件时发生错误:', error);
      toast.error('创建 ZIP 文件时发生错误');
    }
  };

  const resetAll = () => {
    setFile(null);
    setText('');
    setResults([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            文件分割工具
          </CardTitle>
          <CardDescription>
            将大文本文件按指定行数拆分成多个小文件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="splitLines">每文件行数</Label>
              <Input
                id="splitLines"
                type="number"
                min="1"
                value={splitLines}
                onChange={handleSplitLinesChange}
                placeholder="输入每个文件的行数"
              />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 文件上传方式 */}
                <div className="space-y-4">
                  <h3 className="font-medium">方式一：上传文件</h3>
                  <div className="space-y-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      选择文件
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,text/plain"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file && (
                      <div className="text-sm text-muted-foreground">
                        已选择: {file.name}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleProcessFile}
                    disabled={processing || !file}
                    className="w-full"
                  >
                    {processing ? '处理中...' : '分割文件'}
                  </Button>
                </div>
                
                {/* 文本输入方式 */}
                <div className="space-y-4">
                  <h3 className="font-medium">方式二：直接输入文本</h3>
                  <div className="space-y-2">
                    <Textarea
                      value={text}
                      onChange={handleTextChange}
                      placeholder="在此输入文本内容..."
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleProcessText}
                    disabled={processing || !text.trim()}
                    className="w-full"
                  >
                    {processing ? '处理中...' : '分割文本'}
                  </Button>
                </div>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetAll}
              >
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 结果展示 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>分割结果</CardTitle>
            <CardDescription>
              共生成 {results.length} 个文件
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadAll}>
                <Download className="mr-2 h-4 w-4" />
                分别下载
              </Button>
              <Button onClick={downloadAsZip} variant="secondary">
                <Archive className="mr-2 h-4 w-4" />
                打包下载(ZIP)
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.lineCount} 行
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => downloadFile(result.content, result.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileSplitter;