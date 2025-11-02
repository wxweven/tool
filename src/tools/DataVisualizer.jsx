import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LabelList } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, TrendingUp, Sparkles, Download, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * 数据可视化工具
 * 功能：
 * - 支持输入文本数据并自动解析
 * - 支持多种图表类型：柱状图、折线图、饼图、面积图
 * - 支持自定义图表标题
 * - 智能配色：颜色根据数值大小自动渐变（蓝→绿→黄→红）
 * - 提供测试示例数据
 */

const DataVisualizer = () => {
  const [inputData, setInputData] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [chartTitle, setChartTitle] = useState('数据可视化图表');
  const [xAxisLabel, setXAxisLabel] = useState('类别');
  const [yAxisLabel, setYAxisLabel] = useState('数值');
  const [yAxisMin, setYAxisMin] = useState('0');
  const [yAxisMax, setYAxisMax] = useState('200');
  const [useFixedRange, setUseFixedRange] = useState(true);

  // 解析输入的文本数据
  const parseData = (text) => {
    if (!text.trim()) {
      setParsedData([]);
      return;
    }

    try {
      const lines = text.trim().split('\n');
      const data = [];

      lines.forEach(line => {
        // 跳过空行
        if (!line.trim()) return;

        // 支持多种格式：
        // 1. "P5 年薪：40万" 或 "P5 年薪: 40万"
        // 2. "P5,40" 或 "P5, 40"
        // 3. "P5 40"

        let name, value, unit;

        // 尝试匹配冒号分隔格式（中英文冒号），支持中文单位
        let match = line.match(/^(.+?)[：:][\s]*([0-9.]+)(万|千|百|亿)?/);

        if (match) {
          name = match[1].trim();
          value = parseFloat(match[2]);
          unit = match[3];
        } else {
          // 尝试匹配逗号分隔格式
          match = line.match(/^(.+?)[,，][\s]*([0-9.]+)(万|千|百|亿)?/);

          if (match) {
            name = match[1].trim();
            value = parseFloat(match[2]);
            unit = match[3];
          } else {
            // 尝试匹配空格分隔格式（最后匹配，避免误匹配名称中的空格）
            match = line.match(/^(.+?)[\s]+([0-9.]+)(万|千|百|亿)?$/);

            if (match) {
              name = match[1].trim();
              value = parseFloat(match[2]);
              unit = match[3];
            }
          }
        }

        if (name && !isNaN(value)) {
          // 处理中文单位
          if (unit === '亿') {
            value = value * 10000; // 转换为万
          } else if (unit === '万') {
            // 保持万为单位，不转换
            value = value;
          } else if (unit === '千') {
            value = value / 10; // 转换为万
          } else if (unit === '百') {
            value = value / 100; // 转换为万
          }

          data.push({ name, value });
        }
      });

      if (data.length === 0) {
        toast.error('无法解析数据，请检查格式');
        return;
      }

      setParsedData(data);
    } catch (error) {
      toast.error('数据解析失败');
      console.error(error);
    }
  };

  // 加载测试示例
  const loadExample = () => {
    const exampleData = `P5 年薪：40万
P6 年薪：60万
P7 年薪：80万
P8 年薪：100万
P9 年薪：120万
P10 年薪：140万`;
    setInputData(exampleData);
    setChartTitle('互联网公司职级年薪分布');
    setXAxisLabel('职级');
    setYAxisLabel('年薪（万元）');
    parseData(exampleData);
  };

  // 清空所有数据
  const clearAll = () => {
    setInputData('');
    setParsedData([]);
    setChartTitle('数据可视化图表');
    setXAxisLabel('类别');
    setYAxisLabel('数值');
    toast.success('已清空所有数据');
  };

  // 复制数据
  const copyData = () => {
    if (!inputData) {
      toast.error('没有可复制的数据');
      return;
    }
    navigator.clipboard.writeText(inputData);
    toast.success('数据已复制到剪贴板');
  };

  // 根据数值计算颜色（从蓝色到红色的渐变）
  const getColorByValue = (value) => {
    const min = parseFloat(yAxisMin);
    const max = parseFloat(yAxisMax);

    // 计算数值在范围内的比例 (0-1)
    const ratio = Math.min(Math.max((value - min) / (max - min), 0), 1);

    // 定义颜色渐变梯度（从低到高）
    const colorStops = [
      { ratio: 0.0, color: '#3B82F6' },  // 蓝色 - 低值
      { ratio: 0.2, color: '#06B6D4' },  // 青色
      { ratio: 0.4, color: '#10B981' },  // 绿色
      { ratio: 0.6, color: '#F59E0B' },  // 黄色
      { ratio: 0.8, color: '#F97316' },  // 橙色
      { ratio: 1.0, color: '#EF4444' }   // 红色 - 高值
    ];

    // 找到当前比例所在的渐变区间
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (ratio >= colorStops[i].ratio && ratio <= colorStops[i + 1].ratio) {
        const start = colorStops[i];
        const end = colorStops[i + 1];
        const segmentRatio = (ratio - start.ratio) / (end.ratio - start.ratio);

        // 在两个颜色之间插值
        return interpolateColor(start.color, end.color, segmentRatio);
      }
    }

    return colorStops[colorStops.length - 1].color;
  };

  // 颜色插值函数
  const interpolateColor = (color1, color2, ratio) => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);

    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // 自定义柱状图标签渲染
  const renderBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const item = parsedData[index];

    // 格式化数值显示
    const formatValue = (val) => {
      // 如果是整数，直接显示
      if (Number.isInteger(val)) {
        return `${val}万`;
      }
      // 如果是小数，保留1位小数
      return `${val.toFixed(1)}万`;
    };

    return (
      <g>
        {/* 显示名称（在顶部）- 使用对比色 */}
        <text
          x={x + width / 2}
          y={y - 15}
          fill="#1F2937"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fontWeight="700"
        >
          {item.name}
        </text>
        {/* 显示数值（在柱子中间）- 使用白色或高对比度颜色 */}
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill="#FFFFFF"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="800"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            paintOrder: 'stroke fill'
          }}
          stroke="#000000"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        >
          {formatValue(value)}
        </text>
      </g>
    );
  };

  // 渲染图表
  const renderChart = () => {
    if (parsedData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <Sparkles className="h-16 w-16 mb-4" />
          <p className="text-lg">输入数据后将在这里显示图表</p>
          <p className="text-sm mt-2">或点击"加载示例"查看效果</p>
        </div>
      );
    }

    const commonProps = {
      data: parsedData,
      margin: { top: 50, right: 30, left: 20, bottom: 60 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResponsiveContainer width="100%" height={600}>
                <BarChart {...commonProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    tick={false}
                    axisLine={{ stroke: '#9CA3AF' }}
                    label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 14 }}
                  />
                  <YAxis
                    domain={useFixedRange ? [parseFloat(yAxisMin), parseFloat(yAxisMax)] : ['auto', 'auto']}
                    axisLine={{ stroke: '#9CA3AF' }}
                    tick={{ fill: '#6B7280', fontSize: 14 }}
                    label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 14 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="value" name={yAxisLabel} radius={[8, 8, 0, 0]}>
                    {parsedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorByValue(entry.value)} />
                    ))}
                    <LabelList content={renderBarLabel} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'line':
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResponsiveContainer width="100%" height={600}>
                <LineChart {...commonProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#6B7280', fontSize: 14 }}
                    label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 14 }}
                  />
                  <YAxis
                    domain={useFixedRange ? [parseFloat(yAxisMin), parseFloat(yAxisMax)] : ['auto', 'auto']}
                    tick={{ fill: '#6B7280', fontSize: 14 }}
                    label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 14 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={yAxisLabel}
                    stroke={parsedData.length === 1 ? getColorByValue(parsedData[0].value) : '#3B82F6'}
                    strokeWidth={3}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={8}
                          fill={getColorByValue(payload.value)}
                          stroke="white"
                          strokeWidth={2}
                        />
                      );
                    }}
                    activeDot={{ r: 10 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'pie':
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResponsiveContainer width="100%" height={600}>
                <PieChart>
                  <Pie
                    data={parsedData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value, percent }) => `${name}: ${value}万 (${(percent * 100).toFixed(1)}%)`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {parsedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorByValue(entry.value)} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'area':
        return (
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ResponsiveContainer width="100%" height={600}>
                <AreaChart {...commonProps}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#6B7280', fontSize: 14 }}
                    label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 14 }}
                  />
                  <YAxis
                    domain={useFixedRange ? [parseFloat(yAxisMin), parseFloat(yAxisMax)] : ['auto', 'auto']}
                    tick={{ fill: '#6B7280', fontSize: 14 }}
                    label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: '#6B7280', fontSize: 14 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '14px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={yAxisLabel}
                    stroke={parsedData.length === 1 ? getColorByValue(parsedData[0].value) : '#3B82F6'}
                    fill={parsedData.length === 1 ? getColorByValue(parsedData[0].value) : '#3B82F6'}
                    fillOpacity={0.6}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 标题和说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            数据可视化工具
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>支持将文本数据快速转换为可视化图表，每行一条数据。</p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium mb-2">支持的数据格式：</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>冒号分隔：<code className="bg-gray-200 px-1 rounded">P5 年薪：40万</code> 或 <code className="bg-gray-200 px-1 rounded">销售额:100</code></li>
                <li>逗号分隔：<code className="bg-gray-200 px-1 rounded">P5,40</code> 或 <code className="bg-gray-200 px-1 rounded">产品A，200</code></li>
                <li>空格分隔：<code className="bg-gray-200 px-1 rounded">P5 40</code> 或 <code className="bg-gray-200 px-1 rounded">项目B 150</code></li>
              </ul>
              <p className="text-xs mt-2 text-gray-500">💡 支持中文单位：万、千、百、亿（如：40万 会自动识别）</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：数据输入区 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">数据输入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="input-data">输入数据（每行一条记录）</Label>
              <Textarea
                id="input-data"
                placeholder="请输入数据，例如：&#10;P5 年薪：40万&#10;P6 年薪：60万&#10;P7 年薪：80万"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="min-h-[300px] font-mono text-sm mt-2"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => parseData(inputData)} className="flex-1">
                <TrendingUp className="h-4 w-4 mr-2" />
                生成图表
              </Button>
              <Button onClick={loadExample} variant="outline">
                <Sparkles className="h-4 w-4 mr-2" />
                加载示例
              </Button>
              <Button onClick={copyData} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={clearAll} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* 图表配置 */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <Label htmlFor="chart-title">图表标题</Label>
                <Input
                  id="chart-title"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  placeholder="输入图表标题"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="x-label">X轴标签</Label>
                  <Input
                    id="x-label"
                    value={xAxisLabel}
                    onChange={(e) => setXAxisLabel(e.target.value)}
                    placeholder="类别"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="y-label">Y轴标签</Label>
                  <Input
                    id="y-label"
                    value={yAxisLabel}
                    onChange={(e) => setYAxisLabel(e.target.value)}
                    placeholder="数值"
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Y轴范围设置 */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fixed-range" className="text-base font-medium">
                      固定Y轴范围
                    </Label>
                    <p className="text-sm text-gray-600">
                      启用后，多次生成的图表可以进行高度对比
                    </p>
                  </div>
                  <Switch
                    id="fixed-range"
                    checked={useFixedRange}
                    onCheckedChange={setUseFixedRange}
                  />
                </div>

                {useFixedRange && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label htmlFor="y-min">最小值</Label>
                      <Input
                        id="y-min"
                        type="number"
                        value={yAxisMin}
                        onChange={(e) => setYAxisMin(e.target.value)}
                        placeholder="0"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="y-max">最大值</Label>
                      <Input
                        id="y-max"
                        type="number"
                        value={yAxisMax}
                        onChange={(e) => setYAxisMax(e.target.value)}
                        placeholder="200"
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="chart-type">图表类型</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger id="chart-type" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        柱状图
                      </div>
                    </SelectItem>
                    <SelectItem value="line">
                      <div className="flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4" />
                        折线图
                      </div>
                    </SelectItem>
                    <SelectItem value="pie">
                      <div className="flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4" />
                        饼图
                      </div>
                    </SelectItem>
                    <SelectItem value="area">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        面积图
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 颜色说明 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 via-green-50 via-yellow-50 to-red-50 rounded-lg border border-gray-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">智能配色</p>
                    <p className="text-xs text-gray-600">
                      颜色会根据数值大小自动调整：
                      <span className="text-blue-600 font-medium">蓝色</span>（低值）→
                      <span className="text-green-600 font-medium">绿色</span> →
                      <span className="text-yellow-600 font-medium">黄色</span> →
                      <span className="text-red-600 font-medium">红色</span>（高值）
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧：图表显示区 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{chartTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}

            {parsedData.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="text-base font-semibold">数据统计</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="text-gray-600 text-sm mb-1">数据条数</div>
                    <div className="text-2xl font-bold text-blue-700">{parsedData.length}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="text-gray-600 text-sm mb-1">总和</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {parsedData.reduce((sum, item) => sum + item.value, 0).toFixed(1)}万
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="text-gray-600 text-sm mb-1">平均值</div>
                    <div className="text-2xl font-bold text-green-700">
                      {(parsedData.reduce((sum, item) => sum + item.value, 0) / parsedData.length).toFixed(1)}万
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                    <div className="text-gray-600 text-sm mb-1">最大值</div>
                    <div className="text-2xl font-bold text-orange-700">
                      {Math.max(...parsedData.map(item => item.value)).toFixed(1)}万
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 数据预览表格 */}
      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">数据预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">序号</th>
                    <th className="text-left p-2">{xAxisLabel}</th>
                    <th className="text-right p-2">{yAxisLabel}</th>
                    <th className="text-right p-2">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((item, index) => {
                    const total = parsedData.reduce((sum, d) => sum + d.value, 0);
                    const percentage = ((item.value / total) * 100).toFixed(2);
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2 text-right">{item.value}</td>
                        <td className="p-2 text-right">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataVisualizer;

