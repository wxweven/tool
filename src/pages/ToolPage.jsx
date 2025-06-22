import TimestampConverter from "../tools/TimestampConverter";
import JsonFormatter from "../tools/JsonFormatter";
import UrlEncoder from "../tools/UrlEncoder";
import PlainTextExtractor from "../tools/PlainTextExtractor";
import JavaToJson from "../tools/JavaToJson";
import ShellCommands from "../tools/ShellCommands";
import RegexTester from "../tools/RegexTester";
import LotteryTool from "../tools/LotteryTool";
import MortgageCalculator from "../tools/MortgageCalculator";
import CodeFormatter from "../tools/CodeFormatter";

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
      case "code-formatter":
        return <CodeFormatter />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">工具未找到</h2>
            <p className="text-muted-foreground mt-2">请选择正确的工具</p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {renderTool()}
    </div>
  );
};

export default ToolPage;
