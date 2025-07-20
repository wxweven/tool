import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileTextIcon, TrashIcon, Wand2Icon, PlayIcon, LoaderIcon, RotateCcwIcon } from 'lucide-react';

const InputPanel = ({ 
  inputText, 
  setInputText, 
  onClear, 
  onLoadExample, 
  onResetDefaults,
  onProcess, 
  disabled, 
  isProcessing, 
  operations, 
  sortConfig 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileTextIcon className="h-5 w-5" />
          输入文本
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="input-text">文本内容（每行一个项目）</Label>
            <Textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入要处理的文本，每行一个项目&#10;支持以下处理操作：&#10;• 去除重复行&#10;• 删除空行&#10;• 处理空白字符&#10;• 文本排序"
              rows={15}
              className="font-mono mt-1 text-sm"
            />
          </div>

          {/* 统计信息 */}
          {inputText && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="font-semibold text-blue-600">
                  {inputText.split('\n').length}
                </div>
                <div className="text-xs text-gray-500">总行数</div>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <div className="font-semibold text-green-600">
                  {inputText.split('\n').filter(line => line.trim() === '').length}
                </div>
                <div className="text-xs text-gray-500">空行数</div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={onLoadExample} size="sm">
                <Wand2Icon className="mr-2 h-4 w-4" />
                加载示例
              </Button>
              <Button variant="outline" onClick={onResetDefaults} size="sm">
                <RotateCcwIcon className="mr-2 h-4 w-4" />
                重置选项
              </Button>
              <Button variant="secondary" onClick={onClear} size="sm">
                <TrashIcon className="mr-2 h-4 w-4" />
                清空文本
              </Button>
            </div>
            <div>
              <Button 
                onClick={onProcess} 
                disabled={disabled || isProcessing}
                className="w-full"
                size="sm"
              >
                {isProcessing ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlayIcon className="mr-2 h-4 w-4" />
                )}
                {isProcessing ? '处理中...' : '开始处理'}
              </Button>
            </div>

            {/* 当前选中的操作提示 */}
            {!isProcessing && operations && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-md text-xs">
                <p className="font-medium text-green-700 dark:text-green-300 mb-1">🚀 当前配置：</p>
                <p className="text-green-600 dark:text-green-400">
                  {[
                    operations.removeEmptyLines && '删除空行',
                    operations.trimWhitespace && '去除空白字符',
                    operations.trimLeft && '去除行首空白',
                    operations.trimRight && '去除行尾空白',
                    operations.compressSpaces && '压缩空格',
                    operations.deduplicate && '去重',
                    operations.sort && `排序(${sortConfig?.type === 'alphabetical' ? '字母序' : sortConfig?.type === 'numerical' ? '数字序' : '长度序'}-${sortConfig?.direction === 'asc' ? '升序' : '降序'})`
                  ].filter(Boolean).join('、') || '无操作选中'}
                </p>
              </div>
            )}
          </div>

          {/* 使用提示 */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">使用提示：</p>
            <ul className="text-xs space-y-1">
              <li>• 每行一个项目，支持中英文混合</li>
              <li>• 可以包含空行和空白字符</li>
              <li>• 处理顺序：删除空行 → 处理空白字符 → 去重 → 排序</li>
              <li>• 💾 您的处理选项会自动保存到本地</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InputPanel; 