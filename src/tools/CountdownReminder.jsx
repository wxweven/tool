import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronUpIcon, InfoIcon, MessageCircleIcon } from 'lucide-react';

/**
 * 倒数日/纪念日提醒工具
 * 功能：
 * - 输入重要日期（如生日、纪念日、考试等）
 * - 自动显示距离天数
 * - 支持添加、删除、编辑事件
 * - 支持按天数排序
 * - 支持测试示例、清空、scroll to top、反馈、关于
 */
const defaultEvents = [
  { name: '生日', date: '2024-12-01' },
  { name: '纪念日', date: '2024-10-01' },
  { name: '考试', date: '2024-09-10' }
];

const CountdownReminder = () => {
  const [events, setEvents] = useState(defaultEvents);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const daysLeft = (d) => {
    const now = new Date();
    const target = new Date(d);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const sortedEvents = [...events].sort((a, b) => daysLeft(a.date) - daysLeft(b.date));

  const handleAdd = () => {
    if (!name || !date) return;
    setEvents([...events, { name, date }]);
    setName('');
    setDate('');
  };
  const handleEdit = (idx) => {
    setEditIndex(idx);
    setName(events[idx].name);
    setDate(events[idx].date);
  };
  const handleSaveEdit = () => {
    if (editIndex === null) return;
    const newEvents = [...events];
    newEvents[editIndex] = { name, date };
    setEvents(newEvents);
    setEditIndex(null);
    setName('');
    setDate('');
  };
  const handleDelete = (idx) => {
    setEvents(events.filter((_, i) => i !== idx));
  };
  const handleClear = () => {
    setEvents([]);
    setName('');
    setDate('');
  };
  const handleExample = () => {
    setEvents(defaultEvents);
    setName('');
    setDate('');
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24">
      <h2 className="text-xl font-bold">倒数日/纪念日提醒</h2>
      <div className="flex gap-2">
        <Input
          placeholder="事件名称，如生日"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1"
        />
        <Input
          type="date"
          placeholder="日期"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1"
        />
        {editIndex === null ? (
          <Button onClick={handleAdd} disabled={!name || !date}>添加</Button>
        ) : (
          <Button onClick={handleSaveEdit} disabled={!name || !date}>保存</Button>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleClear}>清空</Button>
        <Button variant="outline" onClick={handleExample}>测试示例</Button>
      </div>
      <div className="space-y-2">
        {sortedEvents.length === 0 && <div className="text-gray-400 text-center">暂无事件</div>}
        {sortedEvents.map((ev, idx) => (
          <div key={idx} className="flex items-center justify-between border rounded p-2 bg-gray-50">
            <div>
              <span className="font-semibold">{ev.name}</span>
              <span className="ml-2 text-sm text-gray-500">{ev.date}</span>
              <span className="ml-2 text-blue-600 font-bold">{daysLeft(ev.date)} 天</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => handleEdit(events.indexOf(ev))}>编辑</Button>
              <Button size="sm" variant="secondary" onClick={() => handleDelete(events.indexOf(ev))}>删除</Button>
            </div>
          </div>
        ))}
      </div>
      {/* scroll to top */}
      {showScroll && (
        <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-20 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg" size="icon">
          <ChevronUpIcon className="h-5 w-5" />
        </Button>
      )}
      {/* 反馈和关于按钮 */}
      <div className="fixed bottom-4 left-0 w-full flex justify-center gap-4 z-40">
        <Button variant="outline" onClick={() => setShowFeedback(true)}><MessageCircleIcon className="h-4 w-4 mr-1" />反馈</Button>
        <Button variant="outline" onClick={() => setShowAbout(true)}><InfoIcon className="h-4 w-4 mr-1" />关于</Button>
      </div>
      {/* 反馈弹窗 */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader><DialogTitle>反馈</DialogTitle></DialogHeader>
          <div>如有建议或问题，欢迎加微信 wxweven 反馈！</div>
          <DialogFooter><Button onClick={() => setShowFeedback(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 关于弹窗 */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent>
          <DialogHeader><DialogTitle>关于</DialogTitle></DialogHeader>
          <div>倒数日/纪念日提醒工具，作者：wxweven。开源地址：https://github.com/wxweven/tool</div>
          <DialogFooter><Button onClick={() => setShowAbout(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CountdownReminder; 