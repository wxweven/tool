import React, { useState, useRef, useCallback } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Trash2, 
  Settings,
  FileImage,
  Zap,
  RotateCcw,
  Eye,
  ArrowUp,
  HelpCircle,
  MessageCircle
} from "lucide-react";

const ImageCompressor = () => {
  // 文件状态
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // 压缩设置
  const [quality, setQuality] = useState([80]);
  const [format, setFormat] = useState('original');
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizeMode, setResizeMode] = useState('percentage');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [resizePercentage, setResizePercentage] = useState([100]);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [keepExif, setKeepExif] = useState(false);
  
  // 界面状态
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  
  // 支持的文件格式
  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const formatOptions = [
    { value: 'original', label: '保持原格式' },
    { value: 'image/jpeg', label: 'JPEG' },
    { value: 'image/png', label: 'PNG' },
    { value: 'image/webp', label: 'WebP' }
  ];
  
  // 文件大小格式化
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 计算压缩率
  const getCompressionRatio = (originalSize, compressedSize) => {
    if (!originalSize || !compressedSize) return 0;
    return Math.round((1 - compressedSize / originalSize) * 100);
  };
  
  // 处理文件选择
  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter(file => 
      supportedFormats.includes(file.type)
    ).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
      compressed: null,
      compressedSize: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };
  
  // 拖拽处理
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);
  
  // 压缩单个图片
  const compressImage = async (fileItem) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // 计算新尺寸
        if (resizeEnabled) {
          if (resizeMode === 'percentage') {
            const scale = resizePercentage[0] / 100;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          } else {
            const newWidth = parseInt(resizeWidth) || width;
            const newHeight = parseInt(resizeHeight) || height;
            
            if (keepAspectRatio) {
              const aspectRatio = img.width / img.height;
              if (resizeWidth && !resizeHeight) {
                width = newWidth;
                height = Math.round(newWidth / aspectRatio);
              } else if (resizeHeight && !resizeWidth) {
                height = newHeight;
                width = Math.round(newHeight * aspectRatio);
              } else {
                width = newWidth;
                height = newHeight;
              }
            } else {
              width = newWidth;
              height = newHeight;
            }
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 确定输出格式
        let outputFormat = format === 'original' ? fileItem.type : format;
        if (outputFormat === 'image/gif') {
          outputFormat = 'image/png'; // GIF转PNG
        }
        
        // 转换为Blob
        canvas.toBlob((blob) => {
          resolve({
            blob,
            size: blob.size,
            format: outputFormat,
            width,
            height
          });
        }, outputFormat, quality[0] / 100);
      };
      
      img.src = fileItem.preview;
    });
  };
  
  // 批量压缩
  const handleBatchCompress = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;
    
    setProcessing(true);
    setProgress(0);
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const fileItem = pendingFiles[i];
      
      try {
        // 更新状态为处理中
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'processing' } : f
        ));
        
        const result = await compressImage(fileItem);
        
        // 更新文件状态
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? {
            ...f,
            compressed: result.blob,
            compressedSize: result.size,
            compressedFormat: result.format,
            compressedDimensions: { width: result.width, height: result.height },
            status: 'completed'
          } : f
        ));
        
      } catch (error) {
        console.error('压缩失败:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' } : f
        ));
      }
      
      setProgress(((i + 1) / pendingFiles.length) * 100);
    }
    
    setProcessing(false);
    setProgress(0);
  };
  
  // 下载单个文件
  const downloadFile = (fileItem) => {
    if (!fileItem.compressed) return;
    
    const url = URL.createObjectURL(fileItem.compressed);
    const a = document.createElement('a');
    a.href = url;
    
    // 生成文件名
    const originalName = fileItem.name.split('.').slice(0, -1).join('.');
    const extension = fileItem.compressedFormat.split('/')[1];
    a.download = `${originalName}_compressed.${extension}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 下载所有文件
  const downloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return;
    
    // 创建ZIP文件（简化版，这里逐个下载）
    for (const fileItem of completedFiles) {
      downloadFile(fileItem);
      await new Promise(resolve => setTimeout(resolve, 100)); // 避免同时下载过多
    }
  };
  
  // 清空文件列表
  const clearFiles = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  };
  
  // 删除单个文件
  const removeFile = (id) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return updated;
    });
  };
  
  // 重置文件状态
  const resetFileStatus = (id) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'pending', compressed: null, compressedSize: 0 } : f
    ));
  };
  
  // 滚动监听
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // 测试示例
  const loadTestExample = () => {
    // 创建一个测试用的Canvas图片
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // 绘制测试图案
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(0.5, '#4ecdc4');
    gradient.addColorStop(1, '#45b7d1');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    ctx.fillStyle = '#fff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('测试图片', 400, 300);
    ctx.font = '24px Arial';
    ctx.fillText('800x600 像素', 400, 350);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'test-image.png', { type: 'image/png' });
      handleFileSelect([file]);
    }, 'image/png', 0.9);
  };
  
  const completedFiles = files.filter(f => f.status === 'completed');
  const totalOriginalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalCompressedSize = completedFiles.reduce((sum, f) => sum + f.compressedSize, 0);
  
  return (
    <div ref={containerRef} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">图片压缩工具</h2>
        <p className="text-muted-foreground">在线压缩图片，支持多种格式和批量处理，有效减小文件大小</p>
      </div>

      <Tabs defaultValue="compress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compress">图片压缩</TabsTrigger>
          <TabsTrigger value="settings">压缩设置</TabsTrigger>
          <TabsTrigger value="batch">批量处理</TabsTrigger>
        </TabsList>

        <TabsContent value="compress" className="space-y-6">
          {/* 上传区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                上传图片
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">拖拽图片到此处或点击选择文件</p>
                <p className="text-sm text-gray-500 mb-4">
                  支持 JPG、PNG、WebP、GIF 格式，单个文件最大 10MB
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    选择文件
                  </Button>
                  <Button variant="outline" onClick={loadTestExample}>
                    加载测试示例
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* 文件列表 */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileImage className="h-5 w-5" />
                    图片列表 ({files.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBatchCompress}
                      disabled={processing || files.every(f => f.status !== 'pending')}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {processing ? '压缩中...' : '开始压缩'}
                    </Button>
                    <Button variant="outline" onClick={clearFiles}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      清空
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {processing && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">压缩进度</span>
                      <span className="text-sm">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {files.map((fileItem) => (
                    <div key={fileItem.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      {/* 缩略图 */}
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={fileItem.preview}
                          alt={fileItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 文件信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{fileItem.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(fileItem.size)} • {fileItem.type.split('/')[1].toUpperCase()}
                        </div>
                        {fileItem.compressed && (
                          <div className="text-sm text-green-600">
                            压缩后: {formatFileSize(fileItem.compressedSize)} 
                            ({getCompressionRatio(fileItem.size, fileItem.compressedSize)}% 压缩)
                          </div>
                        )}
                      </div>

                      {/* 状态标识 */}
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            fileItem.status === 'completed' ? 'default' :
                            fileItem.status === 'processing' ? 'secondary' :
                            fileItem.status === 'error' ? 'destructive' : 'outline'
                          }
                        >
                          {fileItem.status === 'completed' ? '已完成' :
                           fileItem.status === 'processing' ? '处理中' :
                           fileItem.status === 'error' ? '失败' : '待处理'}
                        </Badge>

                        {/* 操作按钮 */}
                        {fileItem.status === 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => downloadFile(fileItem)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            下载
                          </Button>
                        )}
                        
                        {fileItem.status === 'error' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetFileStatus(fileItem.id)}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            重试
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 统计信息 */}
                {completedFiles.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{completedFiles.length}</div>
                        <div className="text-sm text-gray-600">已完成</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          {formatFileSize(totalOriginalSize)}
                        </div>
                        <div className="text-sm text-gray-600">原始大小</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {formatFileSize(totalCompressedSize)}
                        </div>
                        <div className="text-sm text-gray-600">
                          压缩后 ({getCompressionRatio(totalOriginalSize, totalCompressedSize)}% 节省)
                        </div>
                      </div>
                    </div>
                    
                    {completedFiles.length > 1 && (
                      <div className="mt-4 text-center">
                        <Button onClick={downloadAll}>
                          <Download className="h-4 w-4 mr-2" />
                          下载全部
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 压缩设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  压缩设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 压缩质量 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>压缩质量</Label>
                    <Badge variant="outline">{quality[0]}%</Badge>
                  </div>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>最小文件</span>
                    <span>最高质量</span>
                  </div>
                </div>

                {/* 输出格式 */}
                <div className="space-y-3">
                  <Label>输出格式</Label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    {formatOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 保持EXIF信息 */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keepExif"
                    checked={keepExif}
                    onCheckedChange={setKeepExif}
                  />
                  <Label htmlFor="keepExif">保持EXIF信息</Label>
                </div>
              </CardContent>
            </Card>

            {/* 尺寸调整 */}
            <Card>
              <CardHeader>
                <CardTitle>尺寸调整</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resizeEnabled"
                    checked={resizeEnabled}
                    onCheckedChange={setResizeEnabled}
                  />
                  <Label htmlFor="resizeEnabled">启用尺寸调整</Label>
                </div>

                {resizeEnabled && (
                  <div className="space-y-4">
                    {/* 调整模式 */}
                    <div className="space-y-2">
                      <Label>调整模式</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={resizeMode === 'percentage' ? 'default' : 'outline'}
                          onClick={() => setResizeMode('percentage')}
                        >
                          百分比
                        </Button>
                        <Button
                          size="sm"
                          variant={resizeMode === 'pixels' ? 'default' : 'outline'}
                          onClick={() => setResizeMode('pixels')}
                        >
                          像素
                        </Button>
                      </div>
                    </div>

                    {resizeMode === 'percentage' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>缩放比例</Label>
                          <Badge variant="outline">{resizePercentage[0]}%</Badge>
                        </div>
                        <Slider
                          value={resizePercentage}
                          onValueChange={setResizePercentage}
                          max={200}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>宽度 (px)</Label>
                            <Input
                              type="number"
                              value={resizeWidth}
                              onChange={(e) => setResizeWidth(e.target.value)}
                              placeholder="宽度"
                            />
                          </div>
                          <div>
                            <Label>高度 (px)</Label>
                            <Input
                              type="number"
                              value={resizeHeight}
                              onChange={(e) => setResizeHeight(e.target.value)}
                              placeholder="高度"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="keepAspectRatio"
                            checked={keepAspectRatio}
                            onCheckedChange={setKeepAspectRatio}
                          />
                          <Label htmlFor="keepAspectRatio">保持宽高比</Label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>批量处理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <ImageIcon className="h-4 w-4" />
                <AlertDescription>
                  批量处理功能可以同时压缩多张图片，应用相同的压缩设置。
                  建议一次处理不超过20张图片以获得最佳性能。
                </AlertDescription>
              </Alert>

              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{files.length}</div>
                      <div className="text-sm text-gray-600">总文件数</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {files.filter(f => f.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600">待处理</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {completedFiles.length}
                      </div>
                      <div className="text-sm text-gray-600">已完成</div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleBatchCompress}
                      disabled={processing || files.every(f => f.status !== 'pending')}
                      size="lg"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      批量压缩
                    </Button>
                    {completedFiles.length > 0 && (
                      <Button onClick={downloadAll} variant="outline" size="lg">
                        <Download className="h-4 w-4 mr-2" />
                        下载全部
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• <strong>支持格式：</strong>JPEG、PNG、WebP、GIF（GIF会转换为PNG）</div>
          <div>• <strong>压缩质量：</strong>1-100%，数值越高质量越好但文件越大</div>
          <div>• <strong>尺寸调整：</strong>支持按百分比或像素值调整图片尺寸</div>
          <div>• <strong>批量处理：</strong>可同时处理多张图片，建议单次不超过20张</div>
          <div>• <strong>格式转换：</strong>可将图片转换为其他支持的格式</div>
          <div>• <strong>本地处理：</strong>所有处理都在浏览器中完成，图片不会上传到服务器</div>
        </CardContent>
      </Card>

      {/* 滚动到顶部按钮 */}
      {showScrollTop && (
        <Button
          className="fixed bottom-20 right-6 rounded-full w-12 h-12 shadow-lg z-50"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {/* 底部按钮 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        <Button
          variant="outline"
          className="rounded-full w-12 h-12 shadow-lg"
          onClick={() => setShowFeedback(true)}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="rounded-full w-12 h-12 shadow-lg"
          onClick={() => setShowAbout(true)}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>

      {/* 反馈弹窗 */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>意见反馈</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                如果您在使用过程中遇到问题或有改进建议，请通过以下方式联系我们：
              </p>
              <div className="space-y-2 text-sm">
                <div>📧 邮箱：feedback@example.com</div>
                <div>💬 微信：toolbox_feedback</div>
                <div>🐛 GitHub：提交 Issue</div>
              </div>
              <Button onClick={() => setShowFeedback(false)} className="w-full">
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 关于弹窗 */}
      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>关于图片压缩工具</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><strong>版本：</strong>1.0.0</p>
                <p><strong>功能：</strong>在线图片压缩和格式转换</p>
                <p><strong>特点：</strong>本地处理，保护隐私</p>
                <p><strong>技术：</strong>HTML5 Canvas API</p>
                <p><strong>开源：</strong>MIT License</p>
              </div>
              <Button onClick={() => setShowAbout(false)} className="w-full">
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor; 