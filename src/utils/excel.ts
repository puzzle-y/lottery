import * as XLSX from 'xlsx';
import type { Person, ExcelImportResult } from '@/types';

/**
 * 解析Excel文件
 * 要求：仅包含2列数据，第一列"工号"，第二列"姓名"
 */
export function parseExcelFile(file: File): Promise<ExcelImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const errors: string[] = [];
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            success: false,
            data: [],
            errors: ['无法读取文件内容'],
            totalCount: 0,
          });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为JSON，保留表头
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          resolve({
            success: false,
            data: [],
            errors: ['Excel文件为空'],
            totalCount: 0,
          });
          return;
        }

        // 验证表头
        const headers = jsonData[0];
        if (headers.length < 2) {
          resolve({
            success: false,
            data: [],
            errors: ['Excel格式错误：至少需要包含2列数据（工号、姓名）'],
            totalCount: 0,
          });
          return;
        }

        const firstHeader = String(headers[0]).trim();
        const secondHeader = String(headers[1]).trim();
        
        // 检查表头是否为"工号"和"姓名"
        const validFirstHeaders = ['工号', '员工编号', '编号', 'ID', 'id', '员工号'];
        const validSecondHeaders = ['姓名', '名字', '员工姓名', 'Name', 'name'];
        
        if (!validFirstHeaders.some(h => firstHeader.includes(h))) {
          errors.push(`表头第一列应为"工号"，当前为"${firstHeader}"`);
        }
        
        if (!validSecondHeaders.some(h => secondHeader.includes(h))) {
          errors.push(`表头第二列应为"姓名"，当前为"${secondHeader}"`);
        }

        // 解析数据行
        const persons: Person[] = [];
        const seenIds = new Set<string>();
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 2) continue;
          
          const employeeId = String(row[0]).trim();
          const name = String(row[1]).trim();
          
          if (!employeeId && !name) continue;
          
          if (!employeeId) {
            errors.push(`第${i + 1}行：工号不能为空`);
            continue;
          }
          
          if (!name) {
            errors.push(`第${i + 1}行：姓名不能为空`);
            continue;
          }
          
          // 检查重复的工号
          if (seenIds.has(employeeId)) {
            errors.push(`第${i + 1}行：工号"${employeeId}"重复`);
            continue;
          }
          
          seenIds.add(employeeId);
          
          persons.push({
            id: `person_${Date.now()}_${i}`,
            employeeId,
            name,
            isWinner: false,
          });
        }

        resolve({
          success: errors.length === 0 && persons.length > 0,
          data: persons,
          errors,
          totalCount: persons.length,
        });
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [`解析Excel文件失败：${error instanceof Error ? error.message : '未知错误'}`],
          totalCount: 0,
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: ['读取文件失败'],
        totalCount: 0,
      });
    };
    
    reader.readAsBinaryString(file);
  });
}

/**
 * 导出中奖记录为Excel
 */
export function exportWinnersToExcel(records: any[], filename: string) {
  const data = records.map((record, index) => ({
    '序号': index + 1,
    '奖项': record.prizeName,
    '工号': record.employeeId,
    '姓名': record.personName,
    '中奖时间': record.winTime,
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '中奖记录');
  
  // 设置列宽
  const colWidths = [
    { wch: 8 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ];
  worksheet['!cols'] = colWidths;
  
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
