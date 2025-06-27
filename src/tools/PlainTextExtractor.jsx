import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon } from "lucide-react";

const PlainTextExtractor = () => {
  const defaultExample = `<h1>这是一个标题</h1><p>这是一个段落，其中包含<b>粗体</b>和<i>斜体</i>文本。</p><ul><li>列表项1</li><li>列表项2</li></ul>`;
  const [input, setInput] = useState(defaultExample);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const extractPlainText = () => {
    if (!input) return;

    // 创建一个临时的div元素来解析HTML
    const temp = document.createElement("div");
    temp.innerHTML = input;

    // 获取纯文本内容
    const plainText = temp.textContent || temp.innerText || "";

    // 清理空白字符
    setOutput(plainText.trim());
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

  const loadExample = () => {
    setInput(defaultExample);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="rich-text">富文本内容</Label>
              <Textarea
                id="rich-text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴包含格式的文本内容"
                rows={8}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={extractPlainText}>提取纯文本</Button>
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
            <CardTitle>提取结果</CardTitle>
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
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto whitespace-pre-wrap">
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
              <p>粘贴带格式的文本内容并点击提取按钮</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlainTextExtractor;
