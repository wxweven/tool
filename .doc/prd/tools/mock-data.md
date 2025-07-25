# 本文档说明

请先阅读 .knowledge/common/common.md 文件，了解编码说明和项目通用知识。

本文档以 markdown 的格式来编写，请你先根据 markdown 的格式来理解本文档。

1. 一级标题需求描述及其内容包含的是需求说明；
2. 一级标题待修订功能及其内容是功能修订，用于标识在多次对话中，修复上一次对话未完成或待修复的功能。

# 需求描述
添加一个新的工具，可以生成 mock 数据。具体的功能参见图片，图片中的功能是随机生成姓名。

# 已修订功能
bugfix: 批量生成工具，点击收藏后，收藏的列表没有显示。
bugfix: 批量生成工具，分割符号清空后，生成的结果没有任何分隔符了，这样结果不好阅读，优化为默认使用换行符。
参照之前的实现，新加2个指令：
- 随机生成邮箱地址，要求：
    - 符合邮箱的正则校验；
    - 覆盖主流邮箱域名，如gmail，qq.com,163.com,126.com,sina.com,sohu.com,yahoo.com,hotmail.com,live.com,outlook.com,gmail.com,qq.com,163.com,126.com,sina.com,sohu.com,yahoo.com,hotmail.com,live.com,outlook.com；
- 随机生成国内地址，格式为：省-市-区-街道-门牌号
- 指令由下拉框选择改为不同的tab，tab 的标题为指令的名称，tab 的内容为指令的实现。
- bugfix: 你生成的国内地址，you很多“未知区”、“未知市”，我看到是因为代码中的数据不完整，请根据国内的行政区划，补充完整。“区”的数据可能比较多，每个城市选取几个有代表性的区即可。
- 生成的结果中，不要出现“未知区”、“未知市”。
- 生成的结果中，不要出现“未知街道”、“未知门牌号”，可以随机mock街道和门牌号。
# 待修订功能
体验优化：
- 生成结果输入框，高度根据结果自动调整，不要固定高度，也不要出现滚动条。
- 点击“复制结果”后，页面没有提示toast “已复制”，具体优化可以参见“JSON格式化” 工具。
