import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon } from "lucide-react";

const UrlEncoder = () => {
  const defaultExample = "https://example.com/search?q=你好 世界";
  const [input, setInput] = useState(defaultExample);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const encodeUrl = () => {
    try {
      setOutput(encodeURIComponent(input));
    } catch (err) {
      setOutput("编码失败: " + err.message);
    }
  };

  const decodeUrl = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (err) {
      setOutput("解码失败: " + err.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  const loadExample = () => {
    setInput(defaultExample);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="url-input">输入内容</Label>
              <Textarea
                id="url-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入需要编码或解码的内容"
                rows={8}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={encodeUrl}>URL编码</Button>
              <Button onClick={decodeUrl}>URL解码</Button>
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
            <CardTitle>转换结果</CardTitle>
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
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
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
              <p>输入内容并选择编码或解码操作</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlEncoder;
