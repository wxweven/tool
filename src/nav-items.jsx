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
  HeartIcon,
  FileCodeIcon,
  BracesIcon,
  FileDiffIcon,
  FilterIcon,
  DownloadIcon,
  MinusIcon,
  TextIcon,
  StarIcon,
  ZapIcon
} from "lucide-react";
import Index from "./pages/Index.jsx";
import ToolPage from "./pages/ToolPage.jsx";
import FavoritesPage from "./pages/FavoritesPage.jsx";

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
    title: "我的收藏",
    to: "/favorites",
    icon: <StarIcon className="h-4 w-4" />,
    page: <FavoritesPage />,
  },
  {
    title: "JSON格式化",
    to: "/json",
    icon: <CodeIcon className="h-4 w-4" />,
    page: <ToolPage toolId="json" />,
  },
  {
    title: "时间戳转换",
    to: "/timestamp",
    icon: <ClockIcon className="h-4 w-4" />,
    page: <ToolPage toolId="timestamp" />,
  },
  {
    title: "Java转JSON",
    to: "/java-json",
    icon: <CodeIcon className="h-4 w-4" />,
    page: <ToolPage toolId="java-json" />,
  },
  {
    title: "toString转JSON",
    to: "/java-tostring",
    icon: <BracesIcon className="h-4 w-4" />,
    page: <ToolPage toolId="java-tostring" />,
  },
  {
    title: "URL编解码",
    to: "/url",
    icon: <LinkIcon className="h-4 w-4" />,
    page: <ToolPage toolId="url" />,
  },
  {
    title: "代码格式化",
    to: "/code-formatter",
    icon: <FileCodeIcon className="h-4 w-4" />,
    page: <ToolPage toolId="code-formatter" />,
  },
  {
    title: "文本Diff",
    to: "/text-diff",
    icon: <FileDiffIcon className="h-4 w-4" />,
    page: <ToolPage toolId="text-diff" />,
  },
  {
    title: "文本去重",
    to: "/remove-duplicates",
    icon: <FilterIcon className="h-4 w-4" />,
    page: <ToolPage toolId="remove-duplicates" />,
  },
  {
    title: "文本相减",
    to: "/substract-lines",
    icon: <MinusIcon className="h-4 w-4" />,
    page: <ToolPage toolId="substract-lines" />,
  },
  {
    title: "批量下载文件",
    to: "/download-files",
    icon: <DownloadIcon className="h-4 w-4" />,
    page: <ToolPage toolId="download-files" />,
  },
  {
    title: "纯文本提取",
    to: "/plaintext",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <ToolPage toolId="plaintext" />,
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
    title: "年会抽奖工具",
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
  {
    title: "批量生成",
    to: "/batch-generator",
    icon: <ZapIcon className="h-4 w-4" />,
    page: <ToolPage toolId="batch-generator" />,
  },
];

// 分类导航菜单
export const categoryNavItems = [
  {
    title: "我的收藏",
    icon: <StarIcon className="h-4 w-4" />,
    to: "/favorites"
  },
  {
    title: "效率工具",
    icon: <ZapIcon className="h-4 w-4" />,
    items: [
      {
        title: "批量生成",
        to: "/batch-generator",
        icon: <ZapIcon className="h-4 w-4" />,
      },
    ]
  },
  {
    title: "开发者工具",
    icon: <WrenchIcon className="h-4 w-4" />,
    items: [
      {
        title: "JSON格式化",
        to: "/json",
        icon: <CodeIcon className="h-4 w-4" />,
      },
      {
        title: "时间戳转换",
        to: "/timestamp",
        icon: <ClockIcon className="h-4 w-4" />,
      },
      {
        title: "Java转JSON",
        to: "/java-json",
        icon: <CodeIcon className="h-4 w-4" />,
      },
      {
        title: "toString转JSON",
        to: "/java-tostring",
        icon: <BracesIcon className="h-4 w-4" />,
      },
      {
        title: "URL编解码",
        to: "/url",
        icon: <LinkIcon className="h-4 w-4" />,
      },
      {
        title: "代码格式化",
        to: "/code-formatter",
        icon: <FileCodeIcon className="h-4 w-4" />,
      },
      {
        title: "批量下载文件",
        to: "/download-files",
        icon: <DownloadIcon className="h-4 w-4" />,
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
    title: "文本工具",
    icon: <TextIcon className="h-4 w-4" />,
    items: [
      {
        title: "文本Diff",
        to: "/text-diff",
        icon: <FileDiffIcon className="h-4 w-4" />,
      },
      {
        title: "文本去重",
        to: "/remove-duplicates",
        icon: <FilterIcon className="h-4 w-4" />,
      },
      {
        title: "文本相减",
        to: "/substract-lines",
        icon: <MinusIcon className="h-4 w-4" />,
      },
      {
        title: "纯文本提取",
        to: "/plaintext",
        icon: <FileTextIcon className="h-4 w-4" />,
      },
    ]
  },
  {
    title: "生活工具",
    icon: <HeartIcon className="h-4 w-4" />,
    items: [
      {
        title: "年会抽奖工具",
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
