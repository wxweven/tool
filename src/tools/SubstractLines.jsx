import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyIcon, DownloadIcon, MinusIcon, ChevronUpIcon } from "lucide-react";

const SubstractLines = () => {
  const defaultText1 = "apple\nbanana\norange\ngrape";
  const defaultText2 = "apple\nbanana";
  const [text1, setText1] = useState(defaultText1);
  const [text2, setText2] = useState(defaultText2);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

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

  const substractLines = () => {
    if (!text1.trim() && !text2.trim()) {
      setResult("");
      return;
    }

    // 将文本按行分割并去重
    const lines1 = text1.trim().split('\n').filter(line => line.trim() !== '');
    const lines2 = text2.trim().split('\n').filter(line => line.trim() !== '');

    // 创建Set用于快速查找
    const set2 = new Set(lines2);

    // 找出在text1中但不在text2中的行
    const resultLines = lines1.filter(line => !set2.has(line));

    // 去重并保持顺序
    const uniqueResult = [...new Set(resultLines)];

    setResult(uniqueResult.join('\n'));
  };

  const copyToClipboard = () => {
    if (!result) return;

    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsCsv = () => {
    if (!result) return;

    const lines = result.split('\n');
    const csvContent = lines.map(line => `"${line}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'substract_result.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setText1("");
    setText2("");
    setResult("");
  };

  const testExample = () => {
    setText1(defaultText1);
    setText2(defaultText2);
  };

  const resultLines = result.split('\n').filter(line => line.trim() !== '').length;
  const showDownloadButton = resultLines > 500;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_1fr] gap-4">
        {/* 文本1输入 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MinusIcon className="h-5 w-5 text-red-500" />
              文本A
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="text1-input">输入第一段文本（每行一个元素）</Label>
                <Textarea
                  id="text1-input"
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="请输入第一段文本，每行一个元素&#10;例如：&#10;1&#10;2&#10;3"
                  rows={12}
                  className="font-mono mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 减号显示 */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl text-blue-500">-</div>
            <div className="text-xs text-blue-500 text-center">
              减去
            </div>
          </div>
        </div>

        {/* 文本2输入 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MinusIcon className="h-5 w-5 text-blue-500" />
              文本B
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="text2-input">输入第二段文本（每行一个元素）</Label>
                <Textarea
                  id="text2-input"
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  placeholder="请输入第二段文本，每行一个元素&#10;例如：&#10;1&#10;2"
                  rows={12}
                  className="font-mono mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 结果输出 */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MinusIcon className="h-5 w-5 text-green-500" />
                结果
                {resultLines > 0 && (
                  <span className="text-sm text-muted-foreground">({resultLines}行)</span>
                )}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!result}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
                {showDownloadButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsCsv}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="relative">
                <Textarea
                  value={result}
                  readOnly
                  rows={12}
                  className="font-mono bg-muted"
                />

                {copied && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    已复制!
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">输入两段文本并点击相减按钮</p>
                <p className="mt-2 text-xs">结果将显示在文本A中但不在文本B中的行</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 flex gap-2 flex-wrap justify-center">
        <Button onClick={substractLines} className="bg-red-500 hover:bg-red-600">
          <MinusIcon className="mr-2 h-4 w-4" /> 执行相减
        </Button>
        <Button variant="secondary" onClick={clearAll}>
          清空所有
        </Button>
        <Button variant="outline" onClick={testExample}>
          测试示例
        </Button>
      </div>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• 在左侧输入框中输入文本A，每行一个元素</p>
            <p>• 在右侧输入框中输入文本B，每行一个元素</p>
            <p>• 点击"执行相减"按钮，结果将显示在下方</p>
            <p>• 结果会自动去重，只显示在文本A中但不在文本B中的行</p>
            <p>• 当结果超过500行时，可以下载为CSV文件</p>
          </div>
        </CardContent>
      </Card>

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

export default SubstractLines;