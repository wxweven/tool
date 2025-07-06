import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { Label } from "../components/ui/label";
import { 
  Palette, 
  Copy, 
  Download, 
  Upload, 
  Star,
  Eye,
  Shuffle,
  RefreshCw,
  Heart,
  Trash2
} from "lucide-react";

const ColorToolkit = () => {
  // 主色状态
  const [mainColor, setMainColor] = useState('#3B82F6');
  const [colorFormat, setColorFormat] = useState('hex');
  
  // 颜色格式值
  const [hexValue, setHexValue] = useState('#3B82F6');
  const [rgbValue, setRgbValue] = useState({ r: 59, g: 130, b: 246 });
  const [hslValue, setHslValue] = useState({ h: 217, s: 91, l: 60 });
  const [hsvValue, setHsvValue] = useState({ h: 217, s: 76, v: 96 });
  
  // 调色板
  const [paletteType, setPaletteType] = useState('monochromatic');
  const [generatedPalette, setGeneratedPalette] = useState([]);
  
  // 对比度检测
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#000000');
  const [contrastRatio, setContrastRatio] = useState(21);
  
  // 收藏夹
  const [favorites, setFavorites] = useState([
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'
  ]);
  
  // 渐变生成器
  const [gradientColors, setGradientColors] = useState(['#3B82F6', '#8B5CF6']);
  const [gradientDirection, setGradientDirection] = useState('to right');
  
  // 颜色转换函数
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };
  
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };
  
  const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      switch (max) {
        case r: h = ((g - b) / diff) % 6; break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : Math.round((diff / max) * 100);
    const v = Math.round(max * 100);
    
    return { h, s, v };
  };
  
  // 计算对比度
  const calculateContrast = (color1, color2) => {
    const getLuminance = (color) => {
      const rgb = hexToRgb(color);
      if (!rgb) return 0;
      
      const sRGB = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  };
  
  // 生成调色板
  const generatePalette = (baseColor, type) => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [];
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors = [];
    
    switch (type) {
      case 'monochromatic':
        for (let i = 0; i < 5; i++) {
          const newL = Math.max(10, Math.min(90, hsl.l + (i - 2) * 20));
          const newRgb = hslToRgb(hsl.h, hsl.s, newL);
          colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        break;
      case 'complementary':
        colors.push(baseColor);
        const compH = (hsl.h + 180) % 360;
        const compRgb = hslToRgb(compH, hsl.s, hsl.l);
        colors.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b));
        break;
      case 'triadic':
        for (let i = 0; i < 3; i++) {
          const newH = (hsl.h + i * 120) % 360;
          const newRgb = hslToRgb(newH, hsl.s, hsl.l);
          colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        break;
      case 'analogous':
        for (let i = -2; i <= 2; i++) {
          const newH = (hsl.h + i * 30 + 360) % 360;
          const newRgb = hslToRgb(newH, hsl.s, hsl.l);
          colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        }
        break;
      default:
        colors.push(baseColor);
    }
    
    return colors;
  };
  
  // 更新主色时同步更新所有格式
  const updateMainColor = (color) => {
    setMainColor(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      setRgbValue(rgb);
      setHslValue(rgbToHsl(rgb.r, rgb.g, rgb.b));
      setHsvValue(rgbToHsv(rgb.r, rgb.g, rgb.b));
      setHexValue(color);
    }
  };
  
  // 复制到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板！');
    });
  };
  
  // 添加到收藏夹
  const addToFavorites = (color) => {
    if (!favorites.includes(color)) {
      setFavorites(prev => [...prev, color]);
    }
  };
  
  // 从收藏夹移除
  const removeFromFavorites = (color) => {
    setFavorites(prev => prev.filter(c => c !== color));
  };
  
  // 生成随机颜色
  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateMainColor(randomColor);
  };
  
  // 监听颜色变化，更新调色板和对比度
  useEffect(() => {
    setGeneratedPalette(generatePalette(mainColor, paletteType));
  }, [mainColor, paletteType]);
  
  useEffect(() => {
    setContrastRatio(calculateContrast(backgroundColor, textColor));
  }, [backgroundColor, textColor]);
  
  const getContrastLevel = (ratio) => {
    if (ratio >= 7) return { level: 'AAA', color: 'text-green-600' };
    if (ratio >= 4.5) return { level: 'AA', color: 'text-blue-600' };
    if (ratio >= 3) return { level: 'AA Large', color: 'text-yellow-600' };
    return { level: 'Fail', color: 'text-red-600' };
  };
  
  const contrastLevel = getContrastLevel(contrastRatio);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">颜色工具箱</h2>
        <p className="text-muted-foreground">全方位的颜色处理工具，为设计师和开发者提供颜色相关的各种功能</p>
      </div>

      <Tabs defaultValue="picker" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="picker">颜色选择</TabsTrigger>
          <TabsTrigger value="palette">调色板</TabsTrigger>
          <TabsTrigger value="contrast">对比度</TabsTrigger>
          <TabsTrigger value="gradient">渐变</TabsTrigger>
          <TabsTrigger value="favorites">收藏夹</TabsTrigger>
        </TabsList>

        <TabsContent value="picker" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 颜色选择器 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  颜色选择器
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>主色选择</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={mainColor}
                      onChange={(e) => updateMainColor(e.target.value)}
                      className="w-16 h-16 border rounded cursor-pointer"
                    />
                    <div className="flex-1 space-y-2">
                      <div 
                        className="w-full h-16 rounded border"
                        style={{ backgroundColor: mainColor }}
                      ></div>
                      <Button 
                        onClick={generateRandomColor} 
                        variant="outline" 
                        className="w-full"
                      >
                        <Shuffle className="h-4 w-4 mr-2" />
                        随机颜色
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>HSL 调节</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">色相 (H): {hslValue.h}°</Label>
                      <Slider
                        value={[hslValue.h]}
                        onValueChange={(value) => {
                          const newHsl = { ...hslValue, h: value[0] };
                          setHslValue(newHsl);
                          const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          updateMainColor(hex);
                        }}
                        max={360}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">饱和度 (S): {hslValue.s}%</Label>
                      <Slider
                        value={[hslValue.s]}
                        onValueChange={(value) => {
                          const newHsl = { ...hslValue, s: value[0] };
                          setHslValue(newHsl);
                          const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          updateMainColor(hex);
                        }}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">亮度 (L): {hslValue.l}%</Label>
                      <Slider
                        value={[hslValue.l]}
                        onValueChange={(value) => {
                          const newHsl = { ...hslValue, l: value[0] };
                          setHslValue(newHsl);
                          const rgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
                          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                          updateMainColor(hex);
                        }}
                        max={100}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 颜色格式转换 */}
            <Card>
              <CardHeader>
                <CardTitle>颜色格式转换</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="w-12">HEX:</Label>
                    <Input
                      value={hexValue}
                      onChange={(e) => {
                        setHexValue(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          updateMainColor(e.target.value);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(hexValue)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="w-12">RGB:</Label>
                    <div className="flex-1 flex gap-1">
                      <Input
                        value={rgbValue.r}
                        onChange={(e) => {
                          const newRgb = { ...rgbValue, r: parseInt(e.target.value) || 0 };
                          setRgbValue(newRgb);
                          const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                          updateMainColor(hex);
                        }}
                        type="number"
                        min="0"
                        max="255"
                        className="w-16"
                      />
                      <Input
                        value={rgbValue.g}
                        onChange={(e) => {
                          const newRgb = { ...rgbValue, g: parseInt(e.target.value) || 0 };
                          setRgbValue(newRgb);
                          const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                          updateMainColor(hex);
                        }}
                        type="number"
                        min="0"
                        max="255"
                        className="w-16"
                      />
                      <Input
                        value={rgbValue.b}
                        onChange={(e) => {
                          const newRgb = { ...rgbValue, b: parseInt(e.target.value) || 0 };
                          setRgbValue(newRgb);
                          const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
                          updateMainColor(hex);
                        }}
                        type="number"
                        min="0"
                        max="255"
                        className="w-16"
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(`rgb(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b})`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="w-12">HSL:</Label>
                    <div className="flex-1 flex gap-1">
                      <Input
                        value={hslValue.h}
                        type="number"
                        min="0"
                        max="360"
                        className="w-16"
                        readOnly
                      />
                      <Input
                        value={hslValue.s}
                        type="number"
                        min="0"
                        max="100"
                        className="w-16"
                        readOnly
                      />
                      <Input
                        value={hslValue.l}
                        type="number"
                        min="0"
                        max="100"
                        className="w-16"
                        readOnly
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(`hsl(${hslValue.h}, ${hslValue.s}%, ${hslValue.l}%)`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="w-12">HSV:</Label>
                    <div className="flex-1 flex gap-1">
                      <Input
                        value={hsvValue.h}
                        type="number"
                        min="0"
                        max="360"
                        className="w-16"
                        readOnly
                      />
                      <Input
                        value={hsvValue.s}
                        type="number"
                        min="0"
                        max="100"
                        className="w-16"
                        readOnly
                      />
                      <Input
                        value={hsvValue.v}
                        type="number"
                        min="0"
                        max="100"
                        className="w-16"
                        readOnly
                      />
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(`hsv(${hsvValue.h}, ${hsvValue.s}%, ${hsvValue.v}%)`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => addToFavorites(mainColor)}
                    className="w-full"
                    variant="outline"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    添加到收藏夹
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="palette" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>调色板生成器</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={paletteType === 'monochromatic' ? 'default' : 'outline'}
                  onClick={() => setPaletteType('monochromatic')}
                >
                  单色调
                </Button>
                <Button
                  variant={paletteType === 'complementary' ? 'default' : 'outline'}
                  onClick={() => setPaletteType('complementary')}
                >
                  互补色
                </Button>
                <Button
                  variant={paletteType === 'triadic' ? 'default' : 'outline'}
                  onClick={() => setPaletteType('triadic')}
                >
                  三角色
                </Button>
                <Button
                  variant={paletteType === 'analogous' ? 'default' : 'outline'}
                  onClick={() => setPaletteType('analogous')}
                >
                  类似色
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {generatedPalette.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="w-full h-24 rounded border cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => updateMainColor(color)}
                    ></div>
                    <div className="text-center">
                      <div className="text-sm font-mono">{color}</div>
                      <div className="flex gap-1 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(color)}
                          className="flex-1"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToFavorites(color)}
                          className="flex-1"
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contrast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>颜色对比度检测</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>背景色</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-12 border rounded cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>文字色</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-12 border rounded cursor-pointer"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>对比度结果</Label>
                    <div className="p-4 border rounded">
                      <div className="text-2xl font-bold">
                        {contrastRatio.toFixed(2)}:1
                      </div>
                      <div className={`text-sm font-medium ${contrastLevel.color}`}>
                        {contrastLevel.level}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>预览效果</Label>
                  <div
                    className="p-6 rounded border"
                    style={{ 
                      backgroundColor: backgroundColor,
                      color: textColor
                    }}
                  >
                    <h3 className="text-lg font-bold mb-2">标题文字</h3>
                    <p className="mb-2">这是正常大小的文字内容，用于测试颜色对比度效果。</p>
                    <p className="text-sm">这是小号文字，对对比度要求更高。</p>
                  </div>

                  <div className="space-y-2">
                    <Label>WCAG 标准</Label>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>AAA (正常文字):</span>
                        <span className={contrastRatio >= 7 ? 'text-green-600' : 'text-red-600'}>
                          {contrastRatio >= 7 ? '通过' : '未通过'} (≥7:1)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>AA (正常文字):</span>
                        <span className={contrastRatio >= 4.5 ? 'text-green-600' : 'text-red-600'}>
                          {contrastRatio >= 4.5 ? '通过' : '未通过'} (≥4.5:1)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>AA (大号文字):</span>
                        <span className={contrastRatio >= 3 ? 'text-green-600' : 'text-red-600'}>
                          {contrastRatio >= 3 ? '通过' : '未通过'} (≥3:1)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gradient" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>渐变生成器</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>渐变颜色</Label>
                  <div className="flex gap-2">
                    {gradientColors.map((color, index) => (
                      <div key={index} className="flex gap-1">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            const newColors = [...gradientColors];
                            newColors[index] = e.target.value;
                            setGradientColors(newColors);
                          }}
                          className="w-12 h-12 border rounded cursor-pointer"
                        />
                        {gradientColors.length > 2 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newColors = gradientColors.filter((_, i) => i !== index);
                              setGradientColors(newColors);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGradientColors([...gradientColors, '#000000'])}
                    >
                      添加颜色
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>渐变方向</Label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'to right', label: '向右' },
                      { value: 'to left', label: '向左' },
                      { value: 'to bottom', label: '向下' },
                      { value: 'to top', label: '向上' },
                      { value: 'to bottom right', label: '右下' },
                      { value: 'to bottom left', label: '左下' },
                      { value: '45deg', label: '45°' },
                      { value: '90deg', label: '90°' }
                    ].map((dir) => (
                      <Button
                        key={dir.value}
                        size="sm"
                        variant={gradientDirection === dir.value ? 'default' : 'outline'}
                        onClick={() => setGradientDirection(dir.value)}
                      >
                        {dir.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>渐变预览</Label>
                  <div
                    className="w-full h-32 rounded border"
                    style={{
                      background: `linear-gradient(${gradientDirection}, ${gradientColors.join(', ')})`
                    }}
                  ></div>
                </div>

                <div className="space-y-2">
                  <Label>CSS 代码</Label>
                  <div className="p-3 bg-gray-100 rounded font-mono text-sm">
                    background: linear-gradient({gradientDirection}, {gradientColors.join(', ')});
                  </div>
                  <Button
                    onClick={() => copyToClipboard(`background: linear-gradient(${gradientDirection}, ${gradientColors.join(', ')});`)}
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    复制 CSS 代码
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>颜色收藏夹</CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {favorites.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="w-full h-24 rounded border cursor-pointer"
                        style={{ backgroundColor: color }}
                        onClick={() => updateMainColor(color)}
                      ></div>
                      <div className="text-center">
                        <div className="text-sm font-mono">{color}</div>
                        <div className="flex gap-1 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(color)}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromFavorites(color)}
                            className="flex-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Star className="h-12 w-12 mx-auto mb-2" />
                  <div>暂无收藏的颜色</div>
                  <div className="text-sm mt-1">在其他标签页中添加喜欢的颜色到收藏夹</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>• <strong>颜色选择：</strong>支持颜色选择器、HSL滑块调节和随机颜色生成</div>
          <div>• <strong>格式转换：</strong>实时转换 HEX、RGB、HSL、HSV 格式，一键复制</div>
          <div>• <strong>调色板：</strong>根据基色生成单色调、互补色、三角色、类似色调色板</div>
          <div>• <strong>对比度检测：</strong>检测文字和背景色对比度，符合 WCAG 无障碍标准</div>
          <div>• <strong>渐变生成：</strong>创建多色渐变，支持多种方向，生成 CSS 代码</div>
          <div>• <strong>收藏夹：</strong>保存常用颜色，方便重复使用</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorToolkit;