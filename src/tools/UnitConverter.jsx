import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { ArrowRightLeft, Calculator, Ruler } from "lucide-react";

/**
 * 单位换算器
 * 功能：
 * - 支持长度、重量、温度、面积、体积等常用单位的智能换算
 * - 支持中英文单位名
 * - 实时换算显示
 */
// 温度转换函数 - 移到组件外部
function convertTemperature(value, from, to) {
  if (from === to) return value;
  
  // 先转换为摄氏度
  let celsius;
  switch (from) {
    case 'celsius':
      celsius = value;
      break;
    case 'fahrenheit':
      celsius = (value - 32) * 5/9;
      break;
    case 'kelvin':
      celsius = value - 273.15;
      break;
    default:
      return value;
  }
  
  // 从摄氏度转换为目标单位
  switch (to) {
    case 'celsius':
      return celsius;
    case 'fahrenheit':
      return celsius * 9/5 + 32;
    case 'kelvin':
      return celsius + 273.15;
    default:
      return celsius;
  }
}

const UnitConverter = () => {
  const [activeCategory, setActiveCategory] = useState('length');
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState('');

  // 单位换算配置
  const unitCategories = {
    length: {
      name: '长度',
      icon: <Ruler className="h-4 w-4" />,
      units: {
        mm: { name: '毫米', factor: 0.001 },
        cm: { name: '厘米', factor: 0.01 },
        m: { name: '米', factor: 1 },
        km: { name: '千米/公里', factor: 1000 },
        inch: { name: '英寸', factor: 0.0254 },
        ft: { name: '英尺', factor: 0.3048 },
        yard: { name: '码', factor: 0.9144 },
        mile: { name: '英里', factor: 1609.344 }
      }
    },
    weight: {
      name: '重量',
      icon: <Calculator className="h-4 w-4" />,
      units: {
        mg: { name: '毫克', factor: 0.000001 },
        g: { name: '克', factor: 0.001 },
        kg: { name: '千克/公斤', factor: 1 },
        t: { name: '吨', factor: 1000 },
        oz: { name: '盎司', factor: 0.0283495 },
        lb: { name: '磅', factor: 0.453592 },
        stone: { name: '英石', factor: 6.35029 }
      }
    },
    temperature: {
      name: '温度',
      icon: <Calculator className="h-4 w-4" />,
      units: {
        celsius: { name: '摄氏度 (°C)', convert: (val, to) => convertTemperature(val, 'celsius', to) },
        fahrenheit: { name: '华氏度 (°F)', convert: (val, to) => convertTemperature(val, 'fahrenheit', to) },
        kelvin: { name: '开尔文 (K)', convert: (val, to) => convertTemperature(val, 'kelvin', to) }
      }
    },
    area: {
      name: '面积',
      icon: <Calculator className="h-4 w-4" />,
      units: {
        mm2: { name: '平方毫米', factor: 0.000001 },
        cm2: { name: '平方厘米', factor: 0.0001 },
        m2: { name: '平方米', factor: 1 },
        km2: { name: '平方千米', factor: 1000000 },
        hectare: { name: '公顷', factor: 10000 },
        acre: { name: '英亩', factor: 4046.86 },
        sqft: { name: '平方英尺', factor: 0.092903 },
        sqinch: { name: '平方英寸', factor: 0.00064516 }
      }
    },
    volume: {
      name: '体积',
      icon: <Calculator className="h-4 w-4" />,
      units: {
        ml: { name: '毫升', factor: 0.001 },
        l: { name: '升', factor: 1 },
        m3: { name: '立方米', factor: 1000 },
        gallon: { name: '加仑(美)', factor: 3.78541 },
        gallon_uk: { name: '加仑(英)', factor: 4.54609 },
        cup: { name: '杯', factor: 0.236588 },
        pint: { name: '品脱', factor: 0.473176 },
        quart: { name: '夸脱', factor: 0.946353 }
      }
    }
  };



  // 执行换算
  const performConversion = () => {
    if (!inputValue || !fromUnit || !toUnit) {
      setResult('');
      return;
    }

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('请输入有效数字');
      return;
    }

    const category = unitCategories[activeCategory];
    
    if (activeCategory === 'temperature') {
      const convertedValue = category.units[fromUnit].convert(value, toUnit);
      setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ''));
    } else {
      // 其他单位使用因子换算
      const fromFactor = category.units[fromUnit].factor;
      const toFactor = category.units[toUnit].factor;
      const convertedValue = (value * fromFactor) / toFactor;
      setResult(convertedValue.toFixed(10).replace(/\.?0+$/, ''));
    }
  };

  // 交换单位
  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // 当输入或单位改变时自动换算
  useEffect(() => {
    performConversion();
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  // 切换类别时重置
  useEffect(() => {
    setInputValue('');
    setFromUnit('');
    setToUnit('');
    setResult('');
  }, [activeCategory]);

  // 快速填入示例
  const fillExample = () => {
    const examples = {
      length: { value: '100', from: 'cm', to: 'm' },
      weight: { value: '1', from: 'kg', to: 'lb' },
      temperature: { value: '25', from: 'celsius', to: 'fahrenheit' },
      area: { value: '1', from: 'm2', to: 'sqft' },
      volume: { value: '1', from: 'l', to: 'gallon' }
    };
    
    const example = examples[activeCategory];
    setInputValue(example.value);
    setFromUnit(example.from);
    setToUnit(example.to);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">单位换算器</h2>
        <p className="text-muted-foreground">支持长度、重量、温度、面积、体积等常用单位的智能换算</p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(unitCategories).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-1">
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(unitCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.name}换算
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={fillExample}>
                    示例
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">从</label>
                    <Input
                      placeholder="输入数值..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      type="number"
                    />
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择单位" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(category.units).map(([unitKey, unit]) => (
                          <SelectItem key={unitKey} value={unitKey}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">转换为</label>
                    <div className="relative">
                      <Input
                        value={result}
                        readOnly
                        placeholder="换算结果..."
                        className="bg-gray-50"
                      />
                      {result && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-2"
                          onClick={() => navigator.clipboard.writeText(result)}
                        >
                          复制
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select value={toUnit} onValueChange={setToUnit} className="flex-1">
                        <SelectTrigger>
                          <SelectValue placeholder="选择单位" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(category.units).map(([unitKey, unit]) => (
                            <SelectItem key={unitKey} value={unitKey}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={swapUnits}
                        disabled={!fromUnit || !toUnit}
                        className="px-3"
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {inputValue && fromUnit && toUnit && result && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      <strong>{inputValue}</strong> {category.units[fromUnit].name} = 
                      <strong className="ml-1">{result}</strong> {category.units[toUnit].name}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>常用{category.name}单位</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(category.units).map(([unitKey, unit]) => (
                    <Badge 
                      key={unitKey} 
                      variant="outline" 
                      className="justify-center p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        if (!fromUnit) {
                          setFromUnit(unitKey);
                        } else if (!toUnit && unitKey !== fromUnit) {
                          setToUnit(unitKey);
                        }
                      }}
                    >
                      {unit.name}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  点击单位可快速选择
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• 选择换算类别（长度、重量、温度、面积、体积）</div>
          <div>• 输入数值并选择源单位和目标单位</div>
          <div>• 系统会自动进行实时换算</div>
          <div>• 点击交换按钮可快速交换源单位和目标单位</div>
          <div>• 支持复制换算结果到剪贴板</div>
          <div>• 点击"示例"按钮可快速填入示例数据</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitConverter; 