import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, Wand2Icon } from "lucide-react";

const JavaToJson = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  // 默认示例
  const defaultExample = `public class User {
    private String username;
    private String email;
    private Integer age;
    private Boolean isActive;
    private Date createTime;
    private Long userId;
    private Double balance;
}`;

  const loadExample = () => {
    setInput(defaultExample);
    setOutput("");
  };

  const convertToJson = () => {
    if (!input) return;

    try {
      // 简单的Java类解析逻辑
      const lines = input.split("\n");
      const fields = {};
      
      lines.forEach(line => {
        // 匹配private/public字段定义
        const fieldMatch = line.match(/\s*(private|public)\s+(\w+)\s+(\w+)\s*;/);
        if (fieldMatch) {
          const [, , type, name] = fieldMatch;
          // 根据类型生成模拟数据
          fields[name] = getMockValue(type);
        }
      });

      setOutput(JSON.stringify(fields, null, 2));
    } catch (err) {
      setOutput("转换失败: " + err.message);
    }
  };

  const getMockValue = (type) => {
    switch (type.toLowerCase()) {
      case "string":
        return "示例文本";
      case "integer":
      case "int":
        return 0;
      case "long":
        return 1000;
      case "double":
      case "float":
        return 0.0;
      case "boolean":
        return false;
      case "date":
        return new Date().toISOString();
      default:
        return null;
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Java类转JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="java-input">Java类代码</Label>
              <Textarea
                id="java-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={defaultExample}
                rows={12}
                className="font-mono mt-1"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={convertToJson}>
                <Wand2Icon className="mr-2 h-4 w-4" />
                转换为JSON
              </Button>
              <Button variant="secondary" onClick={clearAll}>
                清空
              </Button>
              <Button variant="outline" onClick={loadExample}>
                示例
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
              disabled={!output}
            >
              <CopyIcon className="mr-2 h-4 w-4" />
              复制
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {output ? (
            <div className="relative">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto font-mono text-sm">
                {output}
              </pre>
              
              {copied && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  已复制!
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>输入Java类代码并点击转换按钮</p>
              <p className="mt-2 text-sm">支持基本数据类型的转换和Mock数据生成</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JavaToJson;
