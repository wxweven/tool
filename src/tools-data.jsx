import {
    ClockIcon,
    CodeIcon,
    LinkIcon,
    FileTextIcon,
    TerminalIcon,
    CpuIcon,
    GiftIcon,
    CalculatorIcon,
    FileCodeIcon,
    BracesIcon,
    FileDiffIcon,
    FilterIcon,
    DownloadIcon,
    MinusIcon,
    ZapIcon,
    HeartIcon,
    QrCode,
    Shuffle,
    Wallet,
    Quote,
    Key as KeyIcon,
    Palette as PaletteIcon,
    Hash,
    ImageIcon,
    FileImage,
    Shield,
    Command,
    Globe,
    Gamepad2,
    PillIcon,
    PackageIcon
} from "lucide-react";

// 工具文件类
import {
    JavaToStringFormatter,
    JsonFormatter,
    CodeFormatter,
    PlainTextExtractor,
    TextDiff,
    RegexTester,
    UrlEncoder,
    BatchGenerator,
    RemoveDuplicates,
    SubstractLines,
    ShellCommands,
    JavaToJson,
    ExcelToSql,
    CountdownReminder,
    ExpressTracker,
    LunchRandomizer,
    UnitConverter,
    TimestampConverter,
    LotteryTool,
    MortgageCalculator,
    DownloadFiles,
    ExcelToTable,
    FileSplitter
} from "./tools";

// 新增生活类工具
import BMICalculator from "./tools/BMICalculator";
import DailyQuote from "./tools/DailyQuote";
import QRCodeTool from "./tools/QRCodeTool";
import RandomGroupTool from "./tools/RandomGroupTool";
import ExpenseTracker from "./tools/ExpenseTracker";

// 新增效率工具
import FileHashCalculator from "./tools/FileHashCalculator";
import ShortcutKeysReference from "./tools/ShortcutKeysReference";
import NetworkUtilities from "./tools/NetworkUtilities";
import MedicineReminder from "./tools/MedicineReminder";

export const efficiencyTools = [
    {
        id: "batch-generator",
        title: "批量随机生成",
        description: "批量生成随机姓名、数字等多种数据",
        icon: <ZapIcon className="h-5 w-5" />,
        color: "bg-yellow-500"
    },
    {
        id: "password-generator",
        title: "密码生成器",
        description: "生成安全可靠的密码，支持多种复杂度设置",
        icon: <KeyIcon className="h-5 w-5" />,
        color: "bg-red-500"
    },
    {
        id: "pomodoro-timer",
        title: "番茄钟工具",
        description: "基于番茄工作法的时间管理工具，提高专注力和工作效率",
        icon: <ClockIcon className="h-5 w-5" />,
        color: "bg-orange-500"
    },
    {
        id: "color-toolkit",
        title: "颜色工具箱",
        description: "全方位的颜色处理工具，支持格式转换、调色板生成、对比度检测",
        icon: <PaletteIcon className="h-5 w-5" />,
        color: "bg-purple-500"
    },
    {
        id: "number-base-converter",
        title: "进制转换器",
        description: "支持多种进制之间的数值转换，程序员必备工具",
        icon: <Hash className="h-5 w-5" />,
        color: "bg-blue-500"
    },
    {
        id: "image-compressor",
        title: "图片压缩工具",
        description: "在线压缩图片，支持多种格式和批量处理，有效减小文件大小",
        icon: <ImageIcon className="h-5 w-5" />,
        color: "bg-green-500"
    },
    {
        id: "picture-processor",
        title: "图片处理工具",
        description: "PDF转图片、图片格式转换，支持批量处理和多种输出设置",
        icon: <FileImage className="h-5 w-5" />,
        color: "bg-indigo-500"
    },
    {
        id: "file-hash-calculator",
        title: "文件哈希计算器",
        description: "计算文件和文本的哈希值，支持MD5、SHA-1、SHA-256、SHA-512算法",
        icon: <Shield className="h-5 w-5" />,
        color: "bg-cyan-500"
    },
    {
        id: "shortcut-keys-reference",
        title: "快捷键查询",
        description: "常用软件和系统的快捷键查询工具，支持搜索和收藏",
        icon: <Command className="h-5 w-5" />,
        color: "bg-slate-500"
    },
    {
        id: "network-utilities",
        title: "网络工具集",
        description: "IP查询、DNS解析、User-Agent生成、子网计算等网络工具",
        icon: <Globe className="h-5 w-5" />,
        color: "bg-emerald-500"
    }
];

