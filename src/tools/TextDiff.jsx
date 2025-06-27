import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as Diff from 'diff';
import { toast } from 'sonner';

const TextDiff = () => {
    // 默认测试示例
    const defaultExampleA = `{
  "name": "张三",
  "age": 25,
  "city": "北京",
  "hobbies": ["读书", "游泳"]
}`;

    const defaultExampleB = `{
  "name": "李四",
  "age": 30,
  "city": "上海",
  "hobbies": ["读书", "跑步", "摄影"],
  "email": "lisi@example.com"
}`;

    const [inputA, setInputA] = useState(defaultExampleA);
    const [inputB, setInputB] = useState(defaultExampleB);
    const [diffResult, setDiffResult] = useState(null);

    const handleDiff = () => {
        const diff = Diff.diffLines(inputA, inputB, { newlineIsToken: false });
        setDiffResult(diff);
    };

    const handleFormatJson = (side) => {
        const input = side === 'A' ? inputA : inputB;
        const setInput = side === 'A' ? setInputA : setInputB;
        if (!input.trim()) {
            toast.info(`文本 ${side} 为空，无需格式化`);
            return;
        }
        try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            setInput(formatted);
            toast.success(`文本 ${side} JSON 格式化成功`);
        } catch (error) {
            toast.error(`文本 ${side} 不是有效的 JSON`, {
                description: "请检查文本内容是否为标准 JSON 格式。",
            });
        }
    };

    const handleLoadExample = (type) => {
        if (type === 'json') {
            setInputA(defaultExampleA);
            setInputB(defaultExampleB);
        } else if (type === 'text') {
            setInputA(`Hello World!
This is a simple text example.
We can compare different versions of text.
Line 4: Original content.`);
            setInputB(`Hello World!
This is a simple text example.
We can compare different versions of text.
Line 4: Updated content.
Line 5: New line added.`);
        } else if (type === 'code') {
            setInputA(`function calculateSum(a, b) {
    return a + b;
}

function multiply(x, y) {
    return x * y;
}`);
            setInputB(`function calculateSum(a, b) {
    return a + b;
}

function multiply(x, y) {
    return x * y;
}

function divide(x, y) {
    if (y === 0) {
        throw new Error('Division by zero');
    }
    return x / y;
}`);
        }
        setDiffResult(null);
        toast.success(`已加载 ${type} 示例`);
    };

    const handleClear = () => {
        setInputA('');
        setInputB('');
        setDiffResult(null);
        toast.success('已清空所有内容');
    };

    const renderDiff = () => {
        if (!diffResult) return null;

        // 将 diff 结果转换为行级别的对比
        const linesA = [];
        const linesB = [];
        let lineNumber = 1;

        for (let i = 0; i < diffResult.length; i++) {
            const part = diffResult[i];
            const lines = part.value.split('\n');

            // 处理每一行
            for (let j = 0; j < lines.length; j++) {
                const line = lines[j];
                const isLastLine = j === lines.length - 1;

                // 跳过最后一个空行（如果整个 part 以换行符结尾）
                if (isLastLine && line === '' && part.value.endsWith('\n')) {
                    continue;
                }

                if (part.removed) {
                    linesA.push({
                        number: lineNumber++,
                        content: line,
                        type: 'removed',
                        highlight: true
                    });
                } else if (part.added) {
                    linesB.push({
                        number: lineNumber++,
                        content: line,
                        type: 'added',
                        highlight: true
                    });
                } else {
                    // 相同的行，两边都显示
                    linesA.push({
                        number: lineNumber,
                        content: line,
                        type: 'unchanged',
                        highlight: false
                    });
                    linesB.push({
                        number: lineNumber,
                        content: line,
                        type: 'unchanged',
                        highlight: false
                    });
                    lineNumber++;
                }
            }
        }

        // 确保两边的行数一致，用空行填充
        const maxLines = Math.max(linesA.length, linesB.length);
        while (linesA.length < maxLines) {
            linesA.push({
                number: null,
                content: '',
                type: 'empty',
                highlight: false
            });
        }
        while (linesB.length < maxLines) {
            linesB.push({
                number: null,
                content: '',
                type: 'empty',
                highlight: false
            });
        }

        return (
            <div className="grid grid-cols-2 gap-0 border rounded-lg overflow-hidden">
                {/* 左侧 - 原始文本 */}
                <div className="bg-white">
                    <div className="bg-gray-100 px-4 py-2 border-b font-medium text-sm text-gray-700">
                        原始文本 (A)
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {linesA.map((line, index) => (
                            <div
                                key={`a-${index}`}
                                className={`px-4 py-1 border-b border-gray-100 font-mono text-sm ${line.highlight ? 'bg-red-50' : ''
                                    } ${line.type === 'removed' ? 'bg-red-100' : ''}`}
                            >
                                <div className="flex">
                                    <span className="text-gray-400 text-xs w-8 select-none">
                                        {line.number || ''}
                                    </span>
                                    <span className={`flex-1 ${line.type === 'removed' ? 'text-red-700' : 'text-gray-900'
                                        }`}>
                                        {line.content || '\u00A0'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 右侧 - 修改后文本 */}
                <div className="bg-white">
                    <div className="bg-gray-100 px-4 py-2 border-b font-medium text-sm text-gray-700">
                        修改后文本 (B)
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {linesB.map((line, index) => (
                            <div
                                key={`b-${index}`}
                                className={`px-4 py-1 border-b border-gray-100 font-mono text-sm ${line.highlight ? 'bg-green-50' : ''
                                    } ${line.type === 'added' ? 'bg-green-100' : ''}`}
                            >
                                <div className="flex">
                                    <span className="text-gray-400 text-xs w-8 select-none">
                                        {line.number || ''}
                                    </span>
                                    <span className={`flex-1 ${line.type === 'added' ? 'text-green-700' : 'text-gray-900'
                                        }`}>
                                        {line.content || '\u00A0'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* 示例按钮组 */}
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 mr-2">快速示例：</span>
                <Button onClick={() => handleLoadExample('json')} variant="outline" size="sm">
                    JSON 示例
                </Button>
                <Button onClick={() => handleLoadExample('text')} variant="outline" size="sm">
                    文本示例
                </Button>
                <Button onClick={() => handleLoadExample('code')} variant="outline" size="sm">
                    代码示例
                </Button>
                <Button onClick={handleClear} variant="outline" size="sm" className="ml-auto">
                    清空
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <Textarea
                        value={inputA}
                        onChange={(e) => setInputA(e.target.value)}
                        placeholder="请输入文本 A"
                        className="h-64 font-mono"
                    />
                    <Button onClick={() => handleFormatJson('A')} variant="outline">
                        JSON 格式化 A
                    </Button>
                </div>
                <div className="flex flex-col gap-2">
                    <Textarea
                        value={inputB}
                        onChange={(e) => setInputB(e.target.value)}
                        placeholder="请输入文本 B"
                        className="h-64 font-mono"
                    />
                    <Button onClick={() => handleFormatJson('B')} variant="outline">
                        JSON 格式化 B
                    </Button>
                </div>
            </div>
            <Button onClick={handleDiff}>生成 Diff</Button>
            {diffResult && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">差异对比结果</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-100 border border-red-300"></div>
                                <span>删除的行</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-100 border border-green-300"></div>
                                <span>新增的行</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-gray-50 border border-gray-200"></div>
                                <span>未改变的行</span>
                            </div>
                        </div>
                    </div>
                    {renderDiff()}
                </div>
            )}
        </div>
    );
};

export default TextDiff;