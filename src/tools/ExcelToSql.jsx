import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const ExcelToSql = () => {
  const [ddl, setDdl] = useState("");
  const [tableName, setTableName] = useState("");
  const [sql, setSql] = useState("");
  const [file, setFile] = useState(null);
  const [sqlType, setSqlType] = useState("insert");
  const [fieldWarnings, setFieldWarnings] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFieldWarnings([]);
  };

  const handleGenerate = () => {
    if (!file || !ddl) {
      toast.error("请提供建表语句和文件");
      return;
    }

    const tableNameMatch = ddl.match(/CREATE TABLE\s+`?([^`\s(]+)/i);
    const extractedTableName = tableNameMatch ? tableNameMatch[1] : null;

    if (!extractedTableName) {
      toast.error("无法从建表语句中解析出表名");
      return;
    }
    setTableName(extractedTableName);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let jsonData;
        if (file.name.endsWith(".csv")) {
          const parsedCsv = Papa.parse(data, { header: true, skipEmptyLines: true });
          jsonData = parsedCsv.data;
        } else {
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        }
        
        if (sqlType === "insert") {
          generateInsertSql(jsonData, extractedTableName);
        } else {
          generateUpdateSql(jsonData, extractedTableName);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("处理文件时出错");
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const generateInsertSql = (data, tableNameParam) => {
    // Extract fields from DDL
    const fields = ddl
      .split("\n")
      .map((line) => line.trim().match(/^`([^`]+)`/))
      .filter(Boolean)
      .map((match) => match[1]);

    if (fields.length === 0) {
      toast.error("无法从建表语句中解析出字段");
      return;
    }

    // Check if file headers match DDL fields
    if (data.length > 0) {
      const fileHeaders = Object.keys(data[0]).map(h => h.toLowerCase());
      const ddlFieldsLower = fields.map(f => f.toLowerCase());
      const missingHeaders = ddlFieldsLower.filter(f => !fileHeaders.includes(f));
      if(missingHeaders.length > 0) {
          // This is a soft check, maybe just warn the user.
          // For now, we proceed as per PRD which says order doesn't matter,
          // and we can assume the user provides correct files.
      }
    }

    const insertStatements = data
      .map((row) => {
        const lowerCaseRow = {};
        for (const key in row) {
            lowerCaseRow[key.toLowerCase()] = row[key];
        }

        const values = fields
          .map((field) => {
            const value = lowerCaseRow[field.toLowerCase()];
            if (value === null || value === undefined || value === "") {
              return "NULL";
            }
            if (typeof value === "string") {
              // Escape single quotes
              const escapedValue = value.replace(/'/g, "''");
              return `'${escapedValue}'`;
            }
            return value;
          })
          .join(", ");
        return `INSERT INTO \`${tableNameParam}\` (${fields.map(f => `\`${f}\``).join(", ")}) VALUES (${values});`;
      })
      .join("\n");

    setSql(insertStatements);
  };

  const generateUpdateSql = (data, tableNameParam) => {
    // Extract fields from DDL
    const fields = ddl
      .split("\n")
      .map((line) => line.trim().match(/^`([^`]+)`/))
      .filter(Boolean)
      .map((match) => match[1]);

    if (fields.length === 0) {
      toast.error("无法从建表语句中解析出字段");
      return;
    }

    if (data.length === 0) {
      toast.error("Excel/CSV 文件中没有数据");
      return;
    }

    // Get file headers
    const fileHeaders = Object.keys(data[0]);
    const fileHeadersLower = fileHeaders.map(h => h.toLowerCase());
    const ddlFieldsLower = fields.map(f => f.toLowerCase());

    // Check field matching
    const unmatchedFields = fileHeadersLower.filter(f => !ddlFieldsLower.includes(f));
    const warnings = [];
    
    if (unmatchedFields.length > 0) {
      warnings.push(`Excel/CSV 中的以下字段在建表语句中未找到: ${unmatchedFields.join(', ')}`);
      // 给出建议
      unmatchedFields.forEach(unmatchedField => {
        const suggestions = ddlFieldsLower.filter(field => 
          field.includes(unmatchedField) || unmatchedField.includes(field)
        );
        if (suggestions.length > 0) {
          warnings.push(`建议将 "${unmatchedField}" 替换为: ${suggestions.join(', ')}`);
        }
      });
    }

    setFieldWarnings(warnings);

    // First column is the WHERE condition field
    const whereField = fileHeaders[0];
    const whereFieldLower = whereField.toLowerCase();
    
    if (!ddlFieldsLower.includes(whereFieldLower)) {
      toast.error(`WHERE 条件字段 "${whereField}" 在建表语句中未找到`);
      return;
    }

    // Other columns are SET fields
    const setFields = fileHeaders.slice(1);
    const validSetFields = setFields.filter(field => 
      ddlFieldsLower.includes(field.toLowerCase())
    );

    if (validSetFields.length === 0) {
      toast.error("没有找到有效的 SET 字段");
      return;
    }

    const updateStatements = data
      .map((row) => {
        const lowerCaseRow = {};
        for (const key in row) {
            lowerCaseRow[key.toLowerCase()] = row[key];
        }

        // Get WHERE condition value
        const whereValue = row[whereField];
        if (whereValue === null || whereValue === undefined || whereValue === "") {
          return null; // Skip rows with empty WHERE condition
        }

        // Build SET clause
        const setClause = validSetFields
          .map((field) => {
            const value = row[field];
            if (value === null || value === undefined || value === "") {
              return `\`${field}\` = NULL`;
            }
            if (typeof value === "string") {
              // Escape single quotes
              const escapedValue = value.replace(/'/g, "''");
              return `\`${field}\` = '${escapedValue}'`;
            }
            return `\`${field}\` = ${value}`;
          })
          .join(", ");

        // Build WHERE clause
        let whereClause;
        if (typeof whereValue === "string") {
          const escapedWhereValue = whereValue.replace(/'/g, "''");
          whereClause = `\`${whereField}\` = '${escapedWhereValue}'`;
        } else {
          whereClause = `\`${whereField}\` = ${whereValue}`;
        }

        return `UPDATE \`${tableNameParam}\` SET ${setClause} WHERE ${whereClause};`;
      })
      .filter(Boolean) // Remove null statements
      .join("\n");

    setSql(updateStatements);
  };

  const handleCopy = () => {
    if (sql) {
      navigator.clipboard.writeText(sql);
      toast.success("SQL 已复制到剪贴板");
    }
  };

  const handleDownload = () => {
    if (!sql || !tableName) {
      toast.error("没有可供下载的SQL或表名");
      return;
    }
    const blob = new Blob([sql], { type: "text/sql;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileType = sqlType === "insert" ? "insert" : "update";
    link.download = `${tableName}_${fileType}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sqlWithLineNumbers = sql
    .split("\n")
    .filter(Boolean)
    .map((line, index) => `${String(index + 1).padStart(4, ' ')} | ${line}`)
    .join("\n");

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ddl">MySQL 建表语句</Label>
        <Textarea
          id="ddl"
          placeholder="在此处粘贴完整的 CREATE TABLE 语句"
          value={ddl}
          onChange={(e) => setDdl(e.target.value)}
          rows={10}
        />
      </div>
      <div>
        <Label htmlFor="file-upload">上传 Excel/CSV 文件</Label>
        <Input id="file-upload" type="file" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
      </div>
      <div>
        <Label htmlFor="sql-type">SQL 类型</Label>
        <Select value={sqlType} onValueChange={setSqlType}>
          <SelectTrigger>
            <SelectValue placeholder="选择 SQL 类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="insert">INSERT 语句</SelectItem>
            <SelectItem value="update">UPDATE 语句</SelectItem>
          </SelectContent>
        </Select>
        {sqlType === "update" && (
          <p className="text-sm text-muted-foreground mt-1">
            注意：UPDATE 语句的第一列将作为 WHERE 条件，其他列将作为 SET 字段
          </p>
        )}
      </div>
      <Button onClick={handleGenerate}>生成 SQL</Button>
      
      {fieldWarnings.length > 0 && (
        <Alert>
          <AlertDescription>
            <div className="space-y-1">
              {fieldWarnings.map((warning, index) => (
                <p key={index} className="text-sm">{warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-2">
            <Label htmlFor="sql-output">生成的 SQL</Label>
            <div className="space-x-2">
              <Button onClick={handleCopy} variant="secondary" size="sm">复制</Button>
              <Button onClick={handleDownload} variant="secondary" size="sm">下载</Button>
            </div>
        </div>
        <Textarea
          id="sql-output"
          readOnly
          value={sqlWithLineNumbers}
          placeholder={`生成的 ${sqlType.toUpperCase()} 语句将显示在此处`}
          rows={15}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
};

export default ExcelToSql;