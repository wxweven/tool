import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronUpIcon, 
  InfoIcon, 
  MessageCircleIcon,
  MailIcon,
  WebhookIcon,
  SettingsIcon,
  BellIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ClockIcon,
  ExternalLinkIcon
} from 'lucide-react';
import emailjs from '@emailjs/browser';

/**
 * 倒数日/纪念日提醒工具
 * 功能：
 * - 输入重要日期（如生日、纪念日、考试等）
 * - 自动显示距离天数
 * - 支持添加、删除、编辑事件
 * - 支持按天数排序
 * - 支持邮件提醒功能（使用EmailJS）
 * - 支持webhook提醒功能
 * - 支持测试示例、清空、scroll to top、反馈、关于
 */

const defaultEvents = [
  { name: '生日', date: '2024-12-01' },
  { name: '纪念日', date: '2024-10-01' },
  { name: '考试', date: '2024-09-10' }
];

// 默认邮件配置（使用EmailJS）
const defaultEmailConfig = {
  enabled: false,
  serviceType: 'emailjs', // 'emailjs' 或 'api'
  serviceId: '',
  templateId: '',
  publicKey: '',
  toEmail: '',
  subject: '倒数日提醒',
  template: '您的事件 "{eventName}" 还有 {days} 天就到了！',
  advanceDays: [1, 3, 7], // 提前提醒天数
  lastSent: null,
  // API方式配置
  apiUrl: 'https://api.emailjs.com/api/v1.0/email/send',
  apiKey: ''
};

// 默认webhook配置
const defaultWebhookConfig = {
  enabled: false,
  url: '',
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  template: JSON.stringify({
    text: '您的事件 "{eventName}" 还有 {days} 天就到了！',
    eventName: '{eventName}',
    days: '{days}',
    date: '{date}'
  }, null, 2),
  advanceDays: [1, 3, 7],
  lastSent: null
};

