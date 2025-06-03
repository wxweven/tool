import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CopyIcon } from "lucide-react";

const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [isMilliseconds, setIsMilliseconds] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const convertTimestampToDate = () => {
    if (!timestamp) return;
    
    const ts = parseInt(timestamp);
    if (isNaN(ts)) return;
    
    const date = new Date(isMilliseconds ? ts : ts * 1000);
    setDateTime(date.toLocaleString("zh-CN", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }));
  };

  const convertDateToTimestamp = () => {
    if (!dateTime) return;
    
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return;
    
    const ts = isMilliseconds ? date.getTime() : Math.floor(date.getTime() / 1000);
    setTimestamp(ts.toString());
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrentTime = (time) => {
    return new Date(time).toLocaleString("zh-CN", {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>时间戳转换</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="timestamp">时间戳</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="timestamp"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="输入时间戳"
                />
                <Button onClick={convertTimestampToDate}>转换</Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="datetime">日期时间</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
                <Button onClick={convertDateToTimestamp}>转换</Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="time-unit" 
                checked={isMilliseconds} 
                onCheckedChange={setIsMilliseconds} 
              />
              <Label htmlFor="time-unit">
                {isMilliseconds ? "毫秒 (13位)" : "秒 (10位)"}
              </Label>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setTimestamp(currentTime.toString());
                  convertTimestampToDate();
                }}
              >
                当前时间
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => {
                  setTimestamp("");
                  setDateTime("");
                }}
              >
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>转换结果</CardTitle>
        </CardHeader>
        <CardContent>
          {dateTime ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">日期时间格式:</h3>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md flex justify-between items-center">
                  <span>{dateTime}</span>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => copyToClipboard(dateTime)}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">时间戳格式:</h3>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md flex justify-between items-center">
                  <span>{timestamp}</span>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => copyToClipboard(timestamp)}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {copied && (
                <div className="text-green-500 text-sm mt-2">
                  已复制到剪贴板!
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>输入时间戳或日期时间进行转换</p>
              <p className="mt-2 text-sm">当前时间: {formatCurrentTime(currentTime)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimestampConverter;
