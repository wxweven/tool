import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Upload, FileSpreadsheet, Download, Trash2, AlertCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import * as XLSX from 'xlsx';

const ExcelToTable = () => {
    const [tableData, setTableData] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const fileInputRef = useRef(null);

    // 分页计算
    const totalRows = tableData ? tableData.length : 0;
    const totalPages = Math.ceil(totalRows / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageData = tableData ? tableData.slice(startIndex, endIndex) : [];

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsLoading(true);
        setError('');
        setFileName(file.name);
        setCurrentPage(1); // 重置到第一页

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 获取第一个工作表
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // 将工作表转换为JSON数组
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length === 0) {
                    setError('文件内容为空');
                    setIsLoading(false);
                    return;
                }

                // 第一行作为表头
                const tableHeaders = jsonData[0].map(header => 
                    header ? String(header).trim() : `列${jsonData[0].indexOf(header) + 1}`
                );
                
                // 其余行作为数据
                const tableRows = jsonData.slice(1).filter(row => 
                    row.some(cell => cell !== null && cell !== undefined && cell !== '')
                );

                setHeaders(tableHeaders);
                setTableData(tableRows);
            } catch (err) {
                setError('文件解析失败，请确保文件格式正确');
                console.error('File parsing error:', err);
            }
            setIsLoading(false);
        };

        reader.onerror = () => {
            setError('文件读取失败');
            setIsLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                file.type === 'application/vnd.ms-excel' || 
                file.type === 'text/csv' ||
                file.name.endsWith('.csv')) {
                const fakeEvent = { target: { files: [file] } };
                handleFileUpload(fakeEvent);
            } else {
                setError('请上传Excel文件(.xlsx, .xls)或CSV文件(.csv)');
            }
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const clearData = () => {
        setTableData(null);
        setHeaders([]);
        setFileName('');
        setError('');
        setCurrentPage(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const exportToCSV = () => {
        if (!tableData || !headers) return;

        const csvContent = [
            headers.join(','),
            ...tableData.map(row => 
                row.map(cell => {
                    const cellStr = cell ? String(cell) : '';
                    // 如果单元格包含逗号、引号或换行符，需要用引号包围
                    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, '')}_converted.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 分页处理函数
    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const goToFirstPage = () => goToPage(1);
    const goToLastPage = () => goToPage(totalPages);
    const goToPreviousPage = () => goToPage(currentPage - 1);
    const goToNextPage = () => goToPage(currentPage + 1);

    const handlePageSizeChange = (newPageSize) => {
        setPageSize(parseInt(newPageSize));
        setCurrentPage(1); // 重置到第一页
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Excel转表格工具</h1>
                    <p className="text-muted-foreground mt-2">
                        支持Excel文件(.xlsx, .xls)和CSV文件转换为表格显示
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        文件上传
                    </CardTitle>
                    <CardDescription>
                        拖拽文件到下方区域或点击选择文件，支持Excel和CSV格式
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-lg font-medium mb-2">拖拽文件到这里</p>
                        <p className="text-sm text-gray-500 mb-4">或</p>
                        <Button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            {isLoading ? '处理中...' : '选择文件'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {fileName && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{fileName}</span>
                            <div className="flex gap-2">
                                {tableData && (
                                    <Button size="sm" onClick={exportToCSV}>
                                        <Download className="h-4 w-4 mr-1" />
                                        导出CSV
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={clearData}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    清除
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {tableData && headers && (
                <Card>
                    <CardHeader>
                        <CardTitle>表格预览</CardTitle>
                        <CardDescription>
                            共 {totalRows} 行数据，{headers.length} 列
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* 表格 */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {headers.map((header, index) => (
                                            <TableHead key={index} className="bg-gray-50">
                                                {header}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentPageData.map((row, rowIndex) => (
                                        <TableRow key={startIndex + rowIndex}>
                                            {headers.map((header, colIndex) => (
                                                <TableCell key={colIndex}>
                                                    {row[colIndex] !== null && row[colIndex] !== undefined 
                                                        ? String(row[colIndex]) 
                                                        : ''}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* 分页导航 */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    显示第 {startIndex + 1} - {Math.min(endIndex, totalRows)} 条，共 {totalRows} 条
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* 每页条数选择器 */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">每页:</span>
                                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                            <SelectTrigger className="w-16">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-sm text-gray-600">条</span>
                                    </div>

                                    {/* 分页信息 */}
                                    <div className="text-sm text-gray-600">
                                        第 {currentPage} 页，共 {totalPages} 页
                                    </div>

                                    {/* 翻页按钮 */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={goToFirstPage}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={goToPreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        
                                        {/* 页码按钮 */}
                                        <div className="flex gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => goToPage(pageNum)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={goToNextPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={goToLastPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 当只有一页时显示每页条数选择器 */}
                        {totalPages <= 1 && totalRows > 0 && (
                            <div className="flex items-center justify-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">每页:</span>
                                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                        <SelectTrigger className="w-16">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-gray-600">条</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ExcelToTable; 