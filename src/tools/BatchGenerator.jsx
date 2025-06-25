import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { CopyIcon, RefreshCwIcon, PlusIcon, MinusIcon, ChevronUpIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lastNames, firstNames, phonePrefixes, emailDomains, provinces, cities, districts, streets } from './data/mock-data';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return isVisible ? (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
    >
      <ChevronUpIcon className="h-5 w-5" />
    </Button>
  ) : null;
};

const BatchGenerator = () => {
  const [command, setCommand] = useState('randomName');
  const [quantity, setQuantity] = useState('10');
  const [filterDuplicates, setFilterDuplicates] = useState(true);
  const [delimiter, setDelimiter] = useState('\n');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCommandChange = (newCommand) => {
    setCommand(newCommand);
    setResult('');
  };

  const handleGenerate = useCallback(() => {
    let generatedData = [];
    let tempSet = new Set();

    const generateRandomName = () => {
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomFirstNameLength = Math.random() < 0.5 ? 1 : 2; // 50% chance of 1-character or 2-character first name
      if (randomFirstNameLength === 1) {
        return randomLastName + firstNames[Math.floor(Math.random() * firstNames.length)].charAt(0);
      }
      return randomLastName + randomFirstName;
    };

    const generateRandomPhoneNumber = () => {
      const randomPrefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
      let suffix = '';
      for (let i = 0; i < 8; i++) {
        suffix += Math.floor(Math.random() * 10);
      }
      return randomPrefix + suffix;
    };

    const generateRandomEmail = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let localPart = '';
      for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) { // 5-14 characters
        localPart += chars[Math.floor(Math.random() * chars.length)];
      }
      const randomDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
      return `${localPart}@${randomDomain}`;
    };

    const generateRandomAddress = () => {
      const citiesWithDistricts = Object.keys(districts);
      const randomCity = citiesWithDistricts[Math.floor(Math.random() * citiesWithDistricts.length)];

      let randomProvince = '';
      for (const province in cities) {
        if (cities[province].includes(randomCity)) {
          randomProvince = province;
          break;
        }
      }
      // 如果省份是直辖市，则市的名称和省份名称一样
      const displayCity = (randomProvince === '北京市' || randomProvince === '上海市' || randomProvince === '天津市' || randomProvince === '重庆市') ? randomProvince : randomCity;

      const availableDistricts = districts[randomCity];
      const randomDistrict = availableDistricts[Math.floor(Math.random() * availableDistricts.length)];
      const randomStreet = streets[Math.floor(Math.random() * streets.length)];
      const houseNumber = Math.floor(Math.random() * 200) + 1; // 1-200
      return `${randomProvince}-${displayCity}-${randomDistrict}-${randomStreet}-${houseNumber}号`;
    };

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
        setQuantity('10');
        toast.error('请输入有效的生成数量', {
            description: '生成数量必须是大于0的数字。已重置为10。',
        });
        return;
    }

    if (command === 'randomName') {
      while (generatedData.length < numQuantity) {
        let name = generateRandomName();
        if (filterDuplicates) {
          if (!tempSet.has(name)) {
            tempSet.add(name);
            generatedData.push(name);
          }
        } else {
          generatedData.push(name);
        }
      }
    } else if (command === 'randomPhoneNumber') {
      while (generatedData.length < numQuantity) {
        let phoneNumber = generateRandomPhoneNumber();
        if (filterDuplicates) {
          if (!tempSet.has(phoneNumber)) {
            tempSet.add(phoneNumber);
            generatedData.push(phoneNumber);
          }
        } else {
          generatedData.push(phoneNumber);
        }
      }
    } else if (command === 'randomEmail') {
      while (generatedData.length < numQuantity) {
        let email = generateRandomEmail();
        if (filterDuplicates) {
          if (!tempSet.has(email)) {
            tempSet.add(email);
            generatedData.push(email);
          }
        } else {
          generatedData.push(email);
        }
      }
    } else if (command === 'randomAddress') {
      while (generatedData.length < numQuantity) {
        let address = generateRandomAddress();
        if (filterDuplicates) {
          if (!tempSet.has(address)) {
            tempSet.add(address);
            generatedData.push(address);
          }
        } else {
          generatedData.push(address);
        }
      }
    }
    const effectiveDelimiter = delimiter === '' ? '\n' : delimiter;
    setResult(generatedData.join(effectiveDelimiter));
  }, [command, quantity, filterDuplicates, delimiter]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('复制失败', {
        description: '无法将内容复制到剪贴板。',
      });
    }
  };

  const handleQuantityChange = useCallback((change) => {
    setQuantity(prev => String(Math.max(1, (parseInt(prev, 10) || 0) + change)));
  }, []);

  const handleClear = () => {
    setResult('');
    setQuantity('10');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="mt-6 space-y-4">
          <div>
            <Label htmlFor="command" className="mb-2 block">选择指令</Label>
            <Tabs value={command} onValueChange={handleCommandChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="randomName">随机生成姓名</TabsTrigger>
                <TabsTrigger value="randomPhoneNumber">随机生成手机号</TabsTrigger>
                <TabsTrigger value="randomEmail">随机生成邮箱地址</TabsTrigger>
                <TabsTrigger value="randomAddress">随机生成国内地址</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
            <Label htmlFor="quantity">生成数量</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)}>
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-20 text-center"
              />
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
            <Label htmlFor="filterDuplicates">过滤重复</Label>
            <Switch
              id="filterDuplicates"
              checked={filterDuplicates}
              onCheckedChange={setFilterDuplicates}
            />
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
            <Label htmlFor="delimiter">分割符号</Label>
            <Input
              id="delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              placeholder="请输入分隔符，例如：\n"
            />
          </div>

          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
            <Label htmlFor="result" className="pt-2">生成结果</Label>
            <div className="relative w-full">
              <pre
                id="result"
                className="whitespace-pre-wrap break-all bg-white dark:bg-gray-950 border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded p-3 min-h-[120px] text-sm font-mono select-all transition-all"
                style={{wordBreak: 'break-all'}}
              >{result || <span className="text-gray-400">暂无生成结果</span>}</pre>
              {copied && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  已复制!
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleGenerate} className="gap-2">
              <RefreshCwIcon className="h-4 w-4" />
              生成
            </Button>
            <Button onClick={handleClear} variant="outline" className="gap-2">
              清空
            </Button>
            <Button onClick={handleCopy} variant="outline" className="gap-2" disabled={!result}> 
              <CopyIcon className="h-4 w-4" />
              复制结果
            </Button>
          </div>
        </CardContent>
      </Card>
      <ScrollToTop />
    </div>
  );
};

export default BatchGenerator;