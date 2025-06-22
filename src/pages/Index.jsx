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
  ArrowRightIcon,
  CalculatorIcon,
  WrenchIcon,
  HeartIcon,
  FileCodeIcon,
  ChevronUpIcon
} from "lucide-react";
import { useState, useEffect } from "react";

const devTools = [
  {
    id: "json",
    title: "JSON格式化",
    description: "格式化、验证并美化JSON数据",
    icon: <CodeIcon className="h-5 w-5" />,
    color: "bg-green-500"
  },
  {
    id: "timestamp",
    title: "时间戳转换",
    description: "时间戳与日期时间相互转换",
    icon: <ClockIcon className="h-5 w-5" />,
    color: "bg-blue-500"
  },
  {
    id: "java-json",
    title: "Java转JSON",
    description: "将Java类转换为JSON格式并生成Mock数据",
    icon: <CodeIcon className="h-5 w-5" />,
    color: "bg-red-500"
  },
  {
    id: "url",
    title: "URL编解码",
    description: "URL编码与解码工具",
    icon: <LinkIcon className="h-5 w-5" />,
    color: "bg-purple-500"
  },
  {
    id: "code-formatter",
    title: "代码格式化",
    description: "支持多种编程语言的代码格式化",
    icon: <FileCodeIcon className="h-5 w-5" />,
    color: "bg-teal-500"
  },
  {
    id: "plaintext",
    title: "纯文本提取",
    description: "从富文本中提取纯文本内容",
    icon: <FileTextIcon className="h-5 w-5" />,
    color: "bg-amber-500"
  },
  {
    id: "shell",
    title: "Shell命令",
    description: "常用Shell命令速查与示例",
    icon: <TerminalIcon className="h-5 w-5" />,
    color: "bg-indigo-500"
  },
  {
    id: "regex",
    title: "正则测试",
    description: "在线测试正则表达式",
    icon: <CpuIcon className="h-5 w-5" />,
    color: "bg-pink-500"
  }
];

const lifeTools = [
  {
    id: "lottery",
    title: "年会抽奖工具",
    description: "年会多轮抽奖工具，支持自定义参与者和奖品",
    icon: <GiftIcon className="h-5 w-5" />,
    color: "bg-orange-500"
  },
  {
    id: "mortgage",
    title: "房贷计算器",
    description: "支持等额本息和等额本金两种还款方式",
    icon: <CalculatorIcon className="h-5 w-5" />,
    color: "bg-cyan-500"
  }
];

const ToolCategory = ({ title, icon, tools }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-muted">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Link to={`/${tool.id}`} key={tool.id} className="group">
            <Card className="h-full transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className={`${tool.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  {tool.icon}
                </div>
                <CardTitle className="text-base">{tool.title}</CardTitle>
                <CardDescription className="text-sm">{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button variant="link" className="pl-0 group-hover:pl-2 transition-all text-sm p-0 h-auto">
                  开始使用 <ArrowRightIcon className="ml-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
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

  return (
    <>
      {isVisible && (
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

const Index = () => {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
          开发者工具箱
        </h1>
      </div>

      <ToolCategory 
        title="开发者工具" 
        icon={<WrenchIcon className="h-4 w-4" />} 
        tools={devTools} 
      />
      
      <ToolCategory 
        title="生活工具" 
        icon={<HeartIcon className="h-4 w-4" />} 
        tools={lifeTools} 
      />

      <div className="mt-6 text-center">
        <h2 className="text-xl font-semibold mb-2">一站式解决开发/生活中的常见需求，提升工作效率</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          如果您有特定需求或创意工具想法，欢迎反馈给我。个人微信：wxweven
        </p>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Index;
