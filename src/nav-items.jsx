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
  ZapIcon,
  QrCode,
  Shuffle,
  Wallet,
  Quote,
  Key,
  Palette,
  Hash,
  ImageIcon,
  FileImage,
  Shield,
  Command,
  Globe,
  Gamepad2,
  PillIcon,
  TargetIcon,
  Code
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
    title: "通用文本处理",
    to: "/text-processor",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <ToolPage toolId="text-processor" />,
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
    title: "Excel/CSV转SQL",
    to: "/excel-to-sql",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <ToolPage toolId="excel-to-sql" />,
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
    title: "批量随机生成",
    to: "/batch-generator",
    icon: <ZapIcon className="h-4 w-4" />,
    page: <ToolPage toolId="batch-generator" />,
  },
  {
    title: "倒数日/纪念日提醒",
    to: "/countdown-reminder",
    icon: <ClockIcon className="h-4 w-4" />,
    page: <ToolPage toolId="countdown-reminder" />,
  },
  {
    title: "随机午餐/晚餐",
    to: "/lunch-randomizer",
    icon: <HeartIcon className="h-4 w-4" />,
    page: <ToolPage toolId="lunch-randomizer" />,
  },
  {
    title: "快递单号追踪",
    to: "/express-tracker",
    icon: <LinkIcon className="h-4 w-4" />,
    page: <ToolPage toolId="express-tracker" />,
  },
  {
    title: "单位换算器",
    to: "/unit-converter",
    icon: <CalculatorIcon className="h-4 w-4" />,
    page: <ToolPage toolId="unit-converter" />,
  },
  {
    title: "健康BMI计算器",
    to: "/bmi-calculator",
    icon: <HeartIcon className="h-4 w-4" />,
    page: <ToolPage toolId="bmi-calculator" />,
  },
  {
    title: "每日一句/毒鸡汤",
    to: "/daily-quote",
    icon: <Quote className="h-4 w-4" />,
    page: <ToolPage toolId="daily-quote" />,
  },
  {
    title: "二维码生成与识别",
    to: "/qr-code",
    icon: <QrCode className="h-4 w-4" />,
    page: <ToolPage toolId="qr-code" />,
  },
  {
    title: "随机抽签/分组",
    to: "/random-group",
    icon: <Shuffle className="h-4 w-4" />,
    page: <ToolPage toolId="random-group" />,
  },
  {
    title: "记账/小账本",
    to: "/expense-tracker",
    icon: <Wallet className="h-4 w-4" />,
    page: <ToolPage toolId="expense-tracker" />,
  },
  {
    title: "密码生成器",
    to: "/password-generator",
    icon: <Key className="h-4 w-4" />,
    page: <ToolPage toolId="password-generator" />,
  },
  {
    title: "番茄钟工具",
    to: "/pomodoro-timer",
    icon: <ClockIcon className="h-4 w-4" />,
    page: <ToolPage toolId="pomodoro-timer" />,
  },
  {
    title: "颜色工具箱",
    to: "/color-toolkit",
    icon: <Palette className="h-4 w-4" />,
    page: <ToolPage toolId="color-toolkit" />,
  },
  {
    title: "进制转换器",
    to: "/number-base-converter",
    icon: <Hash className="h-4 w-4" />,
    page: <ToolPage toolId="number-base-converter" />,
  },
  {
    title: "图片压缩工具",
    to: "/image-compressor",
    icon: <ImageIcon className="h-4 w-4" />,
    page: <ToolPage toolId="image-compressor" />,
  },
  {
    title: "无效图片URL检测",
    to: "/invalid-image-url-detector",
    icon: <ImageIcon className="h-4 w-4" />,
    page: <ToolPage toolId="invalid-image-url-detector" />,
  },
  {
    title: "图片处理工具",
    to: "/picture-processor",
    icon: <FileImage className="h-4 w-4" />,
    page: <ToolPage toolId="picture-processor" />,
  },
  {
    title: "文件哈希计算器",
    to: "/file-hash-calculator",
    icon: <Shield className="h-4 w-4" />,
    page: <ToolPage toolId="file-hash-calculator" />,
  },
  {
    title: "快捷键查询",
    to: "/shortcut-keys-reference",
    icon: <Command className="h-4 w-4" />,
    page: <ToolPage toolId="shortcut-keys-reference" />,
  },
  {
    title: "网络工具集",
    to: "/network-utilities",
    icon: <Globe className="h-4 w-4" />,
    page: <ToolPage toolId="network-utilities" />,
  },
  {
    title: "数字华容道",
    to: "/number-puzzle",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <ToolPage toolId="number-puzzle" />,
  },
  {
    title: "记忆翻牌",
    to: "/memory-card",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <ToolPage toolId="memory-card" />,
  },
  {
    title: "数独游戏",
    to: "/sudoku",
    icon: <Gamepad2 className="h-4 w-4" />,
    page: <ToolPage toolId="sudoku" />,
  },
  {
    title: "用药提醒",
    to: "/medicine-reminder",
    icon: <PillIcon className="h-4 w-4" />,
    page: <ToolPage toolId="medicine-reminder" />,
  },
  {
    title: "打卡小工具",
    to: "/clock-in",
    icon: <TargetIcon className="h-4 w-4" />,
    page: <ToolPage toolId="clock-in" />,
  },
  {
    title: "文件分割工具",
    to: "/file-splitter",
    icon: <FileTextIcon className="h-4 w-4" />,
    page: <ToolPage toolId="file-splitter" />,
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
    title: "游戏娱乐",
    icon: <Gamepad2 className="h-4 w-4" />,
    items: [
      {
        title: "数字华容道",
        to: "/number-puzzle",
        icon: <Gamepad2 className="h-4 w-4" />,
      },
      {
        title: "记忆翻牌",
        to: "/memory-card",
        icon: <Gamepad2 className="h-4 w-4" />,
      },
      {
        title: "数独游戏",
        to: "/sudoku",
        icon: <Gamepad2 className="h-4 w-4" />,
      },
    ]
  },
  {
    title: "生活工具",
    icon: <HeartIcon className="h-4 w-4" />,
    items: [
      {
        title: "打卡小工具",
        to: "/clock-in",
        icon: <TargetIcon className="h-4 w-4" />,
      },
      {
        title: "倒数日/纪念日提醒",
        to: "/countdown-reminder",
        icon: <ClockIcon className="h-4 w-4" />,
      },
      {
        title: "随机午餐/晚餐",
        to: "/lunch-randomizer",
        icon: <HeartIcon className="h-4 w-4" />,
      },
      {
        title: "快递单号追踪",
        to: "/express-tracker",
        icon: <LinkIcon className="h-4 w-4" />,
      },
      {
        title: "单位换算器",
        to: "/unit-converter",
        icon: <CalculatorIcon className="h-4 w-4" />,
      },
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
      {
        title: "健康BMI计算器",
        to: "/bmi-calculator",
        icon: <HeartIcon className="h-4 w-4" />,
      },
      {
        title: "每日一句/毒鸡汤",
        to: "/daily-quote",
        icon: <Quote className="h-4 w-4" />,
      },
      {
        title: "二维码生成与识别",
        to: "/qr-code",
        icon: <QrCode className="h-4 w-4" />,
      },
      {
        title: "随机抽签/分组",
        to: "/random-group",
        icon: <Shuffle className="h-4 w-4" />,
      },
      {
        title: "记账/小账本",
        to: "/expense-tracker",
        icon: <Wallet className="h-4 w-4" />,
      },
      {
        title: "用药提醒",
        to: "/medicine-reminder",
        icon: <PillIcon className="h-4 w-4" />,
      },
    ]
  },
  {
    title: "效率工具",
    icon: <ZapIcon className="h-4 w-4" />,
    items: [
      {
        title: "批量随机生成",
        to: "/batch-generator",
        icon: <ZapIcon className="h-4 w-4" />,
      },
      {
        title: "密码生成器",
        to: "/password-generator",
        icon: <Key className="h-4 w-4" />,
      },
      {
        title: "番茄钟工具",
        to: "/pomodoro-timer",
        icon: <ClockIcon className="h-4 w-4" />,
      },
      {
        title: "颜色工具箱",
        to: "/color-toolkit",
        icon: <Palette className="h-4 w-4" />,
      },
      {
        title: "进制转换器",
        to: "/number-base-converter",
        icon: <Hash className="h-4 w-4" />,
      },
      {
        title: "图片压缩工具",
        to: "/image-compressor",
        icon: <ImageIcon className="h-4 w-4" />,
      },
      {
        title: "图片处理工具",
        to: "/picture-processor",
        icon: <FileImage className="h-4 w-4" />,
      },
      {
        title: "文件哈希计算器",
        to: "/file-hash-calculator",
        icon: <Shield className="h-4 w-4" />,
      },
      {
        title: "快捷键查询",
        to: "/shortcut-keys-reference",
        icon: <Command className="h-4 w-4" />,
      },
      {
        title: "网络工具集",
        to: "/network-utilities",
        icon: <Globe className="h-4 w-4" />,
      },
    ]
  },
  {
    title: "开发者工具",
    icon: <Code className="h-5 w-5" />,
    items: [
      {
        title: "JSON格式化",
        to: "/json",
        icon: <CodeIcon className="h-4 w-4" />,
      },
      {
        title: "无效图片URL检测",
        to: "/invalid-image-url-detector",
        icon: <ImageIcon className="h-4 w-4" />,
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
        title: "Excel/CSV转SQL",
        to: "/excel-to-sql",
        icon: <FileTextIcon className="h-4 w-4" />,
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
        title: "文件分割工具",
        to: "/file-splitter",
        icon: <FileTextIcon className="h-4 w-4" />,
      },
      {
        title: "文本Diff",
        to: "/text-diff",
        icon: <FileDiffIcon className="h-4 w-4" />,
      },
      {
        title: "通用文本处理",
        to: "/text-processor",
        icon: <FileTextIcon className="h-4 w-4" />,
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
];
