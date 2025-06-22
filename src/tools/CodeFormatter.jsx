import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const CodeFormatter = () => {
  const [language, setLanguage] = useState("javascript");
  const [inputCode, setInputCode] = useState("");
  const [formattedCode, setFormattedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const languageOptions = [
    { value: "javascript", label: "JavaScript", icon: "⚡" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "go", label: "Go", icon: "🐹" },
    { value: "sql", label: "SQL", icon: "🗄️" },
    { value: "typescript", label: "TypeScript", icon: "📘" },
    { value: "css", label: "CSS", icon: "🎨" },
    { value: "html", label: "HTML", icon: "🌐" },
  ];

  // 示例代码
  const sampleCodes = {
    javascript: `function fibonacci(n){if(n<=1)return n;return fibonacci(n-1)+fibonacci(n-2);}const result=fibonacci(10);console.log(result);`,
    java: `public class Calculator{public int add(int a,int b){return a+b;}public int subtract(int a,int b){return a-b;}}`,
    python: `def fibonacci(n):if n<=1:return n;return fibonacci(n-1)+fibonacci(n-2);result=fibonacci(10);print(result)`,
    go: `package main;import "fmt";func fibonacci(n int)int{if n<=1{return n};return fibonacci(n-1)+fibonacci(n-2)};func main(){result:=fibonacci(10);fmt.Println(result)}`,
    sql: `SELECT u.id,u.name,o.order_id,o.total FROM users u LEFT JOIN orders o ON u.id=o.user_id WHERE o.total>100 ORDER BY o.total DESC;`,
    typescript: `interface User{id:number;name:string;email:string;}function createUser(user:User):User{return{...user,id:Date.now()};}const user:User={id:1,name:"John",email:"john@example.com"};`,
    css: `.container{display:flex;justify-content:center;align-items:center;min-height:100vh;background-color:#f5f5f5;}.button{padding:10px 20px;border:none;border-radius:5px;background-color:#007bff;color:white;cursor:pointer;}`,
    html: `<div class="container"><h1>Hello World</h1><p>This is a paragraph</p><button onclick="alert('Hello')">Click me</button></div>`
  };

  const formatCode = (code, lang) => {
    if (!code.trim()) {
      setFormattedCode("");
      return;
    }

    try {
      let formatted = "";
      
      switch (lang) {
        case "javascript":
        case "typescript":
          formatted = formatJavaScript(code);
          break;
        case "java":
          formatted = formatJava(code);
          break;
        case "python":
          formatted = formatPython(code);
          break;
        case "go":
          formatted = formatGo(code);
          break;
        case "sql":
          formatted = formatSQL(code);
          break;
        case "css":
          formatted = formatCSS(code);
          break;
        case "html":
          formatted = formatHTML(code);
          break;
        default:
          formatted = code;
      }
      
      setFormattedCode(formatted);
    } catch (error) {
      setFormattedCode("格式化失败，请检查代码语法");
    }
  };

  const formatJavaScript = (code) => {
    // 简单的JavaScript格式化
    let formatted = code
      .replace(/;/g, ";\n")
      .replace(/{/g, " {\n")
      .replace(/}/g, "\n}")
      .replace(/\(/g, " (")
      .replace(/\)/g, ") ")
      .replace(/,/g, ", ")
      .replace(/\+/g, " + ")
      .replace(/-/g, " - ")
      .replace(/\*/g, " * ")
      .replace(/\//g, " / ")
      .replace(/=/g, " = ")
      .replace(/==/g, " == ")
      .replace(/===/g, " === ")
      .replace(/!=/g, " != ")
      .replace(/!==/g, " !== ")
      .replace(/</g, " < ")
      .replace(/>/g, " > ")
      .replace(/<=/g, " <= ")
      .replace(/>=/g, " >= ")
      .replace(/&&/g, " && ")
      .replace(/\|\|/g, " || ")
      .replace(/\?/g, " ? ")
      .replace(/:/g, " : ")
      .replace(/function/g, "\nfunction")
      .replace(/const/g, "\nconst")
      .replace(/let/g, "\nlet")
      .replace(/var/g, "\nvar")
      .replace(/if/g, "\nif")
      .replace(/else/g, "\nelse")
      .replace(/for/g, "\nfor")
      .replace(/while/g, "\nwhile")
      .replace(/return/g, "\nreturn")
      .replace(/console\.log/g, "\nconsole.log");

    // 清理多余的空行和空格
    formatted = formatted
      .replace(/\n\s*\n/g, "\n")
      .replace(/\s+/g, " ")
      .trim();

    // 添加适当的缩进
    let lines = formatted.split("\n");
    let indentLevel = 0;
    let result = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // 减少缩进的情况
      if (line.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      // 添加缩进
      result.push("  ".repeat(indentLevel) + line);

      // 增加缩进的情况
      if (line.endsWith("{")) {
        indentLevel++;
      }
    }

    return result.join("\n");
  };

  const formatJava = (code) => {
    // 简单的Java格式化
    let formatted = code
      .replace(/;/g, ";\n")
      .replace(/{/g, " {\n")
      .replace(/}/g, "\n}")
      .replace(/\(/g, " (")
      .replace(/\)/g, ") ")
      .replace(/,/g, ", ")
      .replace(/public/g, "\npublic")
      .replace(/private/g, "\nprivate")
      .replace(/protected/g, "\nprotected")
      .replace(/class/g, " class")
      .replace(/interface/g, " interface")
      .replace(/extends/g, " extends")
      .replace(/implements/g, " implements")
      .replace(/return/g, "\nreturn")
      .replace(/if/g, "\nif")
      .replace(/else/g, "\nelse")
      .replace(/for/g, "\nfor")
      .replace(/while/g, "\nwhile");

    // 清理和缩进
    let lines = formatted.split("\n");
    let indentLevel = 0;
    let result = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      result.push("  ".repeat(indentLevel) + line);

      if (line.endsWith("{")) {
        indentLevel++;
      }
    }

    return result.join("\n");
  };

  const formatPython = (code) => {
    // 简单的Python格式化
    let formatted = code
      .replace(/:/g, ":\n")
      .replace(/;/g, ";\n")
      .replace(/def/g, "\ndef")
      .replace(/class/g, "\nclass")
      .replace(/if/g, "\nif")
      .replace(/elif/g, "\nelif")
      .replace(/else/g, "\nelse")
      .replace(/for/g, "\nfor")
      .replace(/while/g, "\nwhile")
      .replace(/return/g, "\nreturn")
      .replace(/import/g, "\nimport")
      .replace(/from/g, "\nfrom")
      .replace(/print/g, "\nprint");

    // 清理和缩进
    let lines = formatted.split("\n");
    let indentLevel = 0;
    let result = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith("elif") || line.startsWith("else")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      result.push("  ".repeat(indentLevel) + line);

      if (line.endsWith(":")) {
        indentLevel++;
      }
    }

    return result.join("\n");
  };

  const formatGo = (code) => {
    // 简单的Go格式化
    let formatted = code
      .replace(/;/g, ";\n")
      .replace(/{/g, " {\n")
      .replace(/}/g, "\n}")
      .replace(/\(/g, " (")
      .replace(/\)/g, ") ")
      .replace(/,/g, ", ")
      .replace(/func/g, "\nfunc")
      .replace(/package/g, "\npackage")
      .replace(/import/g, "\nimport")
      .replace(/var/g, "\nvar")
      .replace(/const/g, "\nconst")
      .replace(/type/g, "\ntype")
      .replace(/struct/g, " struct")
      .replace(/interface/g, " interface")
      .replace(/return/g, "\nreturn")
      .replace(/if/g, "\nif")
      .replace(/else/g, "\nelse")
      .replace(/for/g, "\nfor")
      .replace(/range/g, " range")
      .replace(/:=/g, " := ");

    // 清理和缩进
    let lines = formatted.split("\n");
    let indentLevel = 0;
    let result = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      result.push("  ".repeat(indentLevel) + line);

      if (line.endsWith("{")) {
        indentLevel++;
      }
    }

    return result.join("\n");
  };

  const formatSQL = (code) => {
    // 简单的SQL格式化
    let formatted = code
      .replace(/SELECT/gi, "\nSELECT")
      .replace(/FROM/gi, "\nFROM")
      .replace(/WHERE/gi, "\nWHERE")
      .replace(/ORDER BY/gi, "\nORDER BY")
      .replace(/GROUP BY/gi, "\nGROUP BY")
      .replace(/HAVING/gi, "\nHAVING")
      .replace(/JOIN/gi, "\nJOIN")
      .replace(/LEFT JOIN/gi, "\nLEFT JOIN")
      .replace(/RIGHT JOIN/gi, "\nRIGHT JOIN")
      .replace(/INNER JOIN/gi, "\nINNER JOIN")
      .replace(/OUTER JOIN/gi, "\nOUTER JOIN")
      .replace(/ON/gi, "\n  ON")
      .replace(/AND/gi, "\n  AND")
      .replace(/OR/gi, "\n  OR")
      .replace(/,/g, ",\n  ")
      .replace(/;/g, ";\n");

    return formatted.trim();
  };

  const formatCSS = (code) => {
    // 简单的CSS格式化
    let formatted = code
      .replace(/{/g, " {\n")
      .replace(/}/g, "\n}\n")
      .replace(/;/g, ";\n")
      .replace(/,/g, ", ")
      .replace(/:/g, ": ")
      .replace(/\./g, "\n.")
      .replace(/#/g, "\n#")
      .replace(/@media/g, "\n@media")
      .replace(/@keyframes/g, "\n@keyframes");

    // 清理和缩进
    let lines = formatted.split("\n");
    let indentLevel = 0;
    let result = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      if (line.startsWith("}")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      result.push("  ".repeat(indentLevel) + line);

      if (line.endsWith("{")) {
        indentLevel++;
      }
    }

    return result.join("\n");
  };

  const formatHTML = (code) => {
    // 简单的HTML格式化
    let formatted = code
      .replace(/</g, "\n<")
      .replace(/>/g, ">\n")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    // 清理和缩进
    let lines = formatted.split("\n");
    let indentLevel = 0;
    let result = [];

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // 减少缩进的情况
      if (line.startsWith("</")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      result.push("  ".repeat(indentLevel) + line);

      // 增加缩进的情况
      if (line.startsWith("<") && !line.startsWith("</") && !line.endsWith("/>")) {
        indentLevel++;
      }
    }

    return result.join("\n");
  };

  const handleFormat = () => {
    formatCode(inputCode, language);
  };

  const handleCopy = async () => {
    if (formattedCode) {
      try {
        await navigator.clipboard.writeText(formattedCode);
        setCopied(true);
        toast.success("代码已复制到剪贴板");
        setTimeout(() => setCopied(false), 1000);
      } catch (err) {
        toast.error("复制失败");
      }
    }
  };

  const handleClear = () => {
    setInputCode("");
    setFormattedCode("");
  };

  const loadSample = () => {
    const sample = sampleCodes[language] || "";
    setInputCode(sample);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="formatter" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="formatter">代码格式化</TabsTrigger>
              <TabsTrigger value="samples">示例代码</TabsTrigger>
            </TabsList>
            
            <TabsContent value="formatter" className="space-y-6 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>输入代码</Label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={loadSample}>
                        加载示例
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClear}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    placeholder="在此输入需要格式化的代码..."
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>格式化结果</Label>
                    <div className="flex gap-2">
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex items-center gap-2">
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleFormat} size="sm">
                        格式化
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCopy}
                        disabled={!formattedCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Textarea
                      value={formattedCode}
                      readOnly
                      className="min-h-[400px] font-mono text-sm bg-muted"
                      placeholder="格式化后的代码将显示在这里..."
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="samples" className="py-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>选择语言：</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={loadSample}>加载示例</Button>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <Label className="text-sm font-medium mb-2 block">示例代码：</Label>
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {sampleCodes[language] || "暂无示例代码"}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeFormatter; 