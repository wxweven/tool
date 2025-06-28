import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  Shield, 
  AlertTriangle,
  Settings,
  History,
  Download
} from "lucide-react";

const PasswordGenerator = () => {
  // 密码配置
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  
  // 生成结果
  const [password, setPassword] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [batchCount, setBatchCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  
  // 字符集
  const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  
  // 易混淆字符
  const similarChars = '0O1lI';
  
  // 密码强度计算
  const calculateStrength = (pwd) => {
    if (!pwd) return { score: 0, level: 'very-weak', text: '无密码' };
    
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      longLength: pwd.length >= 12,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      symbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pwd),
      noRepeat: !/(.)\1{2,}/.test(pwd),
      noSequence: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890)/i.test(pwd)
    };
    
    // 长度评分
    if (checks.length) score += 2;
    if (checks.longLength) score += 2;
    
    // 字符类型评分
    if (checks.uppercase) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.symbols) score += 2;
    
    // 复杂度评分
    if (checks.noRepeat) score += 1;
    if (checks.noSequence) score += 1;
    
    // 长度奖励
    if (pwd.length >= 16) score += 2;
    if (pwd.length >= 20) score += 1;
    
    let level, text;
    if (score <= 3) {
      level = 'very-weak';
      text = '极弱';
    } else if (score <= 5) {
      level = 'weak';
      text = '弱';
    } else if (score <= 7) {
      level = 'medium';
      text = '中等';
    } else if (score <= 9) {
      level = 'strong';
      text = '强';
    } else {
      level = 'very-strong';
      text = '极强';
    }
    
    return { score: Math.min(score * 10, 100), level, text };
  };
  
  // 生成密码
  const generatePassword = (customLength = null) => {
    const pwdLength = customLength || length[0];
    
    // 构建字符集
    let charset = '';
    if (includeUppercase) charset += charSets.uppercase;
    if (includeLowercase) charset += charSets.lowercase;
    if (includeNumbers) charset += charSets.numbers;
    if (includeSymbols) charset += charSets.symbols;
    
    if (!charset) {
      alert('请至少选择一种字符类型');
      return '';
    }
    
    // 排除易混淆字符
    if (excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
    }
    
    // 生成密码
    let result = '';
    
    // 确保至少包含每种选中的字符类型
    const requiredChars = [];
    if (includeUppercase) {
      const chars = excludeSimilar ? 
        charSets.uppercase.split('').filter(char => !similarChars.includes(char)) : 
        charSets.uppercase.split('');
      requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    if (includeLowercase) {
      const chars = excludeSimilar ? 
        charSets.lowercase.split('').filter(char => !similarChars.includes(char)) : 
        charSets.lowercase.split('');
      requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    if (includeNumbers) {
      const chars = excludeSimilar ? 
        charSets.numbers.split('').filter(char => !similarChars.includes(char)) : 
        charSets.numbers.split('');
      requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    if (includeSymbols) {
      requiredChars.push(charSets.symbols[Math.floor(Math.random() * charSets.symbols.length)]);
    }
    
    // 填充剩余长度
    for (let i = 0; i < pwdLength - requiredChars.length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // 添加必需字符并打乱
    result = (result + requiredChars.join('')).split('').sort(() => Math.random() - 0.5).join('');
    
    return result;
  };
  
  // 生成单个密码
  const handleGenerate = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    
    // 添加到历史记录
    if (newPassword) {
      const historyItem = {
        id: Date.now(),
        password: newPassword,
        strength: calculateStrength(newPassword),
        timestamp: new Date().toLocaleString('zh-CN'),
        length: length[0],
        config: {
          uppercase: includeUppercase,
          lowercase: includeLowercase,
          numbers: includeNumbers,
          symbols: includeSymbols,
          excludeSimilar
        }
      };
      
      setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // 保留最近20条
    }
  };
  
  // 批量生成密码
  const handleBatchGenerate = () => {
    const newPasswords = [];
    for (let i = 0; i < batchCount; i++) {
      const pwd = generatePassword();
      if (pwd) {
        newPasswords.push({
          id: Date.now() + i,
          password: pwd,
          strength: calculateStrength(pwd)
        });
      }
    }
    setPasswords(newPasswords);
  };
  
  // 复制密码
  const copyPassword = async (pwd) => {
    try {
      await navigator.clipboard.writeText(pwd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      alert('复制失败，请手动复制');
    }
  };
  
  // 导出历史记录
  const exportHistory = () => {
    if (history.length === 0) {
      alert('没有历史记录可导出');
      return;
    }
    
    const csvContent = [
      ['密码', '强度', '生成时间', '长度'].join(','),
      ...history.map(item => [
        `"${item.password}"`,
        item.strength.text,
        item.timestamp,
        item.length
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '密码生成历史.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 预设模板
  const templates = [
    {
      name: '高强度',
      config: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true, excludeSimilar: true }
    },
    {
      name: '中等强度',
      config: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: false }
    },
    {
      name: '简单密码',
      config: { length: 8, uppercase: true, lowercase: true, numbers: true, symbols: false, excludeSimilar: true }
    },
    {
      name: '纯字母',
      config: { length: 10, uppercase: true, lowercase: true, numbers: false, symbols: false, excludeSimilar: true }
    }
  ];
  
  // 应用模板
  const applyTemplate = (template) => {
    setLength([template.config.length]);
    setIncludeUppercase(template.config.uppercase);
    setIncludeLowercase(template.config.lowercase);
    setIncludeNumbers(template.config.numbers);
    setIncludeSymbols(template.config.symbols);
    setExcludeSimilar(template.config.excludeSimilar);
  };
  
  // 初始生成
  useEffect(() => {
    handleGenerate();
  }, []);
  
  const strength = calculateStrength(password);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">密码生成器</h2>
        <p className="text-muted-foreground">生成安全可靠的密码，保护您的账户安全</p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">单个生成</TabsTrigger>
          <TabsTrigger value="batch">批量生成</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 配置面板 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  密码配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 长度设置 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">密码长度</label>
                    <Badge variant="outline">{length[0]} 位</Badge>
                  </div>
                  <Slider
                    value={length}
                    onValueChange={setLength}
                    max={128}
                    min={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                {/* 字符类型 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">包含字符类型</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="uppercase"
                        checked={includeUppercase}
                        onCheckedChange={setIncludeUppercase}
                      />
                      <label htmlFor="uppercase" className="text-sm">大写字母 (A-Z)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lowercase"
                        checked={includeLowercase}
                        onCheckedChange={setIncludeLowercase}
                      />
                      <label htmlFor="lowercase" className="text-sm">小写字母 (a-z)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="numbers"
                        checked={includeNumbers}
                        onCheckedChange={setIncludeNumbers}
                      />
                      <label htmlFor="numbers" className="text-sm">数字 (0-9)</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="symbols"
                        checked={includeSymbols}
                        onCheckedChange={setIncludeSymbols}
                      />
                      <label htmlFor="symbols" className="text-sm">特殊符号 (!@#$%^&*)</label>
                    </div>
                  </div>
                </div>

                {/* 高级选项 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">高级选项</label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeSimilar"
                      checked={excludeSimilar}
                      onCheckedChange={setExcludeSimilar}
                    />
                    <label htmlFor="excludeSimilar" className="text-sm">排除易混淆字符 (0,O,l,1,I)</label>
                  </div>
                </div>

                {/* 预设模板 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">快速模板</label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template)}
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 生成结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  生成结果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 密码显示 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">生成的密码</label>
                  <div className="flex gap-2">
                    <Input
                      value={password}
                      readOnly
                      className="font-mono text-lg"
                      placeholder="点击生成密码"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyPassword(password)}
                      disabled={!password}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* 强度指示 */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">密码强度</label>
                      <Badge 
                        variant={strength.level === 'very-strong' ? 'default' : 
                               strength.level === 'strong' ? 'secondary' : 
                               strength.level === 'medium' ? 'outline' : 'destructive'}
                      >
                        {strength.text}
                      </Badge>
                    </div>
                    <Progress value={strength.score} className="w-full" />
                    <div className="text-xs text-muted-foreground">
                      强度评分: {strength.score}/100
                    </div>
                  </div>
                )}

                {/* 生成按钮 */}
                <Button onClick={handleGenerate} className="w-full" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新生成
                </Button>

                {/* 安全提示 */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    建议使用12位以上包含多种字符类型的密码，并定期更换密码。
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>批量生成密码</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium">生成数量</label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={batchCount}
                    onChange={(e) => setBatchCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <Button onClick={handleBatchGenerate}>
                  生成密码
                </Button>
              </div>

              {passwords.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {passwords.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm text-muted-foreground w-8">{index + 1}</span>
                      <Input
                        value={item.password}
                        readOnly
                        className="font-mono flex-1"
                      />
                      <Badge 
                        variant={item.strength.level === 'very-strong' ? 'default' : 
                               item.strength.level === 'strong' ? 'secondary' : 
                               item.strength.level === 'medium' ? 'outline' : 'destructive'}
                        className="min-w-12"
                      >
                        {item.strength.text}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPassword(item.password)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  生成历史 ({history.length})
                </CardTitle>
                {history.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportHistory}>
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-3 border rounded hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-mono text-sm">{item.password}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.timestamp} · {item.length}位
                        </div>
                      </div>
                      <Badge 
                        variant={item.strength.level === 'very-strong' ? 'default' : 
                               item.strength.level === 'strong' ? 'secondary' : 
                               item.strength.level === 'medium' ? 'outline' : 'destructive'}
                      >
                        {item.strength.text}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPassword(item.password)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Key className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无历史记录</div>
                  <div className="text-sm mt-1">生成密码后会显示在这里</div>
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
          <div>• <strong>密码长度：</strong>建议至少12位，重要账户使用16位以上</div>
          <div>• <strong>字符类型：</strong>包含多种字符类型可大幅提高密码强度</div>
          <div>• <strong>易混淆字符：</strong>排除0、O、l、1、I等容易混淆的字符</div>
          <div>• <strong>密码管理：</strong>建议使用密码管理器存储生成的密码</div>
          <div>• <strong>定期更换：</strong>重要账户建议每3-6个月更换一次密码</div>
          <div>• <strong>唯一性：</strong>每个账户使用独立的密码，避免重复使用</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator; 