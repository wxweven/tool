import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, Wand2Icon } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const JavaToStringFormatter = () => {
  const [inputString, setInputString] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  let parseToString;

  const parseValue = (value) => {
    value = value.trim();
    if (value.startsWith('"') && value.endsWith('"')) return value.substring(1, value.length - 1);
    if (value.startsWith("'") && value.endsWith("'")) return value.substring(1, value.length - 1);
    if (!isNaN(value) && value !== '' && !/\s/.test(value)) return Number(value);
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (value.startsWith('[') && value.endsWith(']')) return parseArray(value);
    if (value.startsWith('(') && value.endsWith(')')) return parseToString(value);
    return value;
  };

  const parseArray = (arrayString) => {
    const content = arrayString.substring(1, arrayString.length - 1).trim();
    if (content === '') return [];

    const items = [];
    let lastIndex = 0;
    let balance = 0;
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (!inQuotes) {
        if (char === '(' || char === '[') {
          balance++;
        } else if (char === ')' || char === ']') {
          balance--;
        } else if (char === ',' && balance === 0) {
          items.push(content.substring(lastIndex, i).trim());
          lastIndex = i + 1;
        }
      }
    }
    items.push(content.substring(lastIndex).trim());
    return items.map(item => parseValue(item));
  };

  parseToString = (input) => {
    let content = input.trim();
    const firstEq = content.indexOf('=');
    if (firstEq > -1) {
      const afterEq = content.substring(firstEq + 1).trim();
      if (afterEq.startsWith('(') || afterEq.startsWith('[')) {
        content = afterEq;
      }
    }

    if (content.startsWith('(') && content.endsWith(')')) {
      content = content.substring(1, content.length - 1).trim();
    } else if (content.startsWith('[') && content.endsWith(']')) {
      return parseArray(content);
    }

    const result = {};
    if (content === '') return result;

    let lastIndex = 0;
    let balance = 0;
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];

      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (!inQuotes) {
        if (char === '(' || char === '[') {
          balance++;
        } else if (char === ')' || char === ']') {
          balance--;
        } else if (char === ',' && balance === 0) {
          const pair = content.substring(lastIndex, i).trim();
          const eqIndex = pair.indexOf('=');
          if (eqIndex > -1) {
            const key = pair.substring(0, eqIndex).trim();
            const value = pair.substring(eqIndex + 1).trim();
            result[key] = parseValue(value);
          }
          lastIndex = i + 1;
        }
      }
    }

    const pair = content.substring(lastIndex).trim();
    if (pair) {
      const eqIndex = pair.indexOf('=');
      if (eqIndex > -1) {
        const key = pair.substring(0, eqIndex).trim();
        const value = pair.substring(eqIndex + 1).trim();
        result[key] = parseValue(value);
      }
    }

    return result;
  };

  const formatToString = () => {
    try {
      if (!inputString.trim()) {
        setError("请输入Java toString方法的输出");
        return;
      }

      const parsed = parseToString(inputString);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
      setError("");
    } catch (err) {
      console.error(err);
      setError("解析失败: " + err.message);
      setFormattedJson("");
    }
  };

  const copyToClipboard = () => {
    if (!formattedJson) return;

    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInputString("");
    setFormattedJson("");
    setError("");
  };

  const testExample = () => {
    const example = 'userData=(name="张三", age=1, phone="1749908998", address="北京市海淀区", city="北京市", state="北京市", zip="100000", country="中国")';
    setInputString(example);
  };

  const testNestedExample = () => {
    const example = 'order=(id=123, customer=(name="李四", email="lisi@example.com"), items=[(name="商品1", price=99.99), (name="商品2", price=199.99)])';
    setInputString(example);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tostring-input">输入Java toString输出</Label>
              <Textarea
                id="tostring-input"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder='userData=(name="张三", age=1, phone="1749908998", address="北京市海淀区")'
                rows={10}
                className="font-mono mt-1"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex gap-2">
              <Button onClick={formatToString}>
                <Wand2Icon className="mr-2 h-4 w-4" /> 转换为JSON
              </Button>
              <Button variant="secondary" onClick={clearAll}>
                清空
              </Button>
              <Button variant="outline" onClick={testExample}>
                测试示例
              </Button>
              <Button variant="outline" onClick={testNestedExample}>
                嵌套示例
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>JSON结果</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!formattedJson}
            >
              <CopyIcon className="mr-2 h-4 w-4" />
              复制
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formattedJson ? (
            <div className="relative">
              <SyntaxHighlighter
                language="json"
                style={atomDark}
                customStyle={{
                  borderRadius: '0.375rem',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
              >
                {formattedJson}
              </SyntaxHighlighter>

              {copied && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  已复制!
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>输入Java toString方法的输出并点击转换按钮</p>
              <p className="mt-2 text-sm">支持嵌套对象和复杂数据结构的转换</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JavaToStringFormatter;