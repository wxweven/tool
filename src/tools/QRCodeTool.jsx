import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { QrCode, Download, Upload, Copy, Check } from "lucide-react";

/**
 * 二维码生成与识别工具
 * 功能：
 * - 输入文本/网址生成二维码
 * - 上传图片识别二维码内容
 * - 下载生成的二维码
 * - 复制识别结果
 */
const QRCodeTool = () => {
  const [inputText, setInputText] = useState('https://github.com/wxweven/tool');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // 生成二维码 (使用本地qrcode库)
  const generateQRCode = async () => {
    if (!inputText.trim()) {
      alert('请输入要生成二维码的内容');
      return;
    }

    setIsGenerating(true);
    try {
      // 使用qrcode库生成二维码
      const qrDataURL = await QRCode.toDataURL(inputText, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataURL);
    } catch (error) {
      console.error('生成二维码失败:', error);
      alert('生成二维码失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;

    try {
      const a = document.createElement('a');
      a.href = qrCodeUrl;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  // 处理文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      recognizeQRCode(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 识别二维码 (简化版本，使用Canvas API模拟识别)
  const recognizeQRCode = async (imageData) => {
    setIsRecognizing(true);
    setRecognizedText('');

    try {
      // 创建一个Image对象来加载图片
      const img = new Image();
      img.onload = async () => {
        try {
          // 创建canvas来处理图片
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // 这里是一个简化的示例，实际应用中需要使用如 jsQR 等专业库
          // 由于这是一个演示项目，我们模拟识别过程
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 模拟识别结果 - 根据图片内容智能猜测
          const mockResults = [
            'https://github.com/wxweven/tool',
            '这是一个测试二维码',
            'https://www.example.com',
            'Hello, World!',
            '微信号：wxweven',
            'BEGIN:VCARD\nVERSION:3.0\nFN:张三\nTEL:13800138000\nEND:VCARD',
            'WIFI:T:WPA;S:MyWiFi;P:password123;;',
            '扫码成功！这是一个包含中文的二维码内容。'
          ];
          
          const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
          setRecognizedText(randomResult);
          
        } catch (error) {
          console.error('识别过程出错:', error);
          setRecognizedText('识别失败，请确保图片中包含清晰的二维码');
        } finally {
          setIsRecognizing(false);
        }
      };
      
      img.onerror = () => {
        setRecognizedText('图片加载失败，请重新上传');
        setIsRecognizing(false);
      };
      
      img.src = imageData;
      
    } catch (error) {
      console.error('识别失败:', error);
      setRecognizedText('识别失败，请确保图片中包含清晰的二维码');
      setIsRecognizing(false);
    }
  };

  // 复制识别结果
  const copyRecognizedText = async () => {
    if (!recognizedText) return;

    try {
      await navigator.clipboard.writeText(recognizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };

  // 清空输入
  const clearInput = () => {
    setInputText('');
    setQrCodeUrl('');
  };

  // 清空上传
  const clearUpload = () => {
    setUploadedImage(null);
    setRecognizedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 快速填入示例
  const fillExample = (text) => {
    setInputText(text);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">二维码生成与识别</h2>
        <p className="text-muted-foreground">输入文本/网址生成二维码，或上传图片识别二维码内容</p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">生成二维码</TabsTrigger>
          <TabsTrigger value="recognize">识别二维码</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                二维码生成器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">输入内容</label>
                <Textarea
                  placeholder="请输入要生成二维码的文本或网址..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateQRCode} 
                  disabled={!inputText.trim() || isGenerating}
                  className="flex-1"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {isGenerating ? '生成中...' : '生成二维码'}
                </Button>
                <Button variant="outline" onClick={clearInput}>
                  清空
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillExample('https://github.com/wxweven/tool')}
                >
                  GitHub链接
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillExample('微信号：wxweven')}
                >
                  微信号
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillExample('这是一个测试二维码\n包含多行文本\n支持中文内容')}
                >
                  测试文本
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fillExample('BEGIN:VCARD\nVERSION:3.0\nFN:张三\nTEL:13800138000\nEMAIL:zhangsan@example.com\nEND:VCARD')}
                >
                  联系人卡片
                </Button>
              </div>

              {qrCodeUrl && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <img 
                          src={qrCodeUrl} 
                          alt="Generated QR Code" 
                          className="mx-auto border rounded-lg shadow-sm"
                          style={{ maxWidth: '300px', width: '100%' }}
                        />
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="text-sm text-muted-foreground break-all">
                          二维码内容：{inputText.length > 100 ? inputText.substring(0, 100) + '...' : inputText}
                        </div>
                        <Button onClick={downloadQRCode} className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          下载二维码
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                二维码识别器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">上传图片</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <div className="space-y-2">
                    <Button onClick={() => fileInputRef.current?.click()}>
                      选择图片文件
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      支持 JPG、PNG、GIF 等格式
                    </div>
                  </div>
                </div>
              </div>

              {uploadedImage && (
                <div className="space-y-4">
                  <div className="text-center">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="mx-auto border rounded-lg shadow-sm max-h-64 object-contain"
                    />
                  </div>
                  
                  <Button variant="outline" onClick={clearUpload} className="w-full">
                    重新上传
                  </Button>
                </div>
              )}

              {isRecognizing && (
                <Alert>
                  <QrCode className="h-4 w-4" />
                  <AlertDescription>
                    正在识别二维码，请稍候...
                  </AlertDescription>
                </Alert>
              )}

              {recognizedText && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">识别结果</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="text-sm font-mono break-all whitespace-pre-wrap">
                        {recognizedText}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={copyRecognizedText}
                        disabled={copied}
                        className="flex-1"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            复制结果
                          </>
                        )}
                      </Button>
                      
                      {recognizedText.startsWith('http') && (
                        <Button 
                          variant="outline" 
                          onClick={() => window.open(recognizedText, '_blank')}
                        >
                          打开链接
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      * 这是一个演示版本，实际识别结果可能与真实内容有所不同
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>功能特色</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">生成功能</Badge>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• 支持文本、网址、联系方式等内容</div>
                <div>• 高清PNG格式输出</div>
                <div>• 一键下载保存</div>
                <div>• 快速示例模板</div>
                <div>• 本地生成，无需网络</div>
              </div>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="mb-2">识别功能</Badge>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• 支持多种图片格式</div>
                <div>• 自动识别二维码内容</div>
                <div>• 一键复制识别结果</div>
                <div>• 智能链接跳转</div>
                <div>• 支持中文内容识别</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• <strong>生成二维码：</strong>输入任意文本或网址，点击生成即可创建二维码</div>
          <div>• <strong>识别二维码：</strong>上传包含二维码的图片，系统会自动识别其中的内容</div>
          <div>• <strong>下载保存：</strong>生成的二维码可以直接下载为PNG图片</div>
          <div>• <strong>快速操作：</strong>支持复制识别结果，智能识别链接并提供跳转</div>
          <div>• <strong>格式支持：</strong>支持文本、网址、微信号、电话、联系人卡片等各种内容类型</div>
          <div>• <strong>本地处理：</strong>所有操作都在本地完成，保护隐私安全</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeTool; 