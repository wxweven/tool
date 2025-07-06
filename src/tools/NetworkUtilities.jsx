import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Wifi, 
  Server, 
  Monitor, 
  Copy, 
  Check, 
  Search,
  RefreshCw,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const NetworkUtilities = () => {
  const [activeTab, setActiveTab] = useState('ip-lookup');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [copiedStates, setCopiedStates] = useState({});

  // IP查询相关状态
  const [localIP, setLocalIP] = useState('');
  const [publicIP, setPublicIP] = useState('');
  const [ipInfo, setIpInfo] = useState(null);
  const [queryIP, setQueryIP] = useState('');

  // DNS查询相关状态
  const [domain, setDomain] = useState('');
  const [dnsResults, setDnsResults] = useState(null);

  // Whois查询相关状态
  const [whoisDomain, setWhoisDomain] = useState('');
  const [whoisResults, setWhoisResults] = useState('');

  // User-Agent生成器相关状态
  const [selectedBrowser, setSelectedBrowser] = useState('chrome');
  const [selectedOS, setSelectedOS] = useState('windows');
  const [generatedUA, setGeneratedUA] = useState('');

  // HTTP请求测试相关状态
  const [httpUrl, setHttpUrl] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [httpHeaders, setHttpHeaders] = useState('');
  const [httpBody, setHttpBody] = useState('');
  const [httpResponse, setHttpResponse] = useState(null);

  // 子网计算器相关状态
  const [subnetIP, setSubnetIP] = useState('');
  const [subnetMask, setSubnetMask] = useState('24');
  const [subnetResults, setSubnetResults] = useState(null);

  // User-Agent数据
  const userAgents = {
    chrome: {
      windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    firefox: {
      windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
      linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
    },
    safari: {
      mac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
    },
    edge: {
      windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    }
  };

  // 获取本地IP
  useEffect(() => {
    getLocalIP();
    getPublicIP();
  }, []);

  const getLocalIP = async () => {
    try {
      // 使用WebRTC获取本地IP
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch && !ipMatch[1].startsWith('127.')) {
            setLocalIP(ipMatch[1]);
            pc.close();
          }
        }
      };
    } catch (error) {
      console.error('获取本地IP失败:', error);
      setLocalIP('无法获取');
    }
  };

  const getPublicIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setPublicIP(data.ip);
    } catch (error) {
      console.error('获取公网IP失败:', error);
      setPublicIP('无法获取');
    }
  };

  // IP信息查询
  const queryIPInfo = async (ip = queryIP || publicIP) => {
    if (!ip) {
      toast.error('请输入要查询的IP地址');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      setIpInfo(data);
      toast.success('IP信息查询成功');
    } catch (error) {
      console.error('IP查询失败:', error);
      toast.error('IP查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // DNS查询（模拟）
  const queryDNS = async () => {
    if (!domain) {
      toast.error('请输入要查询的域名');
      return;
    }

    setLoading(true);
    try {
      // 由于浏览器限制，这里只能模拟DNS查询结果
      const mockResults = {
        domain: domain,
        a: ['93.184.216.34', '93.184.216.35'],
        aaaa: ['2606:2800:220:1:248:1893:25c8:1946'],
        mx: ['mail.example.com'],
        ns: ['ns1.example.com', 'ns2.example.com'],
        txt: ['v=spf1 include:_spf.example.com ~all'],
        cname: domain.startsWith('www.') ? domain.substring(4) : null
      };
      
      setDnsResults(mockResults);
      toast.success('DNS查询完成（模拟数据）');
    } catch (error) {
      console.error('DNS查询失败:', error);
      toast.error('DNS查询失败');
    } finally {
      setLoading(false);
    }
  };

  // Whois查询（模拟）
  const queryWhois = async () => {
    if (!whoisDomain) {
      toast.error('请输入要查询的域名');
      return;
    }

    setLoading(true);
    try {
      // 模拟Whois查询结果
      const mockWhois = `Domain Name: ${whoisDomain.toUpperCase()}
Registry Domain ID: 2138514_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.registrar.com
Registrar URL: http://www.registrar.com
Updated Date: 2023-12-01T12:00:00Z
Creation Date: 2000-01-01T12:00:00Z
Registry Expiry Date: 2024-12-01T12:00:00Z
Registrar: Example Registrar, Inc.
Registrar IANA ID: 1234
Registrar Abuse Contact Email: abuse@registrar.com
Registrar Abuse Contact Phone: +1.1234567890
Domain Status: clientTransferProhibited
Name Server: NS1.EXAMPLE.COM
Name Server: NS2.EXAMPLE.COM
DNSSEC: unsigned
URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/

注意：这是模拟数据，实际查询需要后端支持`;
      
      setWhoisResults(mockWhois);
      toast.success('Whois查询完成（模拟数据）');
    } catch (error) {
      console.error('Whois查询失败:', error);
      toast.error('Whois查询失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成User-Agent
  const generateUserAgent = () => {
    const ua = userAgents[selectedBrowser]?.[selectedOS];
    if (ua) {
      setGeneratedUA(ua);
      toast.success('User-Agent已生成');
    } else {
      toast.error('不支持的浏览器和操作系统组合');
    }
  };

  // HTTP请求测试
  const testHttpRequest = async () => {
    if (!httpUrl) {
      toast.error('请输入要测试的URL');
      return;
    }

    setLoading(true);
    try {
      const headers = {};
      if (httpHeaders) {
        httpHeaders.split('\n').forEach(line => {
          const [key, value] = line.split(':').map(s => s.trim());
          if (key && value) {
            headers[key] = value;
          }
        });
      }

      const options = {
        method: httpMethod,
        headers,
        mode: 'cors'
      };

      if (httpMethod !== 'GET' && httpBody) {
        options.body = httpBody;
      }

      const startTime = Date.now();
      const response = await fetch(httpUrl, options);
      const endTime = Date.now();
      
      const responseText = await response.text();
      
      setHttpResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
        time: endTime - startTime,
        url: response.url
      });
      
      toast.success('HTTP请求完成');
    } catch (error) {
      console.error('HTTP请求失败:', error);
      setHttpResponse({
        error: error.message,
        time: 0
      });
      toast.error('HTTP请求失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 子网计算
  const calculateSubnet = () => {
    if (!subnetIP) {
      toast.error('请输入IP地址');
      return;
    }

    try {
      const ip = subnetIP.split('.').map(Number);
      const maskBits = parseInt(subnetMask);
      
      if (ip.length !== 4 || ip.some(octet => octet < 0 || octet > 255)) {
        throw new Error('无效的IP地址');
      }
      
      if (maskBits < 0 || maskBits > 32) {
        throw new Error('无效的子网掩码');
      }

      const mask = (0xFFFFFFFF << (32 - maskBits)) >>> 0;
      const ipInt = (ip[0] << 24 | ip[1] << 16 | ip[2] << 8 | ip[3]) >>> 0;
      const network = (ipInt & mask) >>> 0;
      const broadcast = (network | (0xFFFFFFFF >>> maskBits)) >>> 0;
      
      const networkIP = [
        (network >>> 24) & 0xFF,
        (network >>> 16) & 0xFF,
        (network >>> 8) & 0xFF,
        network & 0xFF
      ].join('.');
      
      const broadcastIP = [
        (broadcast >>> 24) & 0xFF,
        (broadcast >>> 16) & 0xFF,
        (broadcast >>> 8) & 0xFF,
        broadcast & 0xFF
      ].join('.');
      
      const subnetMaskIP = [
        (mask >>> 24) & 0xFF,
        (mask >>> 16) & 0xFF,
        (mask >>> 8) & 0xFF,
        mask & 0xFF
      ].join('.');
      
      const totalHosts = Math.pow(2, 32 - maskBits);
      const usableHosts = totalHosts - 2;

      setSubnetResults({
        ip: subnetIP,
        mask: subnetMaskIP,
        cidr: `${networkIP}/${maskBits}`,
        network: networkIP,
        broadcast: broadcastIP,
        firstHost: networkIP.split('.').map((octet, i) => i === 3 ? parseInt(octet) + 1 : octet).join('.'),
        lastHost: broadcastIP.split('.').map((octet, i) => i === 3 ? parseInt(octet) - 1 : octet).join('.'),
        totalHosts,
        usableHosts
      });
      
      toast.success('子网计算完成');
    } catch (error) {
      toast.error('计算失败: ' + error.message);
    }
  };

  // 复制功能
  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
      toast.success('已复制到剪贴板');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">网络工具集</h1>
        <p className="text-gray-600">常用的网络诊断和测试工具集合</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="ip-lookup" className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">IP查询</span>
          </TabsTrigger>
          <TabsTrigger value="dns-lookup" className="flex items-center gap-1">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">DNS查询</span>
          </TabsTrigger>
          <TabsTrigger value="whois" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Whois</span>
          </TabsTrigger>
          <TabsTrigger value="user-agent" className="flex items-center gap-1">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">UA生成</span>
          </TabsTrigger>
          <TabsTrigger value="http-test" className="flex items-center gap-1">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">HTTP测试</span>
          </TabsTrigger>
          <TabsTrigger value="subnet" className="flex items-center gap-1">
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">子网计算</span>
          </TabsTrigger>
        </TabsList>

        {/* IP查询标签页 */}
        <TabsContent value="ip-lookup" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>本机IP信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">本地IP:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {localIP || '获取中...'}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(localIP, 'local-ip')}
                    >
                      {copiedStates['local-ip'] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">公网IP:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {publicIP || '获取中...'}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(publicIP, 'public-ip')}
                    >
                      {copiedStates['public-ip'] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={() => queryIPInfo(publicIP)} 
                  disabled={loading || !publicIP}
                  className="w-full"
                >
                  {loading ? '查询中...' : '查询公网IP详细信息'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IP地址查询</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="query-ip">IP地址</Label>
                  <Input
                    id="query-ip"
                    placeholder="输入要查询的IP地址"
                    value={queryIP}
                    onChange={(e) => setQueryIP(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => queryIPInfo(queryIP)} 
                  disabled={loading || !queryIP}
                  className="w-full"
                >
                  {loading ? '查询中...' : '查询IP信息'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {ipInfo && (
            <Card>
              <CardHeader>
                <CardTitle>IP详细信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div><strong>IP地址:</strong> {ipInfo.ip}</div>
                    <div><strong>国家:</strong> {ipInfo.country_name}</div>
                    <div><strong>地区:</strong> {ipInfo.region}</div>
                    <div><strong>城市:</strong> {ipInfo.city}</div>
                    <div><strong>邮编:</strong> {ipInfo.postal}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>ISP:</strong> {ipInfo.org}</div>
                    <div><strong>时区:</strong> {ipInfo.timezone}</div>
                    <div><strong>经度:</strong> {ipInfo.longitude}</div>
                    <div><strong>纬度:</strong> {ipInfo.latitude}</div>
                    <div><strong>货币:</strong> {ipInfo.currency}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* DNS查询标签页 */}
        <TabsContent value="dns-lookup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DNS记录查询</CardTitle>
              <CardDescription>查询域名的各种DNS记录</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="domain">域名</Label>
                <Input
                  id="domain"
                  placeholder="输入要查询的域名，如 example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <Button onClick={queryDNS} disabled={loading || !domain}>
                {loading ? '查询中...' : '查询DNS记录'}
              </Button>
              
              {dnsResults && (
                <div className="space-y-3">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      注意：由于浏览器安全限制，这里显示的是模拟数据。实际DNS查询需要后端支持。
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-3">
                    <div className="p-3 border rounded">
                      <strong>A记录:</strong> {dnsResults.a?.join(', ')}
                    </div>
                    <div className="p-3 border rounded">
                      <strong>AAAA记录:</strong> {dnsResults.aaaa?.join(', ')}
                    </div>
                    <div className="p-3 border rounded">
                      <strong>MX记录:</strong> {dnsResults.mx?.join(', ')}
                    </div>
                    <div className="p-3 border rounded">
                      <strong>NS记录:</strong> {dnsResults.ns?.join(', ')}
                    </div>
                    <div className="p-3 border rounded">
                      <strong>TXT记录:</strong> {dnsResults.txt?.join(', ')}
                    </div>
                    {dnsResults.cname && (
                      <div className="p-3 border rounded">
                        <strong>CNAME记录:</strong> {dnsResults.cname}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Whois查询标签页 */}
        <TabsContent value="whois" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Whois查询</CardTitle>
              <CardDescription>查询域名的注册信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whois-domain">域名</Label>
                <Input
                  id="whois-domain"
                  placeholder="输入要查询的域名"
                  value={whoisDomain}
                  onChange={(e) => setWhoisDomain(e.target.value)}
                />
              </div>
              <Button onClick={queryWhois} disabled={loading || !whoisDomain}>
                {loading ? '查询中...' : '查询Whois信息'}
              </Button>
              
              {whoisResults && (
                <div>
                  <Alert className="mb-3">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      注意：这是模拟数据。实际Whois查询需要后端支持。
                    </AlertDescription>
                  </Alert>
                  <Textarea
                    value={whoisResults}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User-Agent生成器标签页 */}
        <TabsContent value="user-agent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User-Agent生成器</CardTitle>
              <CardDescription>生成常用浏览器的User-Agent字符串</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="browser">浏览器</Label>
                  <Select value={selectedBrowser} onValueChange={setSelectedBrowser}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chrome">Chrome</SelectItem>
                      <SelectItem value="firefox">Firefox</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                      <SelectItem value="edge">Edge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="os">操作系统</Label>
                  <Select value={selectedOS} onValueChange={setSelectedOS}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="mac">macOS</SelectItem>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="ios">iOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={generateUserAgent}>
                生成User-Agent
              </Button>
              
              {generatedUA && (
                <div>
                  <Label>生成的User-Agent:</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Textarea
                      value={generatedUA}
                      readOnly
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedUA, 'user-agent')}
                    >
                      {copiedStates['user-agent'] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* HTTP请求测试标签页 */}
        <TabsContent value="http-test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>HTTP请求测试</CardTitle>
              <CardDescription>测试HTTP请求和响应</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="http-url">URL</Label>
                  <Input
                    id="http-url"
                    placeholder="https://api.example.com/data"
                    value={httpUrl}
                    onChange={(e) => setHttpUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="http-method">方法</Label>
                  <Select value={httpMethod} onValueChange={setHttpMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                      <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="http-headers">请求头 (每行一个，格式: Key: Value)</Label>
                <Textarea
                  id="http-headers"
                  placeholder="Content-Type: application/json
Authorization: Bearer token"
                  value={httpHeaders}
                  onChange={(e) => setHttpHeaders(e.target.value)}
                  rows={3}
                />
              </div>
              
              {httpMethod !== 'GET' && (
                <div>
                  <Label htmlFor="http-body">请求体</Label>
                  <Textarea
                    id="http-body"
                    placeholder='{"key": "value"}'
                    value={httpBody}
                    onChange={(e) => setHttpBody(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
              
              <Button onClick={testHttpRequest} disabled={loading || !httpUrl}>
                {loading ? '请求中...' : '发送请求'}
              </Button>
              
              {httpResponse && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <Badge variant={httpResponse.status < 400 ? 'default' : 'destructive'}>
                      {httpResponse.status} {httpResponse.statusText}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      响应时间: {httpResponse.time}ms
                    </span>
                  </div>
                  
                  {httpResponse.headers && (
                    <div>
                      <Label>响应头:</Label>
                      <Textarea
                        value={Object.entries(httpResponse.headers)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join('\n')}
                        readOnly
                        rows={5}
                        className="font-mono text-sm mt-2"
                      />
                    </div>
                  )}
                  
                  <div>
                    <Label>响应体:</Label>
                    <Textarea
                      value={httpResponse.body || httpResponse.error || ''}
                      readOnly
                      rows={10}
                      className="font-mono text-sm mt-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 子网计算器标签页 */}
        <TabsContent value="subnet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>子网计算器</CardTitle>
              <CardDescription>计算IP子网信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subnet-ip">IP地址</Label>
                  <Input
                    id="subnet-ip"
                    placeholder="192.168.1.1"
                    value={subnetIP}
                    onChange={(e) => setSubnetIP(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="subnet-mask">子网掩码 (CIDR)</Label>
                  <Select value={subnetMask} onValueChange={setSubnetMask}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 33}, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>/{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={calculateSubnet} disabled={!subnetIP}>
                计算子网
              </Button>
              
              {subnetResults && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div><strong>IP地址:</strong> {subnetResults.ip}</div>
                    <div><strong>子网掩码:</strong> {subnetResults.mask}</div>
                    <div><strong>CIDR表示:</strong> {subnetResults.cidr}</div>
                    <div><strong>网络地址:</strong> {subnetResults.network}</div>
                    <div><strong>广播地址:</strong> {subnetResults.broadcast}</div>
                  </div>
                  <div className="space-y-2">
                    <div><strong>第一个主机:</strong> {subnetResults.firstHost}</div>
                    <div><strong>最后一个主机:</strong> {subnetResults.lastHost}</div>
                    <div><strong>总主机数:</strong> {subnetResults.totalHosts.toLocaleString()}</div>
                    <div><strong>可用主机数:</strong> {subnetResults.usableHosts.toLocaleString()}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkUtilities; 