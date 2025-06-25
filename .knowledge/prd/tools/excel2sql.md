# 本文档说明

请先阅读 .knowledge/common/common.md 文件，了解编码说明和项目通用知识。

本文档以 markdown 的格式来编写，请你先根据 markdown 的格式来理解本文档。

1. 一级标题需求描述及其内容包含的是需求说明；
2. 一级标题待修订功能及其内容是功能修订，用于标识在多次对话中，修复上一次对话未完成或待修复的功能。

# 需求描述
开发一个工具，输入一个 excel 或 csv 文件，以及 MySQL 建表语句的表字段定义，输出对应的 insert 语句。输入和输出说明及示例如下：
- MySQL 建表语句中的每个字段，跟 Excel 或 csv 中的列名一一对应；
- 输入的 MySQL 建表语句字段示例如下：
```sql
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `displayName` varchar(500) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '客户端展示名称',
  `keypoints` varchar(500) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '包含知识点列表合集，多个用逗号分割',
  `lastOperatorId` bigint(20) NOT NULL DEFAULT '999' COMMENT '最后操作人id 999-系统',
  `difficulty` tinyint(4) NOT NULL DEFAULT '0' COMMENT '难度',
  `ability` text COLLATE utf8mb4_unicode_ci COMMENT '能力',
  `dbctime` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `dbutime` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `phaseId` int(11) NOT NULL DEFAULT '0' COMMENT '学段',
  `courseId` int(11) NOT NULL DEFAULT '0' COMMENT '学科ID',
```
那么对应的字段为：
```text
id
displayName
keypoints
lastOperatorId
difficulty
ability
dbctime
dbutime
phaseId
courseId
```
即每行的第一段视为字段名，去除`` 符号；
- Excel 或 csv 中的列名跟 MySQL 字段名对应，但顺序不要求一致。
- Excel 或 csv 中的每行数据，都生成一条 SQL 语句，末尾带上分号。
- 假设输入的 csv 数据如下：
```csv
id,displayname,keypoints,lastoperatorid,difficulty,ability,dbctime,dbutime,phaseid,courseid
28185,长方形周长解决问题,,999,1,,2025-02-26 09:47:47.56,2025-02-26 09:47:47.56,3,2
28937,连续求一个数的几分之几是多少-解分数方程计算,"82319,10004661",23297441,4,"101,3;106,7",2025-03-11 15:44:25.066,2025-03-11 15:44:25.066,3,2
```
那么生成的 SQL 代码如下：
```sql
INSERT INTO combination_keypoint (id, displayname, lastoperatorid, difficulty, ability, dbctime, dbutime, phaseid, courseid) VALUES (28185, '长方形周长解决问题', 999, 1, NULL, '2025-02-26 09:47:47.56', '2025-02-26 09:47:47.56', 3, 2);
INSERT INTO combination_keypoint (id, displayname, lastoperatorid, difficulty, ability, dbctime, dbutime, phaseid, courseid) VALUES (28937, '连续求一个数的几分之几是多少-解分数方程计算', 23297441, 4, '101,3;106,7', '2025-03-11 15:44:25.066', '2025-03-11 15:44:25.066', 3, 2);
```

请你帮我实现这个功能。
# 已修订功能

# 待修订功能
- 现在需要分别输入表名和字段名，希望直接输入MySQL 的建表语句，比如下面的示例：
```sql
CREATE TABLE `combination_keypoint` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `displayName` varchar(500) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '客户端展示名称',
  `keypoints` varchar(500) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '包含知识点列表合集，多个用逗号分割',
  `lastOperatorId` bigint(20) NOT NULL DEFAULT '999' COMMENT '最后操作人id 999-系统',
  `difficulty` tinyint(4) NOT NULL DEFAULT '0' COMMENT '难度',
  `ability` text COLLATE utf8mb4_unicode_ci COMMENT '能力',
  `dbctime` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `dbutime` datetime(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `phaseId` int(11) NOT NULL DEFAULT '0' COMMENT '学段',
  `courseId` int(11) NOT NULL DEFAULT '0' COMMENT '学科ID',
  PRIMARY KEY (`id`),
  KEY `idx_keypoints` (`keypoints`) USING BTREE
)
```
从上面的 SQL 中提取表名和字段名，并忽略 PRIMARY KEY 和 KEY 等部分。
- 生成的 SQL 结果中，加上行号显示；
- 支持下载导出生成的 SQL 结果集，命名为"表名_insert.sql"。


