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
    Gamepad2
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
        id: "java-tostring",
        title: "toString转JSON",
        description: "将Java toString输出转换为JSON格式",
        icon: <BracesIcon className="h-5 w-5" />,
        color: "bg-emerald-500"
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
        id: "download-files",
        title: "批量下载文件",
        description: "输入多个URL，批量下载文件",
        icon: <DownloadIcon className="h-5 w-5" />,
        color: "bg-sky-500"
    },
    {
        id: "excel-to-sql",
        title: "Excel/CSV转SQL",
        description: "将Excel或CSV文件内容转换为SQL插入语句",
        icon: <FileCodeIcon className="h-5 w-5" />,
        color: "bg-lime-500"
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
    },
];

export const textTools = [
    {
        id: "text-diff",
        title: "文本Diff",
        description: "文本对比工具，支持JSON格式化",
        icon: <FileDiffIcon className="h-5 w-5" />,
        color: "bg-slate-500"
    },
    {
        id: "remove-duplicates",
        title: "文本去重排序",
        description: "去除文本行中的重复项",
        icon: <FilterIcon className="h-5 w-5" />,
        color: "bg-gray-500"
    },
    {
        id: "substract-lines",
        title: "文本相减",
        description: "从一个文本中减去另一个文本的内容",
        icon: <MinusIcon className="h-5 w-5" />,
        color: "bg-zinc-500"
    },
    {
        id: "plaintext",
        title: "纯文本提取",
        description: "从富文本中提取纯文本内容",
        icon: <FileTextIcon className="h-5 w-5" />,
        color: "bg-amber-500"
    },
];

export const lifeTools = [
    {
        id: "countdown-reminder",
        title: "倒数日/纪念日提醒",
        description: "输入重要日期，自动显示距离天数",
        icon: <ClockIcon className="h-5 w-5" />,
        color: "bg-blue-400"
    },
    {
        id: "lunch-randomizer",
        title: "随机午餐/晚餐",
        description: "帮你决定今天吃什么，支持自定义菜品",
        icon: <HeartIcon className="h-5 w-5" />,
        color: "bg-pink-400"
    },
    {
        id: "express-tracker",
        title: "快递单号追踪",
        description: "输入快递单号，自动识别快递公司并跳转查询",
        icon: <LinkIcon className="h-5 w-5" />,
        color: "bg-green-400"
    },
    {
        id: "unit-converter",
        title: "单位换算器",
        description: "支持长度、重量、温度等常用单位换算",
        icon: <CalculatorIcon className="h-5 w-5" />,
        color: "bg-yellow-400"
    },
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
    },
    {
        id: "bmi-calculator",
        title: "健康BMI计算器",
        description: "输入身高体重，自动计算BMI并给出健康建议",
        icon: <HeartIcon className="h-5 w-5" />,
        color: "bg-red-400"
    },
    {
        id: "daily-quote",
        title: "每日一句/毒鸡汤",
        description: "每天推送一句正能量语录或幽默毒鸡汤",
        icon: <Quote className="h-5 w-5" />,
        color: "bg-purple-400"
    },
    {
        id: "qr-code",
        title: "二维码生成与识别",
        description: "输入文本/网址生成二维码，支持上传图片识别",
        icon: <QrCode className="h-5 w-5" />,
        color: "bg-indigo-400"
    },
    {
        id: "random-group",
        title: "随机抽签/分组",
        description: "适合聚会、活动分组、抽奖等场景",
        icon: <Shuffle className="h-5 w-5" />,
        color: "bg-teal-400"
    },
    {
        id: "expense-tracker",
        title: "记账/小账本",
        description: "简单的日常收支记录，支持导出",
        icon: <Wallet className="h-5 w-5" />,
        color: "bg-emerald-400"
    }
];

export const gameTools = [
    {
        id: "number-puzzle",
        title: "数字华容道",
        description: "经典的滑块拼图游戏，将数字按顺序排列完成挑战",
        icon: <Gamepad2 className="h-5 w-5" />,
        color: "bg-indigo-500"
    }
];