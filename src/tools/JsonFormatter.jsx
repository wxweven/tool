import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, Wand2Icon, ChevronUpIcon, ExpandIcon, ShrinkIcon } from "lucide-react";

// 可展开的JSON节点组件
const JsonNode = ({ data, keyName = null, level = 0, expandAll, collapseAll, isLastItem = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // 监听全部展开/收起
  useEffect(() => {
    if (expandAll !== null) {
      setIsExpanded(expandAll);
    }
  }, [expandAll]);

  useEffect(() => {
    if (collapseAll !== null) {
      setIsExpanded(!collapseAll);
    }
  }, [collapseAll]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getValueColor = (value) => {
    if (value === null) return "text-gray-500 dark:text-gray-400";
    if (typeof value === "string") return "text-green-600 dark:text-green-400";
    if (typeof value === "number") return "text-blue-600 dark:text-blue-400";
    if (typeof value === "boolean") return "text-purple-600 dark:text-purple-400";
    return "text-gray-800 dark:text-gray-200";
  };

  const renderPrimitive = (value) => {
    const color = getValueColor(value);
    if (value === null) {
      return <span className={color}>null</span>;
    }
    if (typeof value === "string") {
      return <span className={color}>"{value}"</span>;
    }
    return <span className={color}>{value.toString()}</span>;
  };

  const isObject = data && typeof data === 'object' && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const isPrimitive = !isObject && !isArray;

  if (isPrimitive) {
    return (
      <div style={{ marginLeft: `${level * 8}px` }} className="py-0.5">
        {keyName && (
          <span className="text-blue-800 dark:text-blue-300 font-medium">"{keyName}": </span>
        )}
        {renderPrimitive(data)}
        {!isLastItem && <span className="text-gray-500 dark:text-gray-400">,</span>}
      </div>
    );
  }

  const entries = isObject ? Object.entries(data) : data.map((item, index) => [index, item]);
  const bracketOpen = isArray ? "[" : "{";
  const bracketClose = isArray ? "]" : "}";

  return (
    <div style={{ marginLeft: `${level * 8}px` }}>
      <div className="py-0.5 flex items-center group">
        {keyName && (
          <span className="text-blue-800 dark:text-blue-300 font-medium">"{keyName}": </span>
        )}
        <button
          onClick={toggleExpanded}
          className="mr-2 p-0.5 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-600 rounded transition-all duration-200 flex items-center justify-center min-w-[20px] min-h-[20px] font-mono text-blue-700 dark:text-blue-300 font-bold"
          title={isExpanded ? "收起" : "展开"}
        >
          {isExpanded ? "-" : "+"}
        </button>
        <span className="text-gray-700 dark:text-gray-300 font-medium">{bracketOpen}</span>
        {!isExpanded && (
          <>
            <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
              {entries.length} {isArray ? "items" : "keys"}...
            </span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">{bracketClose}</span>
            {!isLastItem && <span className="text-gray-500 dark:text-gray-400">,</span>}
          </>
        )}
      </div>

      {isExpanded && (
        <>
          {entries.map(([key, value], index) => (
            <JsonNode
              key={key}
              data={value}
              keyName={!isArray ? key : null}
              level={level + 1}
              expandAll={expandAll}
              collapseAll={collapseAll}
              isLastItem={index === entries.length - 1}
            />
          ))}
          <div style={{ marginLeft: `${level * 8 + 10}px` }} className="py-0.5">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{bracketClose}</span>
            {!isLastItem && <span className="text-gray-500 dark:text-gray-400">,</span>}
          </div>
        </>
      )}
    </div>
  );
};

const JsonFormatter = () => {
  const [inputJson, setInputJson] = useState("");
  const [parsedJson, setParsedJson] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);
  const [autoFormat, setAutoFormat] = useState(true);
  const [expandAll, setExpandAll] = useState(null);
  const [collapseAll, setCollapseAll] = useState(null);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsScrollToTopVisible(true);
      } else {
        setIsScrollToTopVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const formatJson = useCallback(() => {
    try {
      if (!inputJson.trim()) {
        setError("");
        setParsedJson(null);
        return;
      }

      const parsed = JSON.parse(inputJson);
      setParsedJson(parsed);
      setError("");
    } catch (err) {
      setError("无效的JSON格式: " + err.message);
      setParsedJson(null);
    }
  }, [inputJson]);

  // 自动格式化：当输入内容变化时自动触发格式化
  useEffect(() => {
    if (autoFormat) {
      // 使用防抖，避免频繁格式化
      const timeoutId = setTimeout(() => {
        formatJson();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [inputJson, autoFormat, formatJson]);

  const copyToClipboard = () => {
    if (!parsedJson) return;

    const formattedJson = JSON.stringify(parsedJson, null, 2);
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputJson("");
    setParsedJson(null);
    setError("");
  };

  const handleExpandAll = () => {
    setExpandAll(true);
    setCollapseAll(null);
    setTimeout(() => setExpandAll(null), 100);
  };

  const handleCollapseAll = () => {
    setCollapseAll(true);
    setExpandAll(null);
    setTimeout(() => setCollapseAll(null), 100);
  };

  const testSimpleExample = () => {
    const example = '{"name": "John", "age": 30, "city": "New York", "isActive": true, "hobbies": ["reading", "swimming"]}';
    setInputJson(example);
  };

  const testComplexExample = () => {
    const example = '{"user":{"id":1,"name":"张三","email":"zhangsan@example.com","profile":{"avatar":"https://example.com/avatar.jpg","bio":"软件工程师"},"orders":[{"id":"ORD001","items":[{"name":"商品1","price":99.99},{"name":"商品2","price":199.99}],"total":299.98},{"id":"ORD002","items":[{"name":"商品3","price":299.99}],"total":299.99}]},"settings":{"theme":"dark","language":"zh-CN","notifications":{"email":true,"sms":false}},"metadata":{"createdAt":"2024-01-01T00:00:00Z","version":"1.0.0"}}';
    setInputJson(example);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="json-input">输入JSON</Label>
                <Textarea
                  id="json-input"
                  value={inputJson}
                  onChange={(e) => setInputJson(e.target.value)}
                  placeholder='{"name": "John", "age": 30, "city": "New York"}'
                  rows={10}
                  className="font-mono mt-1"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex gap-2 flex-wrap items-center">
                <Button onClick={formatJson} disabled={autoFormat}>
                  <Wand2Icon className="mr-2 h-4 w-4" /> 手动格式化
                </Button>
                <Button variant="secondary" onClick={clearAll}>
                  清空
                </Button>
                <Button variant="outline" onClick={testSimpleExample}>
                  简单示例
                </Button>
                <Button variant="outline" onClick={testComplexExample}>
                  复杂示例
                </Button>
                <div className="flex items-center gap-2 ml-4">
                  <input
                    type="checkbox"
                    id="auto-format"
                    checked={autoFormat}
                    onChange={(e) => setAutoFormat(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="auto-format" className="text-sm">自动格式化</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-2">
              <CardTitle>格式化结果</CardTitle>
              <div className="flex gap-2">
                {parsedJson && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExpandAll}
                    >
                      <ExpandIcon className="mr-2 h-4 w-4" />
                      全部展开
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCollapseAll}
                    >
                      <ShrinkIcon className="mr-2 h-4 w-4" />
                      全部收起
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!parsedJson}
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  复制
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {parsedJson ? (
              <div className="relative">
                                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
                  <JsonNode
                    data={parsedJson}
                    expandAll={expandAll}
                    collapseAll={collapseAll}
                    isLastItem={true}
                  />
                </div>

                {copied && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-2 rounded-md shadow-lg animate-in fade-in-0 duration-200">
                    ✓ 已复制到剪贴板!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>输入JSON内容{autoFormat ? '将自动格式化' : '并点击格式化按钮'}</p>
                <p className="mt-2 text-sm">支持验证和美化JSON数据，可展开/收起嵌套结构</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 回到顶部按钮 */}
      {isScrollToTopVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-2 rounded-full shadow-lg"
          size="sm"
        >
          <ChevronUpIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default JsonFormatter;