export const devTools = [
    {
        id: "json-formatter",
        title: "JSON格式化",
        description: "在线解析和格式化JSON数据，支持校验和压缩",
        icon: <BracesIcon className="h-5 w-5" />,
        color: "bg-yellow-500"
    },
    {
        id: "code-formatter",
        title: "代码格式化",
        description: "支持多种编程语言的代码美化和格式化工具",
        icon: <CodeIcon className="h-5 w-5" />,
        color: "bg-blue-500"
    },
    {
        id: "java-json",
        title: "Java转JSON",
        description: "将Java实体类代码转换为对应的JSON格式数据",
        icon: <FileCodeIcon className="h-5 w-5" />,
        color: "bg-indigo-500"
    },
    {
        id: "java-tostring",
        title: "Java toString美化",
        description: "格式化Java toString方法的输出结果，提高代码可读性",
        icon: <FileCodeIcon className="h-5 w-5" />,
        color: "bg-purple-500"
    },
    {
        id: "shell",
        title: "Shell命令生成",
        description: "根据操作生成对应的Shell命令，提高命令行操作效率",
        icon: <TerminalIcon className="h-5 w-5" />,
        color: "bg-green-500"
    },
    {
        id: "excel-to-sql",
        title: "Excel转SQL",
        description: "将Excel表格数据转换为SQL插入语句，方便数据导入",
        icon: <FileCodeIcon className="h-5 w-5" />,
        color: "bg-cyan-500"
    },
    {
        id: "excel-to-table",
        title: "Excel转HTML表格",
        description: "将Excel表格数据转换为HTML表格，支持样式设置",
        icon: <FileCodeIcon className="h-5 w-5" />,
        color: "bg-orange-500"
    }
];

export const textTools = [
    {
        id: "regex",
        title: "正则表达式测试",
        description: "在线测试正则表达式的匹配结果",
        icon: <FilterIcon className="h-5 w-5" />,
        color: "bg-purple-500"
    },
    {
        id: "text-diff",
        title: "文本对比工具",
        description: "在线对比文本差异，高亮显示不同之处",
        icon: <FileDiffIcon className="h-5 w-5" />,
        color: "bg-blue-500"
    },
    {
        id: "remove-duplicates",
        title: "去除重复行",
        description: "去除文本中的重复行，支持多种去重模式",
        icon: <MinusIcon className="h-5 w-5" />,
        color: "bg-red-500"
    },
    {
        id: "substract-lines",
        title: "文本行相减",
        description: "从一个文本中减去另一个文本的行，得到差集",
        icon: <MinusIcon className="h-5 w-5" />,
        color: "bg-amber-500"
    },
    {
        id: "url",
        title: "URL编解码",
        description: "对URL进行编码或解码处理",
        icon: <LinkIcon className="h-5 w-5" />,
        color: "bg-indigo-500"
    },
    {
        id: "plaintext",
        title: "纯文本提取",
        description: "从HTML或其他格式中提取纯文本内容",
        icon: <FileTextIcon className="h-5 w-5" />,
        color: "bg-slate-500"
    },
    {
        id: "timestamp",
        title: "时间戳转换",
        description: "在时间戳和标准时间之间进行相互转换",
        icon: <ClockIcon className="h-5 w-5" />,
        color: "bg-cyan-500"
    },
    {
        id: "unit-converter",
        title: "单位转换器",
        description: "支持多种单位之间的转换，包括长度、重量、温度等",
        icon: <CpuIcon className="h-5 w-5" />,
        color: "bg-emerald-500"
    },
    {
        id: "file-splitter",
        title: "文件分割工具",
        description: "将大文本文件按指定行数拆分成多个小文件",
        icon: <FileTextIcon className="h-5 w-5" />,
        color: "bg-blue-500"
    }
];

