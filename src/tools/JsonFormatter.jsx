import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, Wand2Icon } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const JsonFormatter = () => {
  const [inputJson, setInputJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const formatJson = () => {
    try {
      if (!inputJson.trim()) {
        setError("请输入JSON内容");
        return;
      }
      
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormattedJson(formatted);
      setError("");
    } catch (err) {
      setError("无效的JSON格式: " + err.message);
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
    setInputJson("");
    setFormattedJson("");
    setError("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>JSON格式化</CardTitle>
        </CardHeader>
        <CardContent>
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
            
            <div className="flex gap-2">
              <Button onClick={formatJson}>
                <Wand2Icon className="mr-2 h-4 w-4" /> 格式化
              </Button>
              <Button variant="secondary" onClick={clearAll}>
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>格式化结果</CardTitle>
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
              <p>输入JSON内容并点击格式化按钮</p>
              <p className="mt-2 text-sm">支持验证和美化JSON数据</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonFormatter;
