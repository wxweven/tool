import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ClockIcon, 
  CodeIcon, 
  LinkIcon, 
  FileTextIcon,
  TerminalIcon,
  CpuIcon,
  GiftIcon,
  ArrowRightIcon
} from "lucide-react";

const toolCards = [
  {
    id: "timestamp",
    title: "时间戳转换",
    description: "时间戳与日期时间相互转换",
    icon: <ClockIcon className="h-6 w-6" />,
    color: "bg-blue-500"
  },
  {
    id: "json",
    title: "JSON格式化",
    description: "格式化、验证并美化JSON数据",
    icon: <CodeIcon className="h-6 w-6" />,
    color: "bg-green-500"
  },
  {
    id: "url",
    title: "URL编解码",
    description: "URL编码与解码工具",
    icon: <LinkIcon className="h-6 w-6" />,
    color: "bg-purple-500"
  },
  {
    id: "plaintext",
    title: "纯文本提取",
    description: "从富文本中提取纯文本内容",
    icon: <FileTextIcon className="h-6 w-6" />,
    color: "bg-amber-500"
  },
  {
    id: "java-json",
    title: "Java转JSON",
    description: "将Java类转换为JSON格式并生成Mock数据",
    icon: <CodeIcon className="h-6 w-6" />,
    color: "bg-red-500"
  },
  {
    id: "shell",
    title: "Shell命令",
    description: "常用Shell命令速查与示例",
    icon: <TerminalIcon className="h-6 w-6" />,
    color: "bg-indigo-500"
  },
  {
    id: "regex",
    title: "正则测试",
    description: "在线测试正则表达式",
    icon: <CpuIcon className="h-6 w-6" />,
    color: "bg-pink-500"
  },
  {
    id: "lottery",
    title: "抽奖工具",
    description: "多轮抽奖工具，支持自定义参与者和奖品",
    icon: <GiftIcon className="h-6 w-6" />,
    color: "bg-orange-500"
  }
];

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          开发者工具箱
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          一站式解决开发中的常见需求，提升工作效率
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolCards.map((tool) => (
          <Link to={`/${tool.id}`} key={tool.id} className="group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader>
                <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  {tool.icon}
                </div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="link" className="pl-0 group-hover:pl-2 transition-all">
                  开始使用 <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">更多工具持续开发中</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          如果您有特定需求或创意工具想法，欢迎反馈给我们
        </p>
      </div>
    </div>
  );
};

export default Index;
