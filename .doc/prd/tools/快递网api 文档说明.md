

### <font style="color:rgb(51, 51, 51);">1 请求地址</font>
<font style="color:rgb(51, 51, 51);">http://api.kuaidi.com/openapi.html?id=[]&com=[]&nu=[]&show=[0|1]&muti=[0|1]&order=[desc|asc]</font>

<font style="color:rgb(51, 51, 51);">（使用时请先将上述地址中的 中括号 替换成下面相应的值）</font>

### <font style="color:rgb(51, 51, 51);">2 输入参数</font>
| <font style="color:rgb(0, 0, 0);">名称</font> | <font style="color:rgb(0, 0, 0);">类型</font> | <font style="color:rgb(0, 0, 0);">是否必需</font> | <font style="color:rgb(0, 0, 0);"> 描述</font> |
| :---: | :---: | :---: | :--- |
| <font style="color:rgb(0, 0, 0);">id</font> | <font style="color:rgb(0, 0, 0);">String</font> | <font style="color:rgb(0, 0, 0);">是</font> | <font style="color:rgb(0, 0, 0);">身份授权key，请</font><font style="color:rgb(0, 0, 0);"> </font>[<font style="color:rgb(33, 145, 255);">快递查询接口</font>](https://www.kuaidi.com/applyapi.html)<br/><font style="color:rgb(0, 0, 0);"> </font><font style="color:rgb(0, 0, 0);">进行申请（大小写敏感）</font> |
| <font style="color:rgb(0, 0, 0);">com</font> | <font style="color:rgb(0, 0, 0);">String</font> | <font style="color:rgb(0, 0, 0);">是</font> | <font style="color:rgb(0, 0, 0);">要查询的快递公司代码，不支持中文，对应的公司代码见   </font><font style="color:rgb(0, 0, 0);">《</font>[<font style="color:rgb(33, 145, 255);">kuaidi_api</font>](https://www.kuaidi.com/kuaidi_api(2020).doc)<br/><font style="color:rgb(0, 0, 0);">》。   </font><font style="color:rgb(0, 0, 0);">如果找不到您所需的公司，请发邮件至</font><font style="color:rgb(0, 0, 0);"> </font>[<font style="color:rgb(33, 145, 255);">zhangxiaoyu@kuaidi.com</font>](mailto:zhangxiaoyu@kuaidi.com)<br/><font style="color:rgb(0, 0, 0);">咨询（大小写不敏感）</font> |
| <font style="color:rgb(0, 0, 0);">nu</font> | <font style="color:rgb(0, 0, 0);">String</font> | <font style="color:rgb(0, 0, 0);">是</font> | <font style="color:rgb(0, 0, 0);">要查询的快递单号，请勿带特殊符号，不支持中文（大小写不敏感）</font> |
| <font style="color:rgb(0, 0, 0);">show</font> | <font style="color:rgb(0, 0, 0);">String</font> | <font style="color:rgb(0, 0, 0);">是</font> | <font style="color:rgb(0, 0, 0);">返回类型：   </font><font style="color:rgb(0, 0, 0);">0：返回json字符串，   </font><font style="color:rgb(0, 0, 0);">1：返回xml对象，   </font><font style="color:rgb(0, 0, 0);">如果不填，默认返回json字符串。</font> |
| <font style="color:rgb(0, 0, 0);">muti</font> | <font style="color:rgb(0, 0, 0);">String</font> | <font style="color:rgb(0, 0, 0);">是</font> | <font style="color:rgb(0, 0, 0);">返回信息数量：   </font><font style="color:rgb(0, 0, 0);">0:返回多行完整的信息，   </font><font style="color:rgb(0, 0, 0);">1:只返回一行信息。   </font><font style="color:rgb(0, 0, 0);">不填默认返回多行。   </font> |
| <font style="color:rgb(0, 0, 0);">order</font> | <font style="color:rgb(0, 0, 0);">String</font> | <font style="color:rgb(0, 0, 0);">是</font> | <font style="color:rgb(0, 0, 0);">排序：   </font><font style="color:rgb(0, 0, 0);">desc：按时间由新到旧排列，   </font><font style="color:rgb(0, 0, 0);">asc：按时间由旧到新排列。   </font><font style="color:rgb(0, 0, 0);">不填默认由新到旧排列（大小写不敏感）</font> |


### <font style="color:rgb(51, 51, 51);">3 返回结果</font>
| <font style="color:rgb(0, 0, 0);">字段名称</font> | <font style="color:rgb(0, 0, 0);"> 字段含义</font> |
| :---: | :--- |
| <font style="color:rgb(0, 0, 0);">success</font> | <font style="color:rgb(0, 0, 0);">返回状态：true 成功，false 失败</font> |
| <font style="color:rgb(0, 0, 0);">status</font> | <font style="color:rgb(0, 0, 0);">快递单当前状态：   </font><font style="color:rgb(0, 0, 0);">0:物流单号暂无结果；   </font><font style="color:rgb(0, 0, 0);">3:在途，快递处于运输过程中；   </font><font style="color:rgb(0, 0, 0);">4:揽件，快递已被快递公司揽收并产生了第一条信息；   </font><font style="color:rgb(0, 0, 0);">5:疑难，快递邮寄过程中出现问题；   </font><font style="color:rgb(0, 0, 0);">6:签收，收件人已签收；   </font><font style="color:rgb(0, 0, 0);">7:退签，快递因用户拒签、超区等原因退回，而且发件人已经签收；   </font><font style="color:rgb(0, 0, 0);">8:派件，快递员正在同城派件；   </font><font style="color:rgb(0, 0, 0);">9:退回，货物处于退回发件人途中；   </font> |
| <font style="color:rgb(0, 0, 0);">reason</font> | <font style="color:rgb(0, 0, 0);">如果请求失败，发送相应失败代码</font> |
| <font style="color:rgb(0, 0, 0);">data</font> | <font style="color:rgb(0, 0, 0);">数据集合</font> |
| <font style="color:rgb(0, 0, 0);">time</font> | <font style="color:rgb(0, 0, 0);">每条数据时间</font> |
| <font style="color:rgb(0, 0, 0);">context</font> | <font style="color:rgb(0, 0, 0);">每条数据内容</font> |




### <font style="color:rgb(51, 51, 51);">4 返回示例</font>
**<font style="color:rgb(0, 0, 0);">XML格式</font>**

```plain
<result>
            <success>true</success>
            <reason />
            <data>
		<time>2015-10-05 18:22:53</time> 
		<context>
			已签收,签收人是:本人
		</context>
	    </data>
	    <data>
		<time>2015-10-05 08:52:18</time> 
		<context>
			山东即墨公司 的派件员高广照正在派件
		</context>
	    </data>
	    <data>
		<time>2015-10-04 12:54:26</time> 
		<context>
			由山东潍坊中转部 发往山东即墨公司
		</context>
	    </data>
	    <data>
		<time>2015-10-03 23:27:55</time> 
		<context>
			由上海航空部 发往山东潍坊公司
		</context>
	    </data>
	    <data>
		<time>2015-10-03 19:42:58</time> 
		<context>
			由江苏吴江公司 发往上海航空部
		</context>
	    </data>
	    <data>
		<time>2015-10-03 19:33:55</time> 
		<context>
			江苏吴江公司 正在进行装袋扫描
		</context>
	    </data>
	    <data>
		<time>2015-10-03 19:33:55</time> 
		<context>
			由江苏吴江公司 发往上海航空部
		</context>
	    </data>
	    <data>
		<time>2015-10-03 19:24:58</time> 
		<context>
			江苏吴江公司 的收件员黎里片区淘宝已收件
		</context>
	    </data>
	    <status>6</status>
            </result>
```

<font style="color:rgb(0, 0, 0);">  
</font>**<font style="color:rgb(0, 0, 0);">JSON格式</font>**

```plain
{ "success":true,"reason":"","data":
        [{"time":"2015-10-20 18:35:13",
	 "context":"\u5df2\u7b7e\u6536,\u7b7e\u6536\u4eba\u662f:\u95e8\u536b\u7b7e\u6536"
	},
	{"time":"2015-10-20 10:20:17",
	 "context":"\u56db\u5ddd\u8fbe\u5dde\u5927\u7af9\u516c\u53f8\r\r\u7684\u6d3e\u4ef6\u5458\u
	 718a\u59d0\u6b63\u5728\u6d3e\u4ef6"
	},
	{
	 "time":"2015-10-20 09:40:40",
	 "context":"\u5feb\u4ef6\u5df2\u5230\u8fbe\u56db\u5ddd\u8fbe\u5dde\u5927\u7af9\u516c\u53f8"
	},
	{"time":"2015-10-20 03:00:23",
	 "context":"\u56db\u5ddd\u5357\u5145\u4e2d\u8f6c\u90e8\r\r\u6b63\u5728\u8fdb\u884c\u88c5\u8
	 f66\u626b\u63cf"
	},
	{"time":"2015-10-20 03:00:23",
	 "context":"\u7531\u56db\u5ddd\u5357\u5145\u4e2d\u8f6c\u90e8\r\r\u53d1\u5f80\u56db\u5ddd\u8
	 fbe\u5dde\u5927\u7af9\u516c\u53f8"
	},
	{"time":"2015-10-17 23:49:41",
	 "context":"\u7531\u4e0a\u6d77\u822a\u7a7a\u90e8\r\r\u53d1\u5f80\u56db\u5ddd\u6210\u90fd\u8
	 22a\u7a7a\u90e8"
	},
	{"time":"2015-10-17 21:10:16",
	 "context":"\u7531\u6c5f\u82cf\u5434\u6c5f\u516c\u53f8\r\r\u53d1\u5f80\u4e0a\u6d77\u822a\u7
	 a7a\u90e8"
	},
	{"time":"2015-10-17 20:57:19",
	 "context":"\u7531\u6c5f\u82cf\u5434\u6c5f\u516c\u53f8\r\r\u53d1\u5f80\u4e0a\u6d77\u822a\u7
	 a7a\u90e8"
	},
	{"time":"2015-10-17 20:57:19",
	 "context":"\u6c5f\u82cf\u5434\u6c5f\u516c\u53f8\r\r\u6b63\u5728\u8fdb\u884c\u88c5\u888b\u6
	 26b\u63cf"
	},
	{"time":"2015-10-17 20:23:17",
	 "context":"\u6c5f\u82cf\u5434\u6c5f\u516c\u53f8\r\r\u7684\u6536\u4ef6\u5458\u9ece\u91cc\u7
	 247\u533a\u6dd8\u5b9d\u5df2\u6536\u4ef6"
	}],
	"status":6
      }
```

