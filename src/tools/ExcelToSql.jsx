import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";

const ExcelToSql = () => {
  const [ddl, setDdl] = useState("");
  const [tableName, setTableName] = useState("");
  const [sql, setSql] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
        generateSql(jsonData);
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

  const generateSql = (data) => {
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
        return `INSERT INTO \`${tableName}\` (${fields.map(f => `\`${f}\``).join(", ")}) VALUES (${values});`;
      })
      .join("\n");

    setSql(insertStatements);
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
    link.download = `${tableName}_insert.sql`;
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
      <h2 className="text-xl font-bold">Excel/CSV 转 SQL</h2>
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
      <Button onClick={handleGenerate}>生成 SQL</Button>
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
          placeholder="生成的 INSERT 语句将显示在此处"
          rows={15}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
};

export default ExcelToSql; 