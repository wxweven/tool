import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  SettingsIcon, 
  PlayIcon, 
  CopyIcon, 
  ArrowUpDownIcon,
  TrashIcon,
  SpaceIcon,
  FilterIcon,
  LoaderIcon
} from 'lucide-react';

const OperationPanel = ({ 
  operations, 
  setOperations, 
  sortConfig, 
  setSortConfig
}) => {
  const handleOperationChange = (operation, checked) => {
    setOperations(prev => ({
      ...prev,
      [operation]: checked
    }));
  };

  const handleSortConfigChange = (key, value) => {
    setSortConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          处理操作
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 智能推荐提示 */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm">
            <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">💡 智能推荐：</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              已为您默认选中最常用的操作，您的选择会自动保存
            </p>
          </div>

          <Separator />

          {/* 空行处理 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrashIcon className="h-4 w-4 text-red-500" />
              <Label className="text-sm font-medium">空行处理</Label>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="removeEmptyLines"
                  checked={operations.removeEmptyLines}
                  onCheckedChange={(checked) => handleOperationChange('removeEmptyLines', checked)}
                />
                <Label htmlFor="removeEmptyLines" className="text-sm">
                  删除空行
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* 空白字符处理 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SpaceIcon className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-medium">空白字符处理</Label>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trimWhitespace"
                  checked={operations.trimWhitespace}
                  onCheckedChange={(checked) => handleOperationChange('trimWhitespace', checked)}
                />
                <Label htmlFor="trimWhitespace" className="text-sm">
                  去除行首行尾空白
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trimLeft"
                  checked={operations.trimLeft}
                  onCheckedChange={(checked) => handleOperationChange('trimLeft', checked)}
                />
                <Label htmlFor="trimLeft" className="text-sm">
                  仅去除行首空白
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trimRight"
                  checked={operations.trimRight}
                  onCheckedChange={(checked) => handleOperationChange('trimRight', checked)}
                />
                <Label htmlFor="trimRight" className="text-sm">
                  仅去除行尾空白
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compressSpaces"
                  checked={operations.compressSpaces}
                  onCheckedChange={(checked) => handleOperationChange('compressSpaces', checked)}
                />
                <Label htmlFor="compressSpaces" className="text-sm">
                  压缩多个空格为一个
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* 去重功能 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CopyIcon className="h-4 w-4 text-green-500" />
              <Label className="text-sm font-medium">去重功能</Label>
            </div>
            <div className="space-y-2 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="deduplicate"
                  checked={operations.deduplicate}
                  onCheckedChange={(checked) => handleOperationChange('deduplicate', checked)}
                />
                <Label htmlFor="deduplicate" className="text-sm">
                  删除重复行（保持原有顺序）
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* 排序功能 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowUpDownIcon className="h-4 w-4 text-purple-500" />
              <Label className="text-sm font-medium">排序功能</Label>
            </div>
            <div className="space-y-3 ml-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sort"
                  checked={operations.sort}
                  onCheckedChange={(checked) => handleOperationChange('sort', checked)}
                />
                <Label htmlFor="sort" className="text-sm">
                  启用排序
                </Label>
              </div>
              
              {operations.sort && (
                <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">排序类型</Label>
                    <Select
                      value={sortConfig.type}
                      onValueChange={(value) => handleSortConfigChange('type', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alphabetical">字母序</SelectItem>
                        <SelectItem value="numerical">数字序</SelectItem>
                        <SelectItem value="length">长度序</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">排序方向</Label>
                    <Select
                      value={sortConfig.direction}
                      onValueChange={(value) => handleSortConfigChange('direction', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">升序</SelectItem>
                        <SelectItem value="desc">降序</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 处理顺序说明 */}
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">处理顺序：</p>
            <ol className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
              <li>1. 删除空行</li>
              <li>2. 处理空白字符</li>
              <li>3. 去除重复行</li>
              <li>4. 文本排序</li>
            </ol>
          </div>

          {/* 本地存储提示 */}
          <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md text-xs text-gray-500 text-center">
            <p>💾 您的选择已自动保存到本地，下次访问时会恢复</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OperationPanel; 