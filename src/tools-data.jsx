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
    ZapIcon
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
} from "./tools";

export const efficiencyTools = [
    {
        id: "batch-generator",
        title: "批量生成",
        description: "批量生成随机姓名、数字等多种数据",
        icon: <ZapIcon className="h-5 w-5" />,
        color: "bg-yellow-500"
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