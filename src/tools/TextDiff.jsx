import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import * as Diff from 'diff';
import { toast } from 'sonner';

const TextDiff = () => {
    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
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

    const renderDiff = () => {
        if (!diffResult) return null;

        const renderedParts = [];
        for (let i = 0; i < diffResult.length; i++) {
            const part = diffResult[i];
            const nextPart = diffResult[i + 1];

            if (part.removed && nextPart && nextPart.added) {
                const wordDiff = Diff.diffWords(part.value, nextPart.value);

                const removedLine = wordDiff.filter(word => !word.added).map((word, index) => (
                    <span key={index} style={{ backgroundColor: word.removed ? '#ffe9e9' : 'transparent' }}>
                        {word.value}
                    </span>
                ));

                const addedLine = wordDiff.filter(word => !word.removed).map((word, index) => (
                    <span key={index} style={{ backgroundColor: word.added ? '#e6ffec' : 'transparent' }}>
                        {word.value}
                    </span>
                ));

                renderedParts.push(
                    <div key={i + '-removed'} className="bg-[#fce8e8]">
                        <span className="text-gray-500 select-none">- </span>
                        <span>{removedLine}</span>
                    </div>
                );
                renderedParts.push(
                    <div key={i + '-added'} className="bg-[#ddfbe6]">
                        <span className="text-gray-500 select-none">+ </span>
                        <span>{addedLine}</span>
                    </div>
                );

                i++; // Skip the next part as it's already processed
            } else if (part.removed) {
                 part.value.split('\\n').filter(line => line).forEach((line, index) => {
                    renderedParts.push(
                        <div key={`${i}-${index}-removed`} className="bg-[#fce8e8]">
                            <span className="text-gray-500 select-none">- </span>
                            <span>{line}</span>
                        </div>
                    );
                });
            } else if (part.added) {
                part.value.split('\\n').filter(line => line).forEach((line, index) => {
                    renderedParts.push(
                        <div key={`${i}-${index}-added`} className="bg-[#ddfbe6]">
                            <span className="text-gray-500 select-none">+ </span>
                            <span>{line}</span>
                        </div>
                    );
                });
            } else {
                 part.value.split('\\n').filter((line, idx, arr) => idx < arr.length -1 || line).forEach((line, index) => {
                    renderedParts.push(
                        <div key={`${i}-${index}`}>
                            <span className="text-gray-500 select-none">  </span>
                            <span>{line}</span>
                        </div>
                    );
                 });
            }
        }
        return renderedParts;
      };

    return (
        <div className="space-y-4">
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
                 <div className="p-4 border rounded-md bg-gray-50 min-h-[10rem] font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
                        {renderDiff()}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default TextDiff;