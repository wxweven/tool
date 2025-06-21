import { 
  HomeIcon, 
  ClockIcon, 
  CodeIcon, 
  LinkIcon, 
  FileTextIcon,
  TerminalIcon,
  CpuIcon,
  GiftIcon
} from "lucide-react";
import Index from "./pages/Index.jsx";
import ToolPage from "./pages/ToolPage.jsx";

/**
* Central place for defining the navigation items. Used for navigation components and routing.
*/
export const navItems = [
  {
    title: "首页",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "时间戳转换",
    to: "/timestamp",
    icon: <ClockIcon className="h-4 w-4" />,
    page: <ToolPage toolId="timestamp" />,
  },
  {
    title: "JSON格式化",
    to: "/json",
    icon: <CodeIcon className="h-4 w-4" />,
    page: <ToolPage toolId="json" />,
  },
  {
    title: "URL编解码",
    to: "/url",
    icon: <LinkIcon className="h-4 w-4" />,
    page: <ToolPage toolId="url" />,
  },
  {
    title: "纯文本提取",
    to: "/plaintext",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <ToolPage toolId="plaintext" />,
  },
  {
    title: "Java转JSON",
    to: "/java-json",
    icon: <CodeIcon className="h-4 w-4" />,
    page: <ToolPage toolId="java-json" />,
  },
  {
    title: "Shell命令",
    to: "/shell",
    icon: <TerminalIcon className="h-4 w-4" />,
    page: <ToolPage toolId="shell" />,
  },
  {
    title: "正则测试",
    to: "/regex",
    icon: <CpuIcon className="h-4 w-4" />,
    page: <ToolPage toolId="regex" />,
  },
  {
    title: "抽奖工具",
    to: "/lottery",
    icon: <GiftIcon className="h-4 w-4" />,
    page: <ToolPage toolId="lottery" />,
  },
];
