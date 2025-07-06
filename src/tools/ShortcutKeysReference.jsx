import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Star, 
  StarOff, 
  Monitor, 
  Globe, 
  Code, 
  Command,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

const ShortcutKeysReference = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('windows');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shortcut-favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [copiedStates, setCopiedStates] = useState({});

  // 快捷键数据
  const shortcutData = {
    windows: {
      name: 'Windows 系统',
      icon: <Monitor className="h-4 w-4" />,
      shortcuts: [
        { keys: ['Win'], description: '打开开始菜单', category: '系统' },
        { keys: ['Win', 'D'], description: '显示桌面', category: '系统' },
        { keys: ['Win', 'L'], description: '锁定计算机', category: '系统' },
        { keys: ['Win', 'R'], description: '打开运行对话框', category: '系统' },
        { keys: ['Win', 'E'], description: '打开文件资源管理器', category: '文件' },
        { keys: ['Win', 'I'], description: '打开设置', category: '系统' },
        { keys: ['Alt', 'Tab'], description: '在打开的应用间切换', category: '窗口' },
        { keys: ['Alt', 'F4'], description: '关闭活动窗口', category: '窗口' },
        { keys: ['Ctrl', 'Shift', 'Esc'], description: '打开任务管理器', category: '系统' },
        { keys: ['Win', 'Tab'], description: '打开任务视图', category: '窗口' },
        { keys: ['Ctrl', 'C'], description: '复制', category: '编辑' },
        { keys: ['Ctrl', 'V'], description: '粘贴', category: '编辑' },
        { keys: ['Ctrl', 'X'], description: '剪切', category: '编辑' },
        { keys: ['Ctrl', 'Z'], description: '撤销', category: '编辑' },
        { keys: ['Ctrl', 'A'], description: '全选', category: '编辑' },
        { keys: ['F2'], description: '重命名选中项', category: '文件' },
        { keys: ['Delete'], description: '删除选中项', category: '文件' },
        { keys: ['F5'], description: '刷新', category: '系统' },
        { keys: ['F11'], description: '全屏模式', category: '窗口' },
        { keys: ['Print Screen'], description: '截屏', category: '系统' }
      ]
    },
    chrome: {
      name: 'Chrome 浏览器',
      icon: <Globe className="h-4 w-4" />,
      shortcuts: [
        { keys: ['Ctrl', 'T'], description: '新建标签页', category: '标签' },
        { keys: ['Ctrl', 'Shift', 'T'], description: '重新打开关闭的标签页', category: '标签' },
        { keys: ['Ctrl', 'W'], description: '关闭当前标签页', category: '标签' },
        { keys: ['Ctrl', 'Tab'], description: '切换到下一个标签页', category: '标签' },
        { keys: ['Ctrl', 'N'], description: '新建窗口', category: '窗口' },
        { keys: ['Ctrl', 'Shift', 'N'], description: '新建无痕窗口', category: '窗口' },
        { keys: ['Ctrl', 'R'], description: '刷新页面', category: '导航' },
        { keys: ['Ctrl', 'L'], description: '跳转到地址栏', category: '导航' },
        { keys: ['Ctrl', 'D'], description: '添加书签', category: '书签' },
        { keys: ['Ctrl', 'H'], description: '打开历史记录', category: '历史' },
        { keys: ['Ctrl', 'F'], description: '在页面中查找', category: '搜索' },
        { keys: ['F12'], description: '打开开发者工具', category: '开发' },
        { keys: ['Ctrl', '+'], description: '放大', category: '缩放' },
        { keys: ['Ctrl', '-'], description: '缩小', category: '缩放' },
        { keys: ['F11'], description: '全屏模式', category: '窗口' }
      ]
    },
    vscode: {
      name: 'VS Code',
      icon: <Code className="h-4 w-4" />,
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'P'], description: '打开命令面板', category: '命令' },
        { keys: ['Ctrl', 'P'], description: '快速打开文件', category: '文件' },
        { keys: ['Ctrl', 'N'], description: '新建文件', category: '文件' },
        { keys: ['Ctrl', 'S'], description: '保存文件', category: '文件' },
        { keys: ['Ctrl', 'W'], description: '关闭文件', category: '文件' },
        { keys: ['Ctrl', '`'], description: '打开终端', category: '终端' },
        { keys: ['Ctrl', 'F'], description: '查找', category: '搜索' },
        { keys: ['Ctrl', 'H'], description: '替换', category: '搜索' },
        { keys: ['Ctrl', 'G'], description: '跳转到行', category: '导航' },
        { keys: ['F12'], description: '转到定义', category: '导航' },
        { keys: ['F2'], description: '重命名符号', category: '重构' },
        { keys: ['Ctrl', '/'], description: '切换行注释', category: '编辑' },
        { keys: ['Alt', '↑'], description: '向上移动行', category: '编辑' },
        { keys: ['Alt', '↓'], description: '向下移动行', category: '编辑' },
        { keys: ['F5'], description: '开始调试', category: '调试' }
      ]
    }
  };

  // 过滤快捷键
  const filteredShortcuts = useMemo(() => {
    const shortcuts = shortcutData[selectedCategory]?.shortcuts || [];
    if (!searchTerm) return shortcuts;
    
    return shortcuts.filter(shortcut => 
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase())) ||
      shortcut.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedCategory, searchTerm]);

  // 按分类分组
  const groupedShortcuts = useMemo(() => {
    const grouped = {};
    filteredShortcuts.forEach(shortcut => {
      if (!grouped[shortcut.category]) {
        grouped[shortcut.category] = [];
      }
      grouped[shortcut.category].push(shortcut);
    });
    return grouped;
  }, [filteredShortcuts]);

  // 收藏功能
  const toggleFavorite = (shortcut) => {
    const key = `${selectedCategory}-${shortcut.keys.join('+')}-${shortcut.description}`;
    const newFavorites = favorites.includes(key)
      ? favorites.filter(f => f !== key)
      : [...favorites, key];
    
    setFavorites(newFavorites);
    localStorage.setItem('shortcut-favorites', JSON.stringify(newFavorites));
    
    toast.success(favorites.includes(key) ? '已取消收藏' : '已添加到收藏');
  };

  const isFavorite = (shortcut) => {
    const key = `${selectedCategory}-${shortcut.keys.join('+')}-${shortcut.description}`;
    return favorites.includes(key);
  };

  // 复制快捷键
  const copyShortcut = async (shortcut) => {
    const text = `${shortcut.keys.join(' + ')}: ${shortcut.description}`;
    try {
      await navigator.clipboard.writeText(text);
      const key = shortcut.keys.join('+');
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
      toast.success('快捷键已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  // 渲染快捷键项
  const renderShortcutItem = (shortcut) => {
    const key = shortcut.keys.join('+');
    return (
      <div key={key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {shortcut.keys.map((k, idx) => (
              <React.Fragment key={idx}>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                  {k}
                </kbd>
                {idx < shortcut.keys.length - 1 && <span className="text-gray-400">+</span>}
              </React.Fragment>
            ))}
            <Badge variant="outline" className="text-xs">
              {shortcut.category}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{shortcut.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyShortcut(shortcut)}
          >
            {copiedStates[key] ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggleFavorite(shortcut)}
          >
            {isFavorite(shortcut) ? (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">快捷键查询</h1>
        <p className="text-gray-600">常用软件和系统的快捷键查询工具</p>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索快捷键、功能或分类..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 软件分类标签 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(shortcutData).map(([key, data]) => (
            <TabsTrigger key={key} value={key} className="flex items-center gap-2">
              {data.icon}
              <span>{data.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(shortcutData).map(([key, data]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {data.icon}
                  {data.name} 快捷键
                </CardTitle>
                <CardDescription>
                  共 {filteredShortcuts.length} 个快捷键
                  {searchTerm && ` (搜索: "${searchTerm}")`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredShortcuts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? '没有找到匹配的快捷键' : '暂无快捷键数据'}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                      <div key={category}>
                        <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center gap-2">
                          <Command className="h-4 w-4" />
                          {category}
                          <Badge variant="secondary" className="text-xs">
                            {shortcuts.length}
                          </Badge>
                        </h3>
                        <div className="grid gap-2">
                          {shortcuts.map(renderShortcutItem)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ShortcutKeysReference;
