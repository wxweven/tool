import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CopyIcon, SearchIcon } from "lucide-react";

const shellCommands = [
  {
    category: "文本处理",
    commands: [
      {
        name: "grep",
        description: "搜索文本内容",
        example: "grep 'pattern' filename",
        usage: "在文件中搜索指定的文本模式"
      },
      {
        name: "sed",
        description: "流编辑器",
        example: "sed 's/old/new/g' filename",
        usage: "替换文本内容"
      },
      {
        name: "awk",
        description: "文本分析工具",
        example: "awk '{print $1}' filename",
        usage: "处理和分析文本数据"
      }
    ]
  },
  {
    category: "文件操作",
    commands: [
      {
        name: "find",
        description: "查找文件",
        example: "find . -name '*.txt'",
        usage: "在目录中查找文件"
      },
      {
        name: "sort",
        description: "排序文件内容",
        example: "sort filename",
        usage: "对文件内容进行排序"
      },
      {
        name: "uniq",
        description: "去除重复行",
        example: "sort filename | uniq",
        usage: "删除文件中的重复行"
      }
    ]
  },
  {
    category: "系统监控",
    commands: [
      {
        name: "top",
        description: "进程监控",
        example: "top",
        usage: "显示系统进程信息"
      },
      {
        name: "ps",
        description: "进程状态",
        example: "ps aux",
        usage: "查看进程状态"
      },
      {
        name: "netstat",
        description: "网络连接",
        example: "netstat -an",
        usage: "显示网络连接信息"
      }
    ]
  }
];

const ShellCommands = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  };

  const filteredCommands = shellCommands.map(category => ({
    ...category,
    commands: category.commands.filter(cmd =>
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.commands.length > 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shell命令速查</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索命令..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredCommands.map((category) => (
        <Card key={category.category}>
          <CardHeader>
            <CardTitle>{category.category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.commands.map((cmd) => (
                <div
                  key={cmd.name}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{cmd.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cmd.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(cmd.example)}
                    >
                      <CopyIcon className="h-4 w-4 mr-2" />
                      复制
                    </Button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-2">
                    <code className="text-sm">{cmd.example}</code>
                  </div>
                  {copied === cmd.example && (
                    <div className="text-green-500 text-sm">已复制!</div>
                  )}
                  <p className="text-sm text-muted-foreground">{cmd.usage}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredCommands.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>未找到匹配的命令</p>
        </div>
      )}
    </div>
  );
};

export default ShellCommands;
