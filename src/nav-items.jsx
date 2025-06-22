import { 
  HomeIcon, 
  ClockIcon, 
  CodeIcon, 
  LinkIcon, 
  FileTextIcon,
  TerminalIcon,
  CpuIcon,
  GiftIcon,
  CalculatorIcon,
  WrenchIcon,
  HeartIcon
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
  {
    title: "房贷计算器",
    to: "/mortgage",
    icon: <CalculatorIcon className="h-4 w-4" />,
    page: <ToolPage toolId="mortgage" />,
  },
];

// 分类导航菜单
export const categoryNavItems = [
  {
    title: "开发者工具",
    icon: <WrenchIcon className="h-4 w-4" />,
    items: [
      {
        title: "时间戳转换",
        to: "/timestamp",
        icon: <ClockIcon className="h-4 w-4" />,
      },
      {
        title: "JSON格式化",
        to: "/json",
        icon: <CodeIcon className="h-4 w-4" />,
      },
      {
        title: "URL编解码",
        to: "/url",
        icon: <LinkIcon className="h-4 w-4" />,
      },
      {
        title: "纯文本提取",
        to: "/plaintext",
        icon: <FileTextIcon className="h-4 w-4" />,
      },
      {
        title: "Java转JSON",
        to: "/java-json",
        icon: <CodeIcon className="h-4 w-4" />,
      },
      {
        title: "Shell命令",
        to: "/shell",
        icon: <TerminalIcon className="h-4 w-4" />,
      },
      {
        title: "正则测试",
        to: "/regex",
        icon: <CpuIcon className="h-4 w-4" />,
      },
    ]
  },
  {
    title: "生活工具",
    icon: <HeartIcon className="h-4 w-4" />,
    items: [
      {
        title: "抽奖工具",
        to: "/lottery",
        icon: <GiftIcon className="h-4 w-4" />,
      },
      {
        title: "房贷计算器",
        to: "/mortgage",
        icon: <CalculatorIcon className="h-4 w-4" />,
      },
    ]
  }
];
