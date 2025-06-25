import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import * as XLSX from 'xlsx';

const ExcelToSQL = () => {
  const [file, setFile] = useState(null);
  const [tableFields, setTableFields] = useState('');
  const [result, setResult] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerateSQL = async () => {
    if (!file || !tableFields) {
      alert('请上传文件并输入表字段定义');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);

      const fields = tableFields.split('\n').map(line => {
        const match = line.match(/`(\w+)`/);
        return match ? match[1] : null;
      }).filter(field => field !== null);

      const rows = csvData.split('\n').filter(row => row.trim() !== '');
      const headers = rows[0].split(',');
      const headerIndexMap = {};
      headers.forEach((header, index) => {
        headerIndexMap[header.toLowerCase()] = index;
      });

      let sqlStatements = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');
        const values = fields.map(field => {
          const index = headerIndexMap[field.toLowerCase()];
          if (index === undefined) return 'NULL';
          const value = row[index];
          if (value === '') return 'NULL';
          if (!isNaN(value)) return value;
          return `'${value.replace(/'/g, "''")}'`;
        });
        sqlStatements.push(`INSERT INTO combination_keypoint (${fields.join(', ')}) VALUES (${values.join(', ')});`);
      }

      setResult(sqlStatements.join('\n'));
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="mt-6 space-y-4">
          <div>
            <Label htmlFor="file" className="mb-2 block">上传 Excel 或 CSV 文件</Label>
            <Input type="file" id="file" onChange={handleFileChange} accept=".xlsx,.csv" />
          </div>
          <div>
            <Label htmlFor="tableFields" className="mb-2 block">输入 MySQL 表字段定义</Label>
            <Textarea
              id="tableFields"
              value={tableFields}
              onChange={(e) => setTableFields(e.target.value)}
              placeholder="输入 MySQL 建表语句中的字段定义"
              rows={10}
            />
          </div>
          <Button onClick={handleGenerateSQL} className="gap-2">
            生成 SQL 语句
          </Button>
          <div>
            <Label htmlFor="result" className="mb-2 block">生成结果</Label>
            <pre
              id="result"
              className="whitespace-pre-wrap break-all bg-white dark:bg-gray-950 border-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded p-3 min-h-[120px] text-sm font-mono select-all transition-all"
              style={{ wordBreak: 'break-all' }}
            >{result || <span className="text-gray-400">暂无生成结果</span>}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelToSQL;