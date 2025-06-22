import TimestampConverter from "../tools/TimestampConverter";
import JsonFormatter from "../tools/JsonFormatter";
import UrlEncoder from "../tools/UrlEncoder";
import PlainTextExtractor from "../tools/PlainTextExtractor";
import JavaToJson from "../tools/JavaToJson";
import ShellCommands from "../tools/ShellCommands";
import RegexTester from "../tools/RegexTester";
import LotteryTool from "../tools/LotteryTool";
import MortgageCalculator from "../tools/MortgageCalculator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { HomeIcon } from "lucide-react";

const ToolPage = ({ toolId }) => {

  const renderTool = () => {
    switch (toolId) {
      case "timestamp":
        return <TimestampConverter />;
      case "json":
        return <JsonFormatter />;
      case "url":
        return <UrlEncoder />;
      case "plaintext":
        return <PlainTextExtractor />;
      case "java-json":
        return <JavaToJson />;
      case "shell":
        return <ShellCommands />;
      case "regex":
        return <RegexTester />;
      case "lottery":
        return <LotteryTool />;
      case "mortgage":
        return <MortgageCalculator />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">工具未找到</h2>
            <p className="text-muted-foreground mt-2">请选择正确的工具</p>
          </div>
        );
    }
  };

  const getToolTitle = () => {
    const titles = {
      timestamp: "时间戳转换器",
      json: "JSON格式化工具",
      url: "URL编解码工具",
      plaintext: "纯文本提取工具",
      "java-json": "Java类转JSON工具",
      shell: "Shell命令速查",
      regex: "正则表达式测试器",
      lottery: "抽奖工具",
      mortgage: "房贷计算器"
    };
    return titles[toolId] || "开发工具箱";
  };

  const getToolDescription = () => {
    const descriptions = {
      timestamp: "时间戳与日期时间相互转换工具",
      json: "格式化、验证并美化JSON数据",
      url: "URL编码与解码工具",
      plaintext: "从富文本中提取纯文本内容",
      "java-json": "将Java类转换为JSON格式并生成Mock数据",
      shell: "常用Shell命令速查与示例",
      regex: "在线测试正则表达式",
      lottery: "多轮抽奖工具，支持自定义参与者和奖品",
      mortgage: "房贷计算器，支持等额本息和等额本金两种还款方式"
    };
    return descriptions[toolId] || "多功能开发工具箱";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{getToolTitle()}</CardTitle>
              <CardDescription>{getToolDescription()}</CardDescription>
            </div>
            <Link to="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
              <HomeIcon className="mr-1 h-4 w-4" />
              返回首页
            </Link>
          </div>
        </CardHeader>
      </Card>
      
      {renderTool()}
    </div>
  );
};

export default ToolPage;
