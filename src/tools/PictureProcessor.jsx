import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Progress } from "../components/ui/progress";
import { Checkbox } from "../components/ui/checkbox";
import {
  Download,
  FileImage,
  Settings,
  Trash2,
  RotateCcw,
  ArrowUp,
  HelpCircle,
  MessageCircle,
  UploadCloud,
  FilePlus2,
  Trash,
  Play,
  Settings2,
  FileText,
} from "lucide-react";

// 导入 pdfjs-dist
import * as pdfjsLib from 'pdfjs-dist';

// 设置 worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PictureProcessor = () => {
  // 文件状态
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("processor");
  const [processing, setProcessing] = useState(false);
  const [currentProcessingFile, setCurrentProcessingFile] = useState(null);
  
  // PDF转换设置
  const [outputFormat, setOutputFormat] = useState('png');
  const [quality, setQuality] = useState([90]);
  const [scale, setScale] = useState(2); // 缩放比例，2表示2倍分辨率
  const [autoConvert, setAutoConvert] = useState(true); // 自动转换选项
  
  // 图片转换设置
  const [imageOutputFormat, setImageOutputFormat] = useState('original');
  const [imageQuality, setImageQuality] = useState([90]);
  
  // 界面状态
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newFiles = selectedFiles.map(file => {
      const isPdf = file.type === 'application/pdf';
      return {
        id: self.crypto.randomUUID(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        isPdf: isPdf,
        status: 'pending',
        numPages: 0,
        selectedPages: new Set(),
        convertedImages: [],
        errorMessage: null,
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 自动处理PDF文件
    for (const fileItem of newFiles) {
      if (fileItem.isPdf) {
        await autoProcessPdf(fileItem);
      }
    }
  };

  // 自动处理PDF：加载 -> 选择所有页面 -> (可选)自动转换
  const autoProcessPdf = async (fileItem) => {
    try {
      // 1. 自动加载PDF
      const pdf = await loadPdfDocument(fileItem);
      if (!pdf) return;

      // 2. 自动选择所有页面
      const allPages = new Set(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, selectedPages: allPages, pdfDoc: pdf }
          : f
      ));

      // 3. 如果开启了自动转换，则开始转换
      if (autoConvert && !processing) {
        // 稍微延迟一下，让UI更新完成
        setTimeout(() => {
          processPdfFile({ ...fileItem, selectedPages: allPages, pdfDoc: pdf });
        }, 500);
      }
    } catch (error) {
      console.error('Auto process PDF failed:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect({ target: { files: selectedFiles } });
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const retryFile = (id) => {
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'pending', errorMessage: null } : f
    ));
  };

  // 加载PDF并获取页数
  const loadPdfDocument = async (fileItem) => {
    try {
      // 更新状态为加载中
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'loading', progress: '正在加载PDF...' }
          : f
      ));

      const arrayBuffer = await fileItem.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // 更新文件状态
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'loaded', numPages: pdf.numPages, pdfDoc: pdf, progress: null }
          : f
      ));
      
      return pdf;
    } catch (error) {
      console.error('Error loading PDF:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', errorMessage: '无法加载PDF文件', progress: null }
          : f
      ));
      return null;
    }
  };

  // 将PDF页面渲染为图片
  const renderPdfPageToImage = async (pdf, pageNumber, format, quality) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      // 创建canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // 渲染PDF页面到canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // 将canvas转换为blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve({
            blob,
            width: viewport.width,
            height: viewport.height,
            pageNumber
          });
        }, `image/${format}`, quality / 100);
      });
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
      return null;
    }
  };

  // 处理单个PDF文件
  const processPdfFile = async (fileItem) => {
    setCurrentProcessingFile(fileItem.name);
    
    // 首先加载PDF
    if (!fileItem.pdfDoc) {
      const pdf = await loadPdfDocument(fileItem);
      if (!pdf) return;
      fileItem.pdfDoc = pdf;
    }
    
    // 获取选中的页面
    const selectedPages = fileItem.selectedPages.size > 0 
      ? Array.from(fileItem.selectedPages) 
      : Array.from({ length: fileItem.numPages }, (_, i) => i + 1);
    
    const convertedImages = [];
    
    // 逐页转换
    for (const pageNumber of selectedPages) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'processing', progress: `正在处理第 ${pageNumber}/${selectedPages.length} 页` }
          : f
      ));
      
      const imageData = await renderPdfPageToImage(
        fileItem.pdfDoc, 
        pageNumber, 
        outputFormat, 
        quality[0]
      );
      
      if (imageData) {
        const filename = `${fileItem.name.replace('.pdf', '')}_page_${pageNumber}.${outputFormat}`;
        convertedImages.push({
          filename,
          blob: imageData.blob,
          size: imageData.blob.size,
          pageNumber,
          width: imageData.width,
          height: imageData.height
        });
      }
    }
    
    // 更新文件状态
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id 
        ? { ...f, status: 'completed', convertedImages, progress: null }
        : f
    ));
  };

  // 批量处理所有文件
  const startConversion = async () => {
    setProcessing(true);
    
    const pdfFiles = files.filter(f => f.isPdf && f.status !== 'completed' && f.selectedPages.size > 0);
    
    for (const fileItem of pdfFiles) {
      await processPdfFile(fileItem);
    }
    
    setProcessing(false);
    setCurrentProcessingFile(null);
  };

  // 下载单个图片
  const downloadImage = (image, filename) => {
    const url = URL.createObjectURL(image.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 下载所有图片（打包为zip）
  const downloadAllImages = async (fileItem) => {
    // 这里可以集成一个zip库，比如jszip
    // 暂时先逐个下载
    fileItem.convertedImages.forEach(img => {
      downloadImage(img, img.filename);
    });
  };

  const togglePageSelection = (fileId, pageNumber) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const newSelectedPages = new Set(f.selectedPages);
        if (newSelectedPages.has(pageNumber)) {
          newSelectedPages.delete(pageNumber);
        } else {
          newSelectedPages.add(pageNumber);
        }
        return { ...f, selectedPages: newSelectedPages };
      }
      return f;
    }));
  };

  const toggleAllPages = (fileId, select) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        const newSelectedPages = new Set();
        if (select) {
          for (let i = 1; i <= f.numPages; i++) {
            newSelectedPages.add(i);
          }
        }
        return { ...f, selectedPages: newSelectedPages };
      }
      return f;
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 输出格式选项
  const outputFormatOptions = [
    { value: 'png', label: 'PNG (无损压缩)' },
    { value: 'jpeg', label: 'JPEG (有损压缩)' },
    { value: 'webp', label: 'WebP (现代格式)' },
  ];

  // 缩放选项
  const scaleOptions = [
    { value: 1, label: '1x (标准)' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x (高清)' },
    { value: 3, label: '3x (超高清)' },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 bg-white dark:bg-gray-950 z-10 py-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="processor" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />处理器
            </TabsTrigger>
            <TabsTrigger value="pdf-settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />PDF 设置
            </TabsTrigger>
            <TabsTrigger value="image-settings" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />图片设置
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="processor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>文件处理队列</CardTitle>
              <CardDescription>
                拖放文件到此处，或点击按钮选择文件。所有处理都在您的浏览器本地完成。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 cursor-pointer transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-gray-500">拖放PDF或图片文件到这里</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  multiple 
                  className="hidden" 
                  accept="application/pdf,image/*" 
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <FilePlus2 className="h-4 w-4 mr-2" /> 添加文件
                </Button>
                <Button onClick={clearAllFiles} disabled={files.length === 0}>
                  <Trash className="h-4 w-4 mr-2" /> 全部清除
                </Button>
                <Button 
                  onClick={startConversion} 
                  disabled={files.length === 0 || processing} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" /> 
                  {processing ? '处理中...' : '开始转换'}
                </Button>
              </div>
              
              {/* 自动转换设置 */}
              <div className="mt-4 flex items-center space-x-2">
                <Checkbox 
                  id="auto-convert" 
                  checked={autoConvert} 
                  onCheckedChange={setAutoConvert}
                />
                <Label htmlFor="auto-convert" className="text-sm">
                  上传PDF后自动转换为图片
                </Label>
              </div>
              
              {processing && currentProcessingFile && (
                <div className="mt-4 text-sm text-gray-600">
                  正在处理: {currentProcessingFile}
                </div>
              )}
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>待处理文件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((fileItem) => (
                    <div key={fileItem.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate pr-2">{fileItem.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(fileItem.size)}
                            {fileItem.numPages > 0 && ` • ${fileItem.numPages} 页`}
                          </p>
                          {fileItem.progress && (
                            <p className="text-sm text-blue-600 mt-1">{fileItem.progress}</p>
                          )}
                          {fileItem.errorMessage && (
                            <p className="text-sm text-red-600 mt-1">{fileItem.errorMessage}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            fileItem.status === 'completed' ? 'default' :
                            fileItem.status === 'processing' ? 'secondary' :
                            fileItem.status === 'loading' ? 'secondary' :
                            fileItem.status === 'error' ? 'destructive' : 'outline'
                          }>
                            {fileItem.status === 'pending' ? '待处理' :
                             fileItem.status === 'loading' ? '加载中' :
                             fileItem.status === 'loaded' ? '已加载' :
                             fileItem.status === 'processing' ? '处理中' :
                             fileItem.status === 'completed' ? '已完成' :
                             fileItem.status === 'error' ? '错误' : fileItem.status}
                          </Badge>
                          {fileItem.status === 'error' && (
                            <Button size="sm" variant="outline" onClick={() => retryFile(fileItem.id)}>
                              <RotateCcw className="h-3 w-3 mr-1" /> 重试
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => removeFile(fileItem.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* 手动加载按钮（仅在需要时显示） */}
                      {fileItem.isPdf && fileItem.status === 'pending' && !autoConvert && (
                        <div className="mt-4">
                          <Button 
                            size="sm" 
                            onClick={() => autoProcessPdf(fileItem)}
                            className="w-full"
                          >
                            加载PDF并开始转换
                          </Button>
                        </div>
                      )}

                      {/* 页面选择（仅在已加载且未完成时显示） */}
                      {fileItem.isPdf && fileItem.numPages > 0 && fileItem.status !== 'completed' && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              选择页面 ({fileItem.selectedPages.size}/{fileItem.numPages})
                            </Label>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => toggleAllPages(fileItem.id, true)}>
                                全选
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => toggleAllPages(fileItem.id, false)}>
                                取消
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-10 gap-2">
                            {Array.from({ length: fileItem.numPages }, (_, i) => i + 1).map(pageNumber => (
                              <div
                                key={pageNumber}
                                className={`relative border-2 rounded cursor-pointer p-2 text-center transition-colors ${
                                  fileItem.selectedPages.has(pageNumber) 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                                onClick={() => togglePageSelection(fileItem.id, pageNumber)}
                              >
                                <span className="text-sm">{pageNumber}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {fileItem.convertedImages.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              转换结果 ({fileItem.convertedImages.length} 张图片)
                            </Label>
                            <Button size="sm" onClick={() => downloadAllImages(fileItem)}>
                              <Download className="h-3 w-3 mr-1" /> 下载全部
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {fileItem.convertedImages.map((image, index) => (
                              <div key={index} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{image.filename}</div>
                                  <div className="text-xs text-gray-500">
                                    {formatFileSize(image.size)} • {image.width}x{image.height}
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => downloadImage(image, image.filename)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pdf-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />PDF转换设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>输出格式</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormatOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {outputFormat !== 'png' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>图片质量</Label>
                    <Badge variant="outline">{quality[0]}%</Badge>
                  </div>
                  <Slider 
                    value={quality} 
                    onValueChange={setQuality} 
                    max={100} 
                    min={1} 
                    step={1} 
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>缩放比例</Label>
                <Select value={String(scale)} onValueChange={v => setScale(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scaleOptions.map(option => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />图片转换设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-sm text-gray-500">
                图片转换功能即将推出...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• <strong>自动化处理:</strong> 上传PDF后可自动完成转换，无需手动操作</div>
          <div>• <strong>PDF转图片:</strong> 支持批量转换，可选择特定页面</div>
          <div>• <strong>高质量输出:</strong> 支持多种格式和分辨率设置</div>
          <div>• <strong>本地处理:</strong> 所有操作在浏览器中完成，保护文件隐私</div>
          <div>• <strong>批量下载:</strong> 支持一键下载所有转换结果</div>
        </CardContent>
      </Card>

      {showScrollTop && (
        <Button 
          className="fixed bottom-20 right-6 rounded-full w-12 h-12 shadow-lg z-50" 
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

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

      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>意见反馈</CardTitle>
            </CardHeader>
            <CardContent>
              <p>如果您在使用过程中遇到问题或有改进建议，请联系我们。</p>
              <Button onClick={() => setShowFeedback(false)} className="w-full mt-4">
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>关于图片处理工具</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2"><strong>版本:</strong> 3.0.0</p>
              <p className="mb-2"><strong>技术栈:</strong> pdfjs-dist + Canvas API</p>
              <p>纯浏览器端的PDF转图片解决方案，支持高质量输出。</p>
              <Button onClick={() => setShowAbout(false)} className="w-full mt-4">
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PictureProcessor; 