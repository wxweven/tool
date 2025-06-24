import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const RegexTester = () => {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const [isMultiline, setIsMultiline] = useState(false);
  const [isCaseInsensitive, setIsCaseInsensitive] = useState(false);

  const updateFlags = () => {
    let newFlags = "g"; // 始终包含全局匹配
    if (isMultiline) newFlags += "m";
    if (isCaseInsensitive) newFlags += "i";
    setFlags(newFlags);
  };

  const testRegex = () => {
    if (!pattern) {
      setError("请输入正则表达式");
      setMatches([]);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const results = [];
      let match;

      while ((match = regex.exec(testText)) !== null) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        });
      }

      setMatches(results);
      setError("");
    } catch (err) {
      setError("正则表达式语法错误: " + err.message);
      setMatches([]);
    }
  };

  const clearAll = () => {
    setPattern("");
    setTestText("");
    setMatches([]);
    setError("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="pattern">正则表达式</Label>
              <Input
                id="pattern"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式，如: \w+"
                className="font-mono"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="multiline"
                  checked={isMultiline}
                  onCheckedChange={(checked) => {
                    setIsMultiline(checked);
                    updateFlags();
                  }}
                />
                <Label htmlFor="multiline">多行模式 (m)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="case-insensitive"
                  checked={isCaseInsensitive}
                  onCheckedChange={(checked) => {
                    setIsCaseInsensitive(checked);
                    updateFlags();
                  }}
                />
                <Label htmlFor="case-insensitive">忽略大小写 (i)</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="test-text">测试文本</Label>
              <Textarea
                id="test-text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="输入要测试的文本"
                rows={6}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={testRegex}>测试</Button>
              <Button variant="secondary" onClick={clearAll}>
                清空
              </Button>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>匹配结果</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                找到 {matches.length} 个匹配
              </p>
              <div className="space-y-2">
                {matches.map((match, index) => (
                  <div
                    key={index}
                    className="border rounded p-3 space-y-2"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">匹配 #{index + 1}</span>
                      <span className="text-sm text-muted-foreground">
                        位置: {match.index}
                      </span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      <code className="text-sm">{match.match}</code>
                    </div>
                    {match.groups.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium">捕获组:</p>
                        {match.groups.map((group, i) => (
                          <div key={i} className="ml-4">
                            Group {i + 1}: {group}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {error ? (
                <p>请修正正则表达式后重试</p>
              ) : (
                <p>输入正则表达式和测试文本开始测试</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegexTester;