export const lifeTools = [
    {
        id: "bmi-calculator",
        title: "BMI计算器",
        description: "计算身体质量指数(BMI)，评估体重是否健康",
        icon: <CalculatorIcon className="h-5 w-5" />,
        color: "bg-green-500"
    },
    {
        id: "daily-quote",
        title: "每日一句",
        description: "获取每日励志名言，激励自己不断前行",
        icon: <Quote className="h-5 w-5" />,
        color: "bg-purple-500"
    },
    {
        id: "qr-code",
        title: "二维码工具",
        description: "生成和解析二维码，支持多种格式",
        icon: <QrCode className="h-5 w-5" />,
        color: "bg-orange-500"
    },
    {
        id: "lottery",
        title: "彩票选号器",
        description: "随机生成各种彩票号码，提供选号参考",
        icon: <GiftIcon className="h-5 w-5" />,
        color: "bg-pink-500"
    },
    {
        id: "random-group",
        title: "随机分组工具",
        description: "将人员或项目随机分组，适用于活动组织",
        icon: <Shuffle className="h-5 w-5" />,
        color: "bg-cyan-500"
    },
    {
        id: "lunch-randomizer",
        title: "午餐选择器",
        description: "帮你解决选择困难症，随机推荐午餐选择",
        icon: <GiftIcon className="h-5 w-5" />,
        color: "bg-amber-500"
    },
    {
        id: "mortgage",
        title: "房贷计算器",
        description: "计算房贷月供、利息等详细信息",
        icon: <Wallet className="h-5 w-5" />,
        color: "bg-blue-500"
    },
    {
        id: "expense-tracker",
        title: "支出追踪器",
        description: "记录和分析日常支出，帮助管理个人财务",
        icon: <Wallet className="h-5 w-5" />,
        color: "bg-green-500"
    },
    {
        id: "medicine-reminder",
        title: "吃药提醒",
        description: "设置吃药提醒，帮助按时服药",
        icon: <PillIcon className="h-5 w-5" />,
        color: "bg-red-500"
    }
];

export const workTools = [
    {
        id: "express-tracker",
        title: "快递查询",
        description: "通过快递单号查询物流信息",
        icon: <PackageIcon className="h-5 w-5" />,
        color: "bg-green-500"
    },
    {
        id: "countdown-reminder",
        title: "倒计时提醒",
        description: "设置重要事件倒计时，及时提醒",
        icon: <ClockIcon className="h-5 w-5" />,
        color: "bg-orange-500"
    },
    {
        id: "download-files",
        title: "批量下载文件",
        description: "根据链接列表批量下载文件",
        icon: <DownloadIcon className="h-5 w-5" />,
        color: "bg-blue-500"
    }
];

export const gameTools = [
    {
        id: "memory-card",
        title: "记忆卡片",
        description: "经典的记忆卡片游戏，锻炼记忆力",
        icon: <Gamepad2 className="h-5 w-5" />,
        color: "bg-purple-500"
    },
    {
        id: "number-puzzle",
        title: "数字拼图",
        description: "经典的数字拼图游戏，考验逻辑思维",
        icon: <Gamepad2 className="h-5 w-5" />,
        color: "bg-blue-500"
    },
    {
        id: "sudoku",
        title: "数独游戏",
        description: "经典的数独游戏，锻炼思维能力",
        icon: <Gamepad2 className="h-5 w-5" />,
        color: "bg-green-500"
    }
];

export const allTools = [
    ...efficiencyTools,
    ...devTools,
    ...textTools,
    ...lifeTools,
    ...workTools,
    ...gameTools
];