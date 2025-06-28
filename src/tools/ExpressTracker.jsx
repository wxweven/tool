import React, { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Separator } from "../components/ui/separator";
import { Truck, Search, ExternalLink, Clipboard, Check } from "lucide-react";

/**
 * 快递单号自动识别与追踪
 * 功能：
 * - 输入快递单号，自动识别快递公司
 * - 跳转到对应快递公司官网查询
 * - 支持主流快递公司识别
 */
const ExpressTracker = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [recognizedCompany, setRecognizedCompany] = useState(null);
  const [recentTracking, setRecentTracking] = useState([]);
  const [copied, setCopied] = useState(false);

  // 快递公司规则配置
  const expressCompanies = [
    {
      name: '顺丰速运',
      code: 'SF',
      patterns: [/^SF\d{12}$/, /^\d{12}$/],
      queryUrl: 'https://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number/',
      color: 'bg-yellow-500',
      example: 'SF1234567890123'
    },
    {
      name: '中通快递',
      code: 'ZTO',
      patterns: [/^7\d{11,13}$/, /^ZTO\d{10,12}$/],
      queryUrl: 'https://www.zto.com/GuestService/Bill?txtWaybillNo=',
      color: 'bg-blue-500',
      example: '75123456789012'
    },
    {
      name: '圆通速递',
      code: 'YTO',
      patterns: [/^YT\d{13}$/, /^D\d{12}$/, /^\d{13}$/],
      queryUrl: 'https://www.yto.net.cn/query/index.aspx?no=',
      color: 'bg-green-500',
      example: 'YT1234567890123'
    },
    {
      name: '申通快递',
      code: 'STO',
      patterns: [/^STO\d{12}$/, /^\d{12}$/],
      queryUrl: 'https://www.sto.cn/query.html?no=',
      color: 'bg-orange-500',
      example: 'STO123456789012'
    },
    {
      name: '韵达速递',
      code: 'YUNDA',
      patterns: [/^YD\d{13}$/, /^\d{13}$/],
      queryUrl: 'https://www.yundaex.com/query/index.aspx?no=',
      color: 'bg-purple-500',
      example: 'YD1234567890123'
    },
    {
      name: '百世快递',
      code: 'BEST',
      patterns: [/^B\d{12}$/, /^\d{11,13}$/],
      queryUrl: 'https://www.800best.com/query.aspx?no=',
      color: 'bg-red-500',
      example: 'B123456789012'
    },
    {
      name: '德邦快递',
      code: 'DBL',
      patterns: [/^\d{8,10}$/, /^DBL\d{8,10}$/],
      queryUrl: 'https://www.deppon.com/gw/dop/order/queryOrderByWaybillNoAction.action?waybillNo=',
      color: 'bg-indigo-500',
      example: '12345678'
    },
    {
      name: '京东快递',
      code: 'JD',
      patterns: [/^JD\d{15}$/, /^VA\d{11}$/, /^VC\d{11}$/],
      queryUrl: 'https://track.jd.com/track?waybillCode=',
      color: 'bg-pink-500',
      example: 'JD123456789012345'
    },
    {
      name: '邮政EMS',
      code: 'EMS',
      patterns: [/^E[A-Z]\d{9}[A-Z]{2}$/, /^C[A-Z]\d{9}[A-Z]{2}$/, /^L[A-Z]\d{9}[A-Z]{2}$/],
      queryUrl: 'https://www.ems.com.cn/queryList?mailNoList=',
      color: 'bg-emerald-500',
      example: 'EA123456789CN'
    },
    {
      name: '极兔速递',
      code: 'JT',
      patterns: [/^JT\d{13}$/, /^\d{17}$/],
      queryUrl: 'https://www.jtexpress.com.cn/trajectory?no=',
      color: 'bg-cyan-500',
      example: 'JT1234567890123'
    }
  ];

  // 识别快递公司
  const recognizeExpressCompany = (number) => {
    const cleanNumber = number.trim().toUpperCase();
    
    for (const company of expressCompanies) {
      for (const pattern of company.patterns) {
        if (pattern.test(cleanNumber)) {
          return company;
        }
      }
    }
    return null;
  };

  // 处理输入变化
  const handleInputChange = (value) => {
    setTrackingNumber(value);
    if (value.trim()) {
      const company = recognizeExpressCompany(value);
      setRecognizedCompany(company);
    } else {
      setRecognizedCompany(null);
    }
  };

  // 查询快递
  const trackExpress = () => {
    if (!recognizedCompany || !trackingNumber.trim()) return;
    
    const cleanNumber = trackingNumber.trim();
    const queryUrl = recognizedCompany.queryUrl + cleanNumber;
    
    // 添加到最近查询记录
    const newRecord = {
      number: cleanNumber,
      company: recognizedCompany,
      time: new Date().toLocaleString('zh-CN'),
      timestamp: Date.now()
    };
    
    setRecentTracking(prev => {
      const filtered = prev.filter(item => item.number !== cleanNumber);
      return [newRecord, ...filtered].slice(0, 10); // 只保留最近10条
    });
    
    // 打开查询页面
    window.open(queryUrl, '_blank');
  };

  // 复制单号
  const copyTrackingNumber = async () => {
    if (!trackingNumber.trim()) return;
    
    try {
      await navigator.clipboard.writeText(trackingNumber.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 快速输入示例
  const fillExample = (example) => {
    handleInputChange(example);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">快递单号自动识别与追踪</h2>
        <p className="text-muted-foreground">输入快递单号，自动识别快递公司并跳转查询页面</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            快递查询
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="请输入快递单号..."
              value={trackingNumber}
              onChange={(e) => handleInputChange(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={copyTrackingNumber}
              disabled={!trackingNumber.trim()}
              className="px-3"
            >
                             {copied ? (
                 <Check className="h-4 w-4" />
               ) : (
                 <Clipboard className="h-4 w-4" />
               )}
            </Button>
            <Button 
              onClick={trackExpress}
              disabled={!recognizedCompany || !trackingNumber.trim()}
                         >
               <Search className="h-4 w-4 mr-2" />
               查询
             </Button>
          </div>

                     {recognizedCompany && (
             <Alert>
               <Truck className="h-4 w-4" />
               <AlertDescription>
                <div className="flex items-center gap-2">
                  <span>识别为：</span>
                  <Badge className={recognizedCompany.color}>
                    {recognizedCompany.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    点击查询按钮跳转到官网查询
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {trackingNumber.trim() && !recognizedCompany && (
            <Alert>
              <AlertDescription className="text-amber-600">
                未能识别快递公司，请检查单号格式是否正确
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>支持的快递公司</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expressCompanies.map((company, index) => (
              <div 
                key={index}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => fillExample(company.example)}
              >
                <div className="flex items-center justify-between mb-2">
                                     <Badge className={company.color}>
                     {company.name}
                   </Badge>
                   <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>
                <div className="text-xs text-muted-foreground">
                  示例：{company.example}
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-4 text-center">
            点击任意快递公司可快速填入示例单号进行测试
          </div>
        </CardContent>
      </Card>

      {recentTracking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最近查询</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentTracking.map((record, index) => (
                <div 
                  key={record.timestamp}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={record.company.color}>
                      {record.company.name}
                    </Badge>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {record.number}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {record.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const queryUrl = record.company.queryUrl + record.number;
                        window.open(queryUrl, '_blank');
                      }}
                                         >
                       <ExternalLink className="h-3 w-3" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• 支持主流快递公司的单号自动识别</div>
          <div>• 输入单号后会自动识别快递公司</div>
          <div>• 点击"查询"按钮会跳转到对应快递公司官网</div>
          <div>• 支持复制单号到剪贴板</div>
          <div>• 保存最近10次查询记录</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>友情链接</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            更多快递查询服务：
            <a 
              href="http://www.kuaidi.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
            >
              快递查询API
            </a>
          </div>

          <iframe name="kuaidi" src="http://www.kuaidi.com/cominterface1616.html" width="960" height="800" marginwidth="0" marginheight="0" hspace="0" vspace="0" frameborder="0" scrolling="no"></iframe>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpressTracker; 