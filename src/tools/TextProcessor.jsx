import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUpIcon } from 'lucide-react';
import InputPanel from './components/InputPanel';
import OperationPanel from './components/OperationPanel';
import ResultPanel from './components/ResultPanel';

const TextProcessor = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [operations, setOperations] = useState({
    deduplicate: true,    // 默认选中删除重复行
    sort: false,
    removeEmptyLines: true,  // 默认选中删除空行
    trimWhitespace: true,    // 默认选中去除行首行尾空白
    trimLeft: false,
    trimRight: false,
    compressSpaces: false
  });
  const [sortConfig, setSortConfig] = useState({
    direction: 'asc', // 'asc', 'desc'
    type: 'alphabetical' // 'alphabetical', 'numerical', 'length'
  });
  const [statistics, setStatistics] = useState({
    originalLines: 0,
    processedLines: 0,
    removedLines: 0,
    emptyLines: 0,
    characters: 0,
    words: 0
  });
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 从本地存储加载设置
  useEffect(() => {
    const savedOperations = localStorage.getItem('textProcessor_operations');
    const savedSortConfig = localStorage.getItem('textProcessor_sortConfig');
    
    if (savedOperations) {
      try {
        const parsedOperations = JSON.parse(savedOperations);
        setOperations(parsedOperations);
      } catch (error) {
        console.error('Failed to parse saved operations:', error);
        // 如果解析失败，使用默认值
        setOperations({
          deduplicate: true,
          sort: false,
          removeEmptyLines: true,
          trimWhitespace: true,
          trimLeft: false,
          trimRight: false,
          compressSpaces: false
        });
      }
    }
    // 注意：如果没有保存的设置，会使用 useState 中的默认值
    
    if (savedSortConfig) {
      try {
        const parsedSortConfig = JSON.parse(savedSortConfig);
        setSortConfig(parsedSortConfig);
      } catch (error) {
        console.error('Failed to parse saved sort config:', error);
        // 如果解析失败，使用默认值
        setSortConfig({
          direction: 'asc',
          type: 'alphabetical'
        });
      }
    }
  }, []);

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem('textProcessor_operations', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem('textProcessor_sortConfig', JSON.stringify(sortConfig));
  }, [sortConfig]);

  // Scroll to top visibility handler
  useEffect(() => {
    const toggleVisibility = () => {
      setIsScrollToTopVisible(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 计算统计信息
  const calculateStatistics = (original, processed) => {
    const originalLines = original.split('\n');
    const processedLines = processed.split('\n');
    const emptyLines = originalLines.filter(line => line.trim() === '').length;
    
    return {
      originalLines: originalLines.length,
      processedLines: processedLines.length,
      removedLines: originalLines.length - processedLines.length,
      emptyLines,
      characters: processed.length,
      words: processed.trim() ? processed.trim().split(/\s+/).length : 0
    };
  };

  // 去重处理
  const deduplicateText = (text) => {
    const lines = text.split('\n');
    const uniqueLines = [];
    const seen = new Set();

    lines.forEach(line => {
      if (!seen.has(line)) {
        seen.add(line);
        uniqueLines.push(line);
      }
    });

    return uniqueLines.join('\n');
  };

  // 排序处理
  const sortText = (text, config) => {
    const lines = text.split('\n');

    let sortedLines;
    if (config.type === 'numerical') {
      const isAllNumbers = lines.every(line => !isNaN(line.trim()) || line.trim() === '');
      if (isAllNumbers) {
        sortedLines = lines.sort((a, b) => {
          const numA = parseFloat(a.trim()) || 0;
          const numB = parseFloat(b.trim()) || 0;
          return config.direction === 'asc' ? numA - numB : numB - numA;
        });
      } else {
        sortedLines = lines.sort((a, b) => {
          return config.direction === 'asc' 
            ? a.localeCompare(b, 'zh-CN') 
            : b.localeCompare(a, 'zh-CN');
        });
      }
    } else if (config.type === 'length') {
      sortedLines = lines.sort((a, b) => {
        return config.direction === 'asc' 
          ? a.length - b.length 
          : b.length - a.length;
      });
    } else {
      // 字母序排序
      sortedLines = lines.sort((a, b) => {
        return config.direction === 'asc' 
          ? a.localeCompare(b, 'zh-CN') 
          : b.localeCompare(a, 'zh-CN');
      });
    }

    return sortedLines.join('\n');
  };

  // 删除空行
  const removeEmptyLines = (text) => {
    return text.split('\n')
      .filter(line => line.trim() !== '')
      .join('\n');
  };

  // 空白字符处理
  const processWhitespace = (text, ops) => {
    let lines = text.split('\n');

    if (ops.trimLeft) {
      lines = lines.map(line => line.replace(/^\s+/, ''));
    }
    
    if (ops.trimRight) {
      lines = lines.map(line => line.replace(/\s+$/, ''));
    }
    
    if (ops.trimWhitespace) {
      lines = lines.map(line => line.trim());
    }
    
    if (ops.compressSpaces) {
      lines = lines.map(line => line.replace(/\s+/g, ' '));
    }

    return lines.join('\n');
  };

  // 执行所有选中的操作
  const processText = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    
    // 添加轻微延迟以显示loading效果
    await new Promise(resolve => setTimeout(resolve, 300));

    let result = inputText;

    // 按顺序执行操作
    if (operations.removeEmptyLines) {
      result = removeEmptyLines(result);
    }

    if (operations.trimWhitespace || operations.trimLeft || operations.trimRight || operations.compressSpaces) {
      result = processWhitespace(result, operations);
    }

    if (operations.deduplicate) {
      result = deduplicateText(result);
    }

    if (operations.sort) {
      result = sortText(result, sortConfig);
    }

    setOutputText(result);
    setStatistics(calculateStatistics(inputText, result));
    setIsProcessing(false);

    // 处理完成后自动滚动到结果区域
    setTimeout(() => {
      const resultElement = document.getElementById('result-panel');
      if (resultElement) {
        resultElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  // 清空输入内容（保持操作选项不变）
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setStatistics({
      originalLines: 0,
      processedLines: 0,
      removedLines: 0,
      emptyLines: 0,
      characters: 0,
      words: 0
    });
  };

  // 重置到默认选项
  const resetToDefaults = () => {
    const defaultOperations = {
      deduplicate: true,      // 默认选中
      sort: false,
      removeEmptyLines: true, // 默认选中
      trimWhitespace: true,   // 默认选中
      trimLeft: false,
      trimRight: false,
      compressSpaces: false
    };
    setOperations(defaultOperations);
    setSortConfig({
      direction: 'asc',
      type: 'alphabetical'
    });
  };

    // 加载示例
  const loadExample = () => {
    const example = `  苹果  

香蕉   
  苹果  
橙子


   香蕉  
  葡萄
   苹果  
  橙子
葡萄  

  西瓜   

苹果
   柠檬  `;
    setInputText(example);
    setOutputText('');
    setStatistics(calculateStatistics(example, ''));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 输入面板 */}
          <InputPanel
            inputText={inputText}
            setInputText={setInputText}
            onClear={clearAll}
            onLoadExample={loadExample}
            onResetDefaults={resetToDefaults}
            onProcess={processText}
            disabled={!inputText.trim()}
            isProcessing={isProcessing}
            operations={operations}
            sortConfig={sortConfig}
          />

          {/* 操作面板 */}
          <OperationPanel
            operations={operations}
            setOperations={setOperations}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        </div>

        {/* 结果面板 */}
        <div id="result-panel">
          <ResultPanel
            outputText={outputText}
            statistics={statistics}
            inputText={inputText}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Scroll to Top Button */}
      {isScrollToTopVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
          size="icon"
        >
          <ChevronUpIcon className="h-5 w-5" />
        </Button>
      )}
    </>
  );
};

export default TextProcessor; 