const CountdownReminder = () => {
  const [events, setEvents] = useState(defaultEvents);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [showEmailGuide, setShowEmailGuide] = useState(false);
  
  // 提醒配置
  const [emailConfig, setEmailConfig] = useState(() => {
    const saved = localStorage.getItem('countdown_email_config');
    return saved ? JSON.parse(saved) : defaultEmailConfig;
  });
  
  const [webhookConfig, setWebhookConfig] = useState(() => {
    const saved = localStorage.getItem('countdown_webhook_config');
    return saved ? JSON.parse(saved) : defaultWebhookConfig;
  });

  // 提醒状态
  const [reminderStatus, setReminderStatus] = useState({
    email: { status: 'idle', message: '' },
    webhook: { status: 'idle', message: '' }
  });

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 保存配置到本地存储
  useEffect(() => {
    localStorage.setItem('countdown_email_config', JSON.stringify(emailConfig));
  }, [emailConfig]);

  useEffect(() => {
    localStorage.setItem('countdown_webhook_config', JSON.stringify(webhookConfig));
  }, [webhookConfig]);

  // 检查提醒逻辑
  useEffect(() => {
    const checkReminders = () => {
      const today = new Date();
      const eventsToRemind = events.filter(event => {
        const eventDate = new Date(event.date);
        const daysLeft = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
        
        // 检查是否需要邮件提醒
        if (emailConfig.enabled && emailConfig.advanceDays.includes(daysLeft)) {
          const lastSent = emailConfig.lastSent?.[event.name]?.[daysLeft];
          if (!lastSent || new Date(lastSent).getDate() !== today.getDate()) {
            sendEmailReminder(event, daysLeft);
          }
        }
        
        // 检查是否需要webhook提醒
        if (webhookConfig.enabled && webhookConfig.advanceDays.includes(daysLeft)) {
          const lastSent = webhookConfig.lastSent?.[event.name]?.[daysLeft];
          if (!lastSent || new Date(lastSent).getDate() !== today.getDate()) {
            sendWebhookReminder(event, daysLeft);
          }
        }
      });
    };

    // 每天检查一次提醒
    const interval = setInterval(checkReminders, 1000 * 60 * 60); // 每小时检查一次
    checkReminders(); // 立即检查一次

    return () => clearInterval(interval);
  }, [events, emailConfig, webhookConfig]);

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

  // 邮件提醒功能
  const sendEmailReminder = async (event, daysLeft) => {
    if (!emailConfig.enabled || !emailConfig.toEmail) {
      return;
    }

    setReminderStatus(prev => ({ ...prev, email: { status: 'sending', message: '正在发送邮件...' } }));

    try {
      if (emailConfig.serviceType === 'emailjs') {
        // 使用EmailJS SDK发送
        if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
          throw new Error('EmailJS配置不完整');
        }

        const templateParams = {
          eventName: event.name,
          days: daysLeft,
          date: event.date
        };

        await emailjs.send(
          emailConfig.serviceId,
          emailConfig.templateId,
          templateParams,
          emailConfig.publicKey
        );
      } else {
        // 使用API方式发送
        if (!emailConfig.apiKey) {
          throw new Error('API密钥未配置');
        }

        const emailData = {
          service_id: emailConfig.serviceId,
          template_id: emailConfig.templateId,
          user_id: emailConfig.publicKey,
          template_params: {
            eventName: event.name,
            days: daysLeft,
            date: event.date
          }
        };

        const response = await fetch(emailConfig.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status}`);
        }
      }

      // 更新最后发送时间
      const newLastSent = {
        ...emailConfig.lastSent,
        [event.name]: {
          ...emailConfig.lastSent?.[event.name],
          [daysLeft]: new Date().toISOString()
        }
      };
      
      setEmailConfig(prev => ({ ...prev, lastSent: newLastSent }));
      setReminderStatus(prev => ({ ...prev, email: { status: 'success', message: '邮件发送成功！' } }));

      // 3秒后清除状态
      setTimeout(() => {
        setReminderStatus(prev => ({ ...prev, email: { status: 'idle', message: '' } }));
      }, 3000);

    } catch (error) {
      console.error('邮件发送失败:', error);
      setReminderStatus(prev => ({ ...prev, email: { status: 'error', message: `邮件发送失败: ${error.message}` } }));
    }
  };

  // Webhook提醒功能
  const sendWebhookReminder = async (event, daysLeft) => {
    if (!webhookConfig.enabled || !webhookConfig.url) {
      return;
    }

    setReminderStatus(prev => ({ ...prev, webhook: { status: 'sending', message: '正在发送webhook...' } }));

    try {
      let payload;
      try {
        payload = JSON.parse(webhookConfig.template);
      } catch {
        payload = { text: webhookConfig.template };
      }

      // 替换模板变量
      const stringifiedPayload = JSON.stringify(payload)
        .replace(/{eventName}/g, event.name)
        .replace(/{days}/g, daysLeft)
        .replace(/{date}/g, event.date);

      const finalPayload = JSON.parse(stringifiedPayload);

      // 发送webhook请求
      const response = await fetch(webhookConfig.url, {
        method: webhookConfig.method,
        headers: webhookConfig.headers,
        body: webhookConfig.method !== 'GET' ? JSON.stringify(finalPayload) : undefined
      });

      if (response.ok) {
        // 更新最后发送时间
        const newLastSent = {
          ...webhookConfig.lastSent,
          [event.name]: {
            ...webhookConfig.lastSent?.[event.name],
            [daysLeft]: new Date().toISOString()
          }
        };
        
        setWebhookConfig(prev => ({ ...prev, lastSent: newLastSent }));
        setReminderStatus(prev => ({ ...prev, webhook: { status: 'success', message: 'Webhook发送成功！' } }));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

      // 3秒后清除状态
      setTimeout(() => {
        setReminderStatus(prev => ({ ...prev, webhook: { status: 'idle', message: '' } }));
      }, 3000);

    } catch (error) {
      console.error('Webhook发送失败:', error);
      setReminderStatus(prev => ({ ...prev, webhook: { status: 'error', message: 'Webhook发送失败' } }));
    }
  };

  // 测试邮件发送
  const testEmail = () => {
    // 验证基本配置
    if (!emailConfig.toEmail) {
      setReminderStatus(prev => ({ 
        ...prev, 
        email: { status: 'error', message: '请先设置收件人邮箱地址' } 
      }));
      return;
    }

    if (emailConfig.serviceType === 'emailjs') {
      if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
        setReminderStatus(prev => ({ 
          ...prev, 
          email: { 
            status: 'error', 
            message: 'EmailJS配置不完整，请填写Service ID、Template ID和Public Key' 
          } 
        }));
        return;
      }
    } else if (emailConfig.serviceType === 'api') {
      if (!emailConfig.apiKey) {
        setReminderStatus(prev => ({ 
          ...prev, 
          email: { status: 'error', message: '请设置API密钥' } 
        }));
        return;
      }
    }

    const testEvent = { name: '测试事件', date: '2024-12-31' };
    sendEmailReminder(testEvent, 30);
  };

  // 测试webhook发送
  const testWebhook = () => {
    const testEvent = { name: '测试事件', date: '2024-12-31' };
    sendWebhookReminder(testEvent, 30);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircleIcon className="h-4 w-4 text-red-500" />;
      case 'sending': return <ClockIcon className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      <h2 className="text-xl font-bold">倒数日/纪念日提醒</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <BellIcon className="h-4 w-4" />事件管理
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <MailIcon className="h-4 w-4" />邮件提醒
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <WebhookIcon className="h-4 w-4" />Webhook提醒
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>添加事件</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>事件列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedEvents.length === 0 && <div className="text-gray-400 text-center">暂无事件</div>}
                {sortedEvents.map((ev, idx) => (
                  <div key={idx} className="flex items-center justify-between border rounded p-3 bg-gray-50">
                    <div>
                      <span className="font-semibold">{ev.name}</span>
                      <span className="ml-2 text-sm text-gray-500">{ev.date}</span>
                      <Badge variant={daysLeft(ev.date) <= 7 ? 'destructive' : daysLeft(ev.date) <= 30 ? 'secondary' : 'outline'}>
                        {daysLeft(ev.date)} 天
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(events.indexOf(ev))}>编辑</Button>
                      <Button size="sm" variant="secondary" onClick={() => handleDelete(events.indexOf(ev))}>删除</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="h-5 w-5" />邮件提醒设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-enabled"
                  checked={emailConfig.enabled}
                  onCheckedChange={(checked) => setEmailConfig(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="email-enabled">启用邮件提醒</Label>
              </div>

              {emailConfig.enabled && (
                <>
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>
                      邮件发送使用EmailJS服务。请先前往{' '}
                      <a 
                        href="https://www.emailjs.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        EmailJS官网 <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                      {' '}注册账号并创建邮件服务。
                    </AlertDescription>
                  </Alert>

                  {/* 快速配置提示 */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>快速开始：</strong> 如果您还没有EmailJS配置，可以：
                    </p>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>点击"配置指南"查看详细步骤</li>
                      <li>或者先填写收件人邮箱，然后点击"测试发送"查看具体需要哪些配置</li>
                    </ol>
                  </div>

                  <div className="space-y-2">
                    <Label>服务类型</Label>
                    <Select 
                      value={emailConfig.serviceType} 
                      onValueChange={(value) => setEmailConfig(prev => ({ ...prev, serviceType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emailjs">EmailJS SDK（推荐）</SelectItem>
                        <SelectItem value="api">EmailJS API</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      {emailConfig.serviceType === 'emailjs' 
                        ? '使用EmailJS SDK，更稳定可靠' 
                        : '使用EmailJS API，适合高级用户'
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>EmailJS服务ID</Label>
                      <Input
                        value={emailConfig.serviceId}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, serviceId: e.target.value }))}
                        placeholder="your-service-id"
                      />
                      <p className="text-sm text-gray-500">在EmailJS控制台的Email Services中获取</p>
                    </div>

                    <div className="space-y-2">
                      <Label>EmailJS模板ID</Label>
                      <Input
                        value={emailConfig.templateId}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, templateId: e.target.value }))}
                        placeholder="your-template-id"
                      />
                      <p className="text-sm text-gray-500">在EmailJS控制台的Email Templates中创建模板</p>
                    </div>

                    <div className="space-y-2">
                      <Label>EmailJS公共密钥</Label>
                      <Input
                        value={emailConfig.publicKey}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                        placeholder="your-public-key"
                      />
                      <p className="text-sm text-gray-500">在EmailJS控制台的Account &gt; API Keys中获取</p>
                    </div>

                    <div className="space-y-2">
                      <Label>收件人邮箱</Label>
                      <Input
                        value={emailConfig.toEmail}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, toEmail: e.target.value }))}
                        placeholder="to@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>邮件主题</Label>
                    <Input
                      value={emailConfig.subject}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="倒数日提醒"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>邮件模板变量说明</Label>
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      <p className="mb-2">在EmailJS模板中可以使用以下变量：</p>
                      <div className="space-y-1">
                        <div><code className="bg-white px-1 rounded border">eventName</code> - 事件名称</div>
                        <div><code className="bg-white px-1 rounded border">days</code> - 剩余天数</div>
                        <div><code className="bg-white px-1 rounded border">date</code> - 事件日期</div>
                      </div>
                      <p className="mt-2 text-gray-600">示例：您的事件 &#123;&#123;eventName&#125;&#125; 还有 &#123;&#123;days&#125;&#125; 天就到了！</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>邮件模板</Label>
                    <Textarea
                      value={emailConfig.template}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, template: e.target.value }))}
                      placeholder="您的事件 {eventName} 还有 {days} 天就到了！"
                      rows={3}
                    />
                    <p className="text-sm text-gray-500">
                      可用变量：{' '}
                      <code className="bg-gray-100 px-1 rounded">{'{eventName}'}</code> 事件名称,{' '}
                      <code className="bg-gray-100 px-1 rounded">{'{days}'}</code> 剩余天数,{' '}
                      <code className="bg-gray-100 px-1 rounded">{'{date}'}</code> 事件日期
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>提前提醒天数</Label>
                    <div className="flex gap-2">
                      {[1, 3, 7, 14, 30].map(day => (
                        <Button
                          key={day}
                          variant={emailConfig.advanceDays.includes(day) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newDays = emailConfig.advanceDays.includes(day)
                              ? emailConfig.advanceDays.filter(d => d !== day)
                              : [...emailConfig.advanceDays, day];
                            setEmailConfig(prev => ({ ...prev, advanceDays: newDays }));
                          }}
                        >
                          {day}天
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={testEmail} 
                      title="点击测试邮件发送"
                    >
                      测试发送
                    </Button>
                    <Button variant="outline" onClick={() => setEmailConfig(defaultEmailConfig)}>
                      重置配置
                    </Button>
                    <Button variant="outline" onClick={() => setShowEmailGuide(true)}>
                      配置指南
                    </Button>
                  </div>

                  {/* 配置状态提示 */}
                  <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-medium mb-2">配置状态：</p>
                    <div className="space-y-1">
                      <div className={`flex items-center gap-2 ${emailConfig.toEmail ? 'text-green-600' : 'text-red-600'}`}>
                        {emailConfig.toEmail ? '✓' : '✗'} 收件人邮箱: {emailConfig.toEmail || '未设置'}
                      </div>
                      {emailConfig.serviceType === 'emailjs' && (
                        <>
                          <div className={`flex items-center gap-2 ${emailConfig.serviceId ? 'text-green-600' : 'text-red-600'}`}>
                            {emailConfig.serviceId ? '✓' : '✗'} Service ID: {emailConfig.serviceId || '未设置'}
                          </div>
                          <div className={`flex items-center gap-2 ${emailConfig.templateId ? 'text-green-600' : 'text-red-600'}`}>
                            {emailConfig.templateId ? '✓' : '✗'} Template ID: {emailConfig.templateId || '未设置'}
                          </div>
                          <div className={`flex items-center gap-2 ${emailConfig.publicKey ? 'text-green-600' : 'text-red-600'}`}>
                            {emailConfig.publicKey ? '✓' : '✗'} Public Key: {emailConfig.publicKey ? '已设置' : '未设置'}
                          </div>
                        </>
                      )}
                      {emailConfig.serviceType === 'api' && (
                        <div className={`flex items-center gap-2 ${emailConfig.apiKey ? 'text-green-600' : 'text-red-600'}`}>
                          {emailConfig.apiKey ? '✓' : '✗'} API Key: {emailConfig.apiKey ? '已设置' : '未设置'}
                        </div>
                      )}
                    </div>
                    {(!emailConfig.toEmail || 
                      (emailConfig.serviceType === 'emailjs' && (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey)) ||
                      (emailConfig.serviceType === 'api' && !emailConfig.apiKey)) && (
                      <p className="mt-2 text-red-600 font-medium">
                        请完成以上配置后即可测试发送邮件
                      </p>
                    )}
                  </div>

                  {reminderStatus.email.status !== 'idle' && (
                    <Alert>
                      {getStatusIcon(reminderStatus.email.status)}
                      <AlertDescription>{reminderStatus.email.message}</AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WebhookIcon className="h-5 w-5" />Webhook提醒设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="webhook-enabled"
                  checked={webhookConfig.enabled}
                  onCheckedChange={(checked) => setWebhookConfig(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="webhook-enabled">启用Webhook提醒</Label>
              </div>

              {webhookConfig.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input
                      value={webhookConfig.url}
                      onChange={(e) => setWebhookConfig(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>请求方法</Label>
                      <Select value={webhookConfig.method} onValueChange={(value) => setWebhookConfig(prev => ({ ...prev, method: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Content-Type</Label>
                      <Select 
                        value={webhookConfig.headers['Content-Type']} 
                        onValueChange={(value) => setWebhookConfig(prev => ({ 
                          ...prev, 
                          headers: { ...prev.headers, 'Content-Type': value } 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="application/json">application/json</SelectItem>
                          <SelectItem value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</SelectItem>
                          <SelectItem value="text/plain">text/plain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>消息模板</Label>
                    <Textarea
                      value={webhookConfig.template}
                      onChange={(e) => setWebhookConfig(prev => ({ ...prev, template: e.target.value }))}
                      placeholder='{"text": "您的事件 {eventName} 还有 {days} 天就到了！"}'
                      rows={6}
                    />
                    <p className="text-sm text-gray-500">
                      可用变量：{' '}
                      <code className="bg-gray-100 px-1 rounded">{'{eventName}'}</code> 事件名称,{' '}
                      <code className="bg-gray-100 px-1 rounded">{'{days}'}</code> 剩余天数,{' '}
                      <code className="bg-gray-100 px-1 rounded">{'{date}'}</code> 事件日期
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>提前提醒天数</Label>
                    <div className="flex gap-2">
                      {[1, 3, 7, 14, 30].map(day => (
                        <Button
                          key={day}
                          variant={webhookConfig.advanceDays.includes(day) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newDays = webhookConfig.advanceDays.includes(day)
                              ? webhookConfig.advanceDays.filter(d => d !== day)
                              : [...webhookConfig.advanceDays, day];
                            setWebhookConfig(prev => ({ ...prev, advanceDays: newDays }));
                          }}
                        >
                          {day}天
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={testWebhook} disabled={!webhookConfig.url}>
                      测试发送
                    </Button>
                    <Button variant="outline" onClick={() => setWebhookConfig(defaultWebhookConfig)}>
                      重置配置
                    </Button>
                  </div>

                  {reminderStatus.webhook.status !== 'idle' && (
                    <Alert>
                      {getStatusIcon(reminderStatus.webhook.status)}
                      <AlertDescription>{reminderStatus.webhook.message}</AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
          <div>
            <p className="mb-2">倒数日/纪念日提醒工具 v2.0</p>
            <p className="mb-2">新增功能：</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>邮件提醒功能</li>
              <li>Webhook提醒功能</li>
              <li>自定义提醒模板</li>
              <li>多种提前提醒时间</li>
            </ul>
            <p className="mt-4">作者：wxweven</p>
            <p>开源地址：https://github.com/wxweven/tool</p>
          </div>
          <DialogFooter><Button onClick={() => setShowAbout(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EmailJS配置指南弹窗 */}
      <Dialog open={showEmailGuide} onOpenChange={setShowEmailGuide}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>EmailJS配置指南</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">第一步：注册EmailJS账号</h3>
              <p className="text-sm text-gray-600 mb-2">前往 <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">EmailJS官网</a> 注册免费账号</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">第二步：创建邮件服务</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>登录EmailJS控制台</li>
                <li>进入 Email Services 页面</li>
                <li>点击 "Add New Service"</li>
                <li>选择邮件服务商（如Gmail、QQ邮箱等）</li>
                <li>按照提示完成授权</li>
                <li>复制生成的 Service ID</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">第三步：创建邮件模板</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>进入 Email Templates 页面</li>
                <li>点击 "Create New Template"</li>
                <li>设置模板名称和内容</li>
                <li>在模板中使用变量：&#123;&#123;eventName&#125;&#125;、&#123;&#123;days&#125;&#125;、&#123;&#123;date&#125;&#125;</li>
                <li>保存模板并复制 Template ID</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">第四步：获取API密钥</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>进入 Account &gt; API Keys 页面</li>
                <li>复制 Public Key</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">第五步：配置工具</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>将获取的 Service ID、Template ID、Public Key 填入对应字段</li>
                <li>设置收件人邮箱地址</li>
                <li>点击"测试发送"验证配置</li>
              </ol>
            </div>
            
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                免费版EmailJS每月可发送200封邮件，足够个人使用。如需更多配额可升级付费版本。
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter><Button onClick={() => setShowEmailGuide(false)}>关闭</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CountdownReminder; 