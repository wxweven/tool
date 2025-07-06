import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Calculator, 
  Copy, 
  RotateCcw, 
  Binary,
  Hash,
  Plus,
  Minus,
  X,
  Divide,
  Equal
} from "lucide-react";

const NumberBaseConverter = () => {
  // 数值状态
  const [binaryValue, setBinaryValue] = useState('1010');
  const [octalValue, setOctalValue] = useState('12');
  const [decimalValue, setDecimalValue] = useState('10');
  const [hexValue, setHexValue] = useState('A');
  
  // 计算器状态
  const [calcInput, setCalcInput] = useState('');
  const [calcBase, setCalcBase] = useState(10);
  const [calcResult, setCalcResult] = useState('');
  const [calcHistory, setCalcHistory] = useState([]);
  
  // 位运算
  const [bitOp1, setBitOp1] = useState('10');
  const [bitOp2, setBitOp2] = useState('5');
  const [bitResults, setBitResults] = useState({});
  
  // 转换历史
  const [conversionHistory, setConversionHistory] = useState([]);
  
  // 进制转换函数
  const convertFromDecimal = (decimal, base) => {
    const num = parseInt(decimal);
    if (isNaN(num)) return '';
    
    switch (base) {
      case 2:
        return num.toString(2);
      case 8:
        return num.toString(8);
      case 16:
        return num.toString(16).toUpperCase();
      default:
        return num.toString();
    }
  };
  
  const convertToDecimal = (value, fromBase) => {
    if (!value) return 0;
    return parseInt(value, fromBase);
  };
  
  // 验证输入是否符合进制要求
  const validateInput = (value, base) => {
    if (!value) return true;
    
    const validChars = {
      2: /^[01]+$/,
      8: /^[0-7]+$/,
      10: /^[0-9]+$/,
      16: /^[0-9A-Fa-f]+$/
    };
    
    return validChars[base] ? validChars[base].test(value) : false;
  };
  
  // 更新所有进制值
  const updateAllValues = (value, fromBase) => {
    if (!validateInput(value, fromBase)) return;
    
    const decimal = convertToDecimal(value, fromBase);
    
    setBinaryValue(convertFromDecimal(decimal, 2));
    setOctalValue(convertFromDecimal(decimal, 8));
    setDecimalValue(decimal.toString());
    setHexValue(convertFromDecimal(decimal, 16));
    
    // 添加到转换历史
    const historyItem = {
      timestamp: new Date().toLocaleTimeString(),
      input: value,
      fromBase: fromBase,
      decimal: decimal,
      binary: convertFromDecimal(decimal, 2),
      octal: convertFromDecimal(decimal, 8),
      hex: convertFromDecimal(decimal, 16)
    };
    
    setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };
  
  // 复制到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板！');
    });
  };
  
  // 清空所有值
  const clearAll = () => {
    setBinaryValue('');
    setOctalValue('');
    setDecimalValue('');
    setHexValue('');
  };
  
  // 计算器功能
  const calculateExpression = () => {
    try {
      // 简单的表达式计算（仅支持基本运算）
      const expression = calcInput.replace(/[^0-9+\-*/()]/g, '');
      if (!expression) return;
      
      let result = eval(expression);
      
      // 转换结果到指定进制
      if (calcBase !== 10) {
        result = convertFromDecimal(result.toString(), calcBase);
      }
      
      setCalcResult(result.toString());
      
      // 添加到计算历史
      const historyItem = {
        expression: calcInput,
        result: result.toString(),
        base: calcBase,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setCalcHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      
    } catch (error) {
      setCalcResult('错误');
    }
  };
  
  // 位运算计算
  const calculateBitOperations = () => {
    const num1 = parseInt(bitOp1) || 0;
    const num2 = parseInt(bitOp2) || 0;
    
    setBitResults({
      and: (num1 & num2).toString(),
      or: (num1 | num2).toString(),
      xor: (num1 ^ num2).toString(),
      not1: (~num1).toString(),
      not2: (~num2).toString(),
      leftShift: (num1 << 1).toString(),
      rightShift: (num1 >> 1).toString()
    });
  };
  
  // 监听位运算输入变化
  useEffect(() => {
    calculateBitOperations();
  }, [bitOp1, bitOp2]);
  
  const baseNames = {
    2: '二进制',
    8: '八进制',
    10: '十进制',
    16: '十六进制'
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">进制转换器</h2>
        <p className="text-muted-foreground">支持多种进制之间的数值转换，程序员必备工具</p>
      </div>

      <Tabs defaultValue="converter" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="converter">进制转换</TabsTrigger>
          <TabsTrigger value="calculator">计算器</TabsTrigger>
          <TabsTrigger value="bitwise">位运算</TabsTrigger>
          <TabsTrigger value="history">历史记录</TabsTrigger>
        </TabsList>

        <TabsContent value="converter" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 进制输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Binary className="h-5 w-5" />
                  进制转换
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>二进制 (BIN)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={binaryValue}
                        onChange={(e) => {
                          setBinaryValue(e.target.value);
                          if (validateInput(e.target.value, 2)) {
                            updateAllValues(e.target.value, 2);
                          }
                        }}
                        placeholder="请输入二进制数 (0-1)"
                        className={!validateInput(binaryValue, 2) && binaryValue ? 'border-red-500' : ''}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(binaryValue)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>八进制 (OCT)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={octalValue}
                        onChange={(e) => {
                          setOctalValue(e.target.value);
                          if (validateInput(e.target.value, 8)) {
                            updateAllValues(e.target.value, 8);
                          }
                        }}
                        placeholder="请输入八进制数 (0-7)"
                        className={!validateInput(octalValue, 8) && octalValue ? 'border-red-500' : ''}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(octalValue)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>十进制 (DEC)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={decimalValue}
                        onChange={(e) => {
                          setDecimalValue(e.target.value);
                          if (validateInput(e.target.value, 10)) {
                            updateAllValues(e.target.value, 10);
                          }
                        }}
                        placeholder="请输入十进制数 (0-9)"
                        className={!validateInput(decimalValue, 10) && decimalValue ? 'border-red-500' : ''}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(decimalValue)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>十六进制 (HEX)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={hexValue}
                        onChange={(e) => {
                          setHexValue(e.target.value);
                          if (validateInput(e.target.value, 16)) {
                            updateAllValues(e.target.value, 16);
                          }
                        }}
                        placeholder="请输入十六进制数 (0-9, A-F)"
                        className={!validateInput(hexValue, 16) && hexValue ? 'border-red-500' : ''}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(hexValue)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={clearAll} variant="outline" className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 快速转换 */}
            <Card>
              <CardHeader>
                <CardTitle>快速转换示例</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { dec: 8, name: '8' },
                    { dec: 16, name: '16' },
                    { dec: 32, name: '32' },
                    { dec: 64, name: '64' },
                    { dec: 128, name: '128' },
                    { dec: 255, name: '255' },
                    { dec: 1024, name: '1024' }
                  ].map((item) => (
                    <div key={item.dec} className="flex items-center justify-between p-2 border rounded">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm space-x-2">
                        <span className="text-blue-600">BIN: {convertFromDecimal(item.dec, 2)}</span>
                        <span className="text-green-600">OCT: {convertFromDecimal(item.dec, 8)}</span>
                        <span className="text-purple-600">HEX: {convertFromDecimal(item.dec, 16)}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAllValues(item.dec.toString(), 10)}
                      >
                        使用
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                进制计算器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>计算表达式</Label>
                <div className="flex gap-2">
                  <Input
                    value={calcInput}
                    onChange={(e) => setCalcInput(e.target.value)}
                    placeholder="输入表达式，如: 10 + 5 * 2"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && calculateExpression()}
                  />
                  <select
                    value={calcBase}
                    onChange={(e) => setCalcBase(parseInt(e.target.value))}
                    className="border rounded px-3 py-2"
                  >
                    <option value={2}>二进制</option>
                    <option value={8}>八进制</option>
                    <option value={10}>十进制</option>
                    <option value={16}>十六进制</option>
                  </select>
                  <Button onClick={calculateExpression}>
                    <Equal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {calcResult && (
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-lg font-bold">
                    结果: {calcResult} ({baseNames[calcBase]})
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                {['7', '8', '9', '/'].map((btn) => (
                  <Button
                    key={btn}
                    variant="outline"
                    onClick={() => setCalcInput(prev => prev + btn)}
                  >
                    {btn === '/' ? <Divide className="h-4 w-4" /> : btn}
                  </Button>
                ))}
                {['4', '5', '6', '*'].map((btn) => (
                  <Button
                    key={btn}
                    variant="outline"
                    onClick={() => setCalcInput(prev => prev + btn)}
                  >
                    {btn === '*' ? <X className="h-4 w-4" /> : btn}
                  </Button>
                ))}
                {['1', '2', '3', '-'].map((btn) => (
                  <Button
                    key={btn}
                    variant="outline"
                    onClick={() => setCalcInput(prev => prev + btn)}
                  >
                    {btn === '-' ? <Minus className="h-4 w-4" /> : btn}
                  </Button>
                ))}
                {['0', '(', ')', '+'].map((btn) => (
                  <Button
                    key={btn}
                    variant="outline"
                    onClick={() => setCalcInput(prev => prev + btn)}
                  >
                    {btn === '+' ? <Plus className="h-4 w-4" /> : btn}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setCalcInput('')}
                  className="col-span-2"
                >
                  清空
                </Button>
                <Button
                  onClick={calculateExpression}
                  className="col-span-2"
                >
                  <Equal className="h-4 w-4 mr-2" />
                  计算
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bitwise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>位运算</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>操作数 1</Label>
                  <Input
                    value={bitOp1}
                    onChange={(e) => setBitOp1(e.target.value)}
                    placeholder="输入数字"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>操作数 2</Label>
                  <Input
                    value={bitOp2}
                    onChange={(e) => setBitOp2(e.target.value)}
                    placeholder="输入数字"
                    type="number"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <div className="font-medium">按位与 (AND)</div>
                    <div className="text-lg">{bitOp1} & {bitOp2} = {bitResults.and}</div>
                    <div className="text-sm text-gray-500">
                      二进制: {convertFromDecimal(bitOp1, 2)} & {convertFromDecimal(bitOp2, 2)} = {convertFromDecimal(bitResults.and, 2)}
                    </div>
                  </div>

                  <div className="p-3 border rounded">
                    <div className="font-medium">按位或 (OR)</div>
                    <div className="text-lg">{bitOp1} | {bitOp2} = {bitResults.or}</div>
                    <div className="text-sm text-gray-500">
                      二进制: {convertFromDecimal(bitOp1, 2)} | {convertFromDecimal(bitOp2, 2)} = {convertFromDecimal(bitResults.or, 2)}
                    </div>
                  </div>

                  <div className="p-3 border rounded">
                    <div className="font-medium">按位异或 (XOR)</div>
                    <div className="text-lg">{bitOp1} ^ {bitOp2} = {bitResults.xor}</div>
                    <div className="text-sm text-gray-500">
                      二进制: {convertFromDecimal(bitOp1, 2)} ^ {convertFromDecimal(bitOp2, 2)} = {convertFromDecimal(bitResults.xor, 2)}
                    </div>
                  </div>

                  <div className="p-3 border rounded">
                    <div className="font-medium">按位取反 (NOT)</div>
                    <div className="text-lg">~{bitOp1} = {bitResults.not1}</div>
                    <div className="text-sm text-gray-500">
                      二进制: ~{convertFromDecimal(bitOp1, 2)} = {convertFromDecimal(bitResults.not1, 2)}
                    </div>
                  </div>

                  <div className="p-3 border rounded">
                    <div className="font-medium">左移 (Left Shift)</div>
                    <div className="text-lg">{bitOp1} &lt;&lt; 1 = {bitResults.leftShift}</div>
                    <div className="text-sm text-gray-500">
                      二进制: {convertFromDecimal(bitOp1, 2)} &lt;&lt; 1 = {convertFromDecimal(bitResults.leftShift, 2)}
                    </div>
                  </div>

                  <div className="p-3 border rounded">
                    <div className="font-medium">右移 (Right Shift)</div>
                    <div className="text-lg">{bitOp1} &gt;&gt; 1 = {bitResults.rightShift}</div>
                    <div className="text-sm text-gray-500">
                      二进制: {convertFromDecimal(bitOp1, 2)} &gt;&gt; 1 = {convertFromDecimal(bitResults.rightShift, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 转换历史 */}
            <Card>
              <CardHeader>
                <CardTitle>转换历史</CardTitle>
              </CardHeader>
              <CardContent>
                {conversionHistory.length > 0 ? (
                  <div className="space-y-2">
                    {conversionHistory.map((item, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-500">{item.timestamp}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateAllValues(item.input, item.fromBase)}
                          >
                            重用
                          </Button>
                        </div>
                        <div className="text-sm">
                          <div>输入: {item.input} ({baseNames[item.fromBase]})</div>
                          <div>十进制: {item.decimal}</div>
                          <div>二进制: {item.binary}</div>
                          <div>八进制: {item.octal}</div>
                          <div>十六进制: {item.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Hash className="h-12 w-12 mx-auto mb-2" />
                    <div>暂无转换历史</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 计算历史 */}
            <Card>
              <CardHeader>
                <CardTitle>计算历史</CardTitle>
              </CardHeader>
              <CardContent>
                {calcHistory.length > 0 ? (
                  <div className="space-y-2">
                    {calcHistory.map((item, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-500">{item.timestamp}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCalcInput(item.expression)}
                          >
                            重用
                          </Button>
                        </div>
                        <div className="text-sm">
                          <div>{item.expression} = {item.result}</div>
                          <div className="text-gray-500">({baseNames[item.base]})</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Calculator className="h-12 w-12 mx-auto mb-2" />
                    <div>暂无计算历史</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• <strong>进制转换：</strong>支持二进制、八进制、十进制、十六进制之间的相互转换</div>
          <div>• <strong>实时转换：</strong>在任意进制输入框中输入数值，其他进制会自动更新</div>
          <div>• <strong>输入验证：</strong>自动验证输入是否符合对应进制的字符要求</div>
          <div>• <strong>计算器：</strong>支持各进制下的基本数学运算</div>
          <div>• <strong>位运算：</strong>提供 AND、OR、XOR、NOT、左移、右移等位运算</div>
          <div>• <strong>历史记录：</strong>保存转换和计算历史，方便重复使用</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NumberBaseConverter; 