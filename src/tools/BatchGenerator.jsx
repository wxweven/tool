import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { CopyIcon, RefreshCwIcon, PlusIcon, MinusIcon, ChevronUpIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return isVisible ? (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
      size="icon"
    >
      <ChevronUpIcon className="h-5 w-5" />
    </Button>
  ) : null;
};

const BatchGenerator = () => {
  const [command, setCommand] = useState('randomName');
  const [quantity, setQuantity] = useState('10');
  const [filterDuplicates, setFilterDuplicates] = useState(true);
  const [delimiter, setDelimiter] = useState('\n');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    let generatedData = [];
    let tempSet = new Set();
    const lastNames = ['王', '李', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '郑', '谢', '罗', '梁', '宋', '唐', '许', '韩', '冯', '邓', '曹', '彭', '曾', '肖', '田', '董', '袁', '潘', '于', '蒋', '蔡', '余', '杜', '叶', '魏', '程', '苏', '吕', '丁', '任', '沈', '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金', '石', '廖', '贾', '夏', '韦', '付', '方', '白', '邹', '孟', '熊', '秦', '邱', '江', '尹', '薛', '阎', '段', '雷', '侯', '龙', '史', '陶', '黎', '贺', '顾', '毛', '郝', '龚', '邵', '万', '钱', '严', '赖', '覃', '洪', '武', '戴', '莫', '孔', '向', '文', '香', '包', '郭', '丁'];
    const firstNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '勇', '艳', '杰', '刚', '明', '秀英', '华', '平', '红', '亮', '欣', '桂英', '梅', '建华', '桂芳', '玉兰', '立', '建军', '英', '文', '德', '志强', '晓', '海', '永', '金', '义', '福', '荣', '新', '春', '乐', '发', '长', '秀', '芬', '琴', '兰', '梅', '菊', '凤', '霞', '翠', '萍', '珍', '爱', '莲', '珠', '玲', '素', '冬', '燕', '晶', '丹', '阳', '清', '蓉', '钰', '婷', '璐', '嘉', '思', '雨', '梦', '琪', '雅', '涵', '蕊', '悦', '彤', '茜', '蕾', '姗', '娜', '妮', '莎', '娜', '佳', '莉', '菲', '萱', '琳', '怡', '宁', '洁', '丽', '欣', '悦', '畅', '逸', '飞', '扬', '帆', '宇', '昊', '晨', '星', '辰', '阳', '辉', '达', '强', '磊', '军', '勇', '斌', '超', '健', '伟', '博', '文', '涛', '杰', '凯', '浩', '明', '睿', '轩', '子', '天', '宇', '泽', '峻', '辰', '逸', '翔', '鹏', '龙', '虎', '彪', '森', '柏', '峰', '磊', '岩', '林', '枫', '洋', '涛', '海', '江', '河', '川', '山', '石', '玉', '金', '银', '铜', '铁', '锡', '钢', '铝', '锌', '铅', '汞', '钛', '铂', '锰', '钴', '铬', '钒', '钨', '钼', '硅', '碳', '磷', '硫', '氯', '溴', '碘', '氟', '氧', '氮', '氢', '氦', '氖', '氩', '氪', '氙', '氡'];


    const generateRandomName = () => {
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomFirstNameLength = Math.random() < 0.5 ? 1 : 2; // 50% chance of 1-character or 2-character first name
      if (randomFirstNameLength === 1) {
        return randomLastName + firstNames[Math.floor(Math.random() * firstNames.length)].charAt(0);
      }
      return randomLastName + randomFirstName;
    };

    const generateRandomPhoneNumber = () => {
      const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                        '147', '149',
                        '150', '151', '152', '153', '155', '156', '157', '158', '159',
                        '166',
                        '170', '171', '173', '175', '176', '177', '178',
                        '180', '181', '182', '183', '184', '185', '186', '187', '188', '189',
                        '191', '198', '199'];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let suffix = '';
      for (let i = 0; i < 8; i++) {
        suffix += Math.floor(Math.random() * 10);
      }
      return randomPrefix + suffix;
    };

    const generateRandomEmail = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let localPart = '';
      for (let i = 0; i < Math.floor(Math.random() * 10) + 5; i++) { // 5-14 characters
        localPart += chars[Math.floor(Math.random() * chars.length)];
      }
      const domains = ['gmail.com', 'qq.com', '163.com', '126.com', 'sina.com', 'sohu.com', 'yahoo.com', 'hotmail.com', 'live.com', 'outlook.com'];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      return `${localPart}@${randomDomain}`;
    };

    const provinces = ['北京市', '上海市', '天津市', '重庆市', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '海南省', '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省', '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区'];
    const cities = {
      '北京市': ['市辖区'],
      '上海市': ['市辖区'],
      '天津市': ['市辖区'],
      '重庆市': ['市辖区'],
      '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
      '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
      '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
      '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
      '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市', '大兴安岭地区'],
      '江苏省': ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
      '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
      '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
      '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
      '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
      '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
      '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
      '湖北省': ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市', '恩施土家族苗族自治州', '仙桃市', '潜江市', '天门市'],
      '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市', '湘西土家族苗族自治州'],
      '广东省': ['广州市', '韶关市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '惠州市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '东莞市', '中山市', '潮州市', '揭阳市', '云浮市'],
      '海南省': ['海口市', '三亚市', '三沙市', '儋州市'],
      '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市', '阿坝藏族羌族自治州', '甘孜藏族自治州', '凉山彝族自治州'],
      '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州', '黔南布依族苗族自治州'],
      '云南省': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州', '文山壮族苗族自治州', '西双版纳傣族自治州', '大理白族自治州', '德宏傣族景颇族自治州', '怒江傈僳族自治州', '迪庆藏族自治州'],
      '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
      '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市', '临夏回族自治州', '甘南藏族自治州'],
      '青海省': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州', '海西蒙古族藏族自治州'],
      '台湾省': ['台北市', '新北市', '桃园市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉义市'],
      '内蒙古自治区': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市', '兴安盟', '锡林郭勒盟', '阿拉善盟'],
      '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
      '西藏自治区': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
      '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
      '新疆维吾尔自治区': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州', '阿克苏地区', '克孜勒苏柯尔克孜自治州', '喀什地区', '和田地区', '伊犁哈萨克自治州', '塔城地区', '阿勒泰地区'],
      '香港特别行政区': ['香港'],
      '澳门特别行政区': ['澳门'],
    };
    const districts = {
      '市辖区': ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '闵行区', '宝山区', '嘉定区', '浦东新区', '南开区', '河北区', '渝中区', '江北区'],
      '石家庄市': ['长安区', '桥西区', '新华区', '井陉矿区', '裕华区'],
      '唐山市': ['路南区', '路北区', '古冶区', '开平区', '丰南区'],
      '深圳市': ['罗湖区', '福田区', '南山区', '宝安区', '龙岗区', '盐田区'],
      '杭州市': ['上城区', '下城区', '江干区', '拱墅区', '西湖区', '滨江区'],
      '成都市': ['锦江区', '青羊区', '金牛区', '武侯区', '成华区', '龙泉驿区', '青白江区', '新都区', '温江区'],
      '西安市': ['新城区', '碑林区', '莲湖区', '雁塔区', '灞桥区', '未央区'],
      '武汉市': ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区'],
      '长沙市': ['芙蓉区', '天心区', '岳麓区', '开福区', '雨花区'],
      '南京市': ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区', '栖霞区'],
      '苏州市': ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区'],
      '郑州市': ['中原区', '二七区', '管城回族区', '金水区', '上街区', '惠济区'],
      // ... 更多城市区县数据
    };
    const streets = ['人民路', '中山大道', '解放街', '建设路', '文化街', '光明路', '幸福路', '新华路', '和平路', '发展大道', '友谊路', '胜利街', '团结路', '科技路', '大学路', '工业园路'];
    const generateRandomAddress = () => {
      const citiesWithDistricts = Object.keys(districts);
      const randomCity = citiesWithDistricts[Math.floor(Math.random() * citiesWithDistricts.length)];

      let randomProvince = '';
      for (const province in cities) {
        if (cities[province].includes(randomCity)) {
          randomProvince = province;
          break;
        }
      }
      // 如果省份是直辖市，则市的名称和省份名称一样
      const displayCity = (randomProvince === '北京市' || randomProvince === '上海市' || randomProvince === '天津市' || randomProvince === '重庆市') ? randomProvince : randomCity;

      const availableDistricts = districts[randomCity];
      const randomDistrict = availableDistricts[Math.floor(Math.random() * availableDistricts.length)];
      const randomStreet = streets[Math.floor(Math.random() * streets.length)];
      const houseNumber = Math.floor(Math.random() * 200) + 1; // 1-200
      return `${randomProvince}-${displayCity}-${randomDistrict}-${randomStreet}-${houseNumber}号`;
    };

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 1) {
        setQuantity('10');
        toast.error('请输入有效的生成数量', {
            description: '生成数量必须是大于0的数字。已重置为10。',
        });
        return;
    }

    if (command === 'randomName') {
      while (generatedData.length < numQuantity) {
        let name = generateRandomName();
        if (filterDuplicates) {
          if (!tempSet.has(name)) {
            tempSet.add(name);
            generatedData.push(name);
          }
        } else {
          generatedData.push(name);
        }
      }
    } else if (command === 'randomPhoneNumber') {
      while (generatedData.length < numQuantity) {
        let phoneNumber = generateRandomPhoneNumber();
        if (filterDuplicates) {
          if (!tempSet.has(phoneNumber)) {
            tempSet.add(phoneNumber);
            generatedData.push(phoneNumber);
          }
        } else {
          generatedData.push(phoneNumber);
        }
      }
    } else if (command === 'randomEmail') {
      while (generatedData.length < numQuantity) {
        let email = generateRandomEmail();
        if (filterDuplicates) {
          if (!tempSet.has(email)) {
            tempSet.add(email);
            generatedData.push(email);
          }
        } else {
          generatedData.push(email);
        }
      }
    } else if (command === 'randomAddress') {
      while (generatedData.length < numQuantity) {
        let address = generateRandomAddress();
        if (filterDuplicates) {
          if (!tempSet.has(address)) {
            tempSet.add(address);
            generatedData.push(address);
          }
        } else {
          generatedData.push(address);
        }
      }
    }
    const effectiveDelimiter = delimiter === '' ? '\n' : delimiter;
    setResult(generatedData.join(effectiveDelimiter));
  }, [command, quantity, filterDuplicates, delimiter]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('复制失败', {
        description: '无法将内容复制到剪贴板。',
      });
    }
  };

  const handleQuantityChange = useCallback((change) => {
    setQuantity(prev => String(Math.max(1, (parseInt(prev, 10) || 0) + change)));
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="mt-6 space-y-4">
          <div>
            <Label htmlFor="command" className="mb-2 block">选择指令</Label>
            <Tabs value={command} onValueChange={setCommand} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="randomName">随机生成姓名</TabsTrigger>
                <TabsTrigger value="randomPhoneNumber">随机生成手机号</TabsTrigger>
                <TabsTrigger value="randomEmail">随机生成邮箱地址</TabsTrigger>
                <TabsTrigger value="randomAddress">随机生成国内地址</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
            <Label htmlFor="quantity">生成数量</Label>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)}>
                <MinusIcon className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="w-20 text-center"
              />
              <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
            <Label htmlFor="filterDuplicates">过滤重复</Label>
            <Switch
              id="filterDuplicates"
              checked={filterDuplicates}
              onCheckedChange={setFilterDuplicates}
            />
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-4">
            <Label htmlFor="delimiter">分割符号</Label>
            <Input
              id="delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              placeholder="请输入分隔符，例如：\n"
            />
          </div>

          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4">
            <Label htmlFor="result" className="pt-2">生成结果</Label>
            <div className="relative w-full">
              <pre
                id="result"
                className="whitespace-pre-wrap break-all bg-white dark:bg-gray-950 border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded p-3 min-h-[120px] text-sm font-mono select-all transition-all"
                style={{wordBreak: 'break-all'}}
              >{result || <span className="text-gray-400">暂无生成结果</span>}</pre>
              {copied && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  已复制!
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={handleGenerate} className="gap-2">
              <RefreshCwIcon className="h-4 w-4" />
              生成
            </Button>
            <Button onClick={handleCopy} variant="outline" className="gap-2" disabled={!result}>
              <CopyIcon className="h-4 w-4" />
              复制结果
            </Button>
          </div>
        </CardContent>
      </Card>
      <ScrollToTop />
    </div>
  );
};

export default BatchGenerator;