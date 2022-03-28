import {IStyleAttr, ITableHeader} from "src/types";
import {ColumnsType} from "antd/lib/table/interface";
import {saveAs} from "file-saver";
import {Workbook, Worksheet} from "exceljs";
import {Row} from "exceljs";

// 默认的列宽
export const DEFAULT_COLUMN_WIDTH = 20;
// 默认行高
export const DEFAULT_ROW_HEIGHT = 20;

export function saveWorkbook(workbook: Workbook, fileName: string) {
  // 导出文件
  workbook.xlsx.writeBuffer().then((data => {
    const blob = new Blob([data], {type: ''});
    saveAs(blob, fileName);
  }))
}

// 根据 antd 的 column 生成 exceljs 的 column
export function generateHeaders(columns: any[]) {
  return columns?.map(col => {
    const obj: ITableHeader = {
      // 显示的 name
      header: col.title,
      // 用于数据匹配的 key
      key: col.dataIndex,
      // 列宽
      width: col.width / 5 || DEFAULT_COLUMN_WIDTH,
    };
    if (col.children) {
      obj.children = col.children?.map((item: any) => ({
        key: item.dataIndex,
        header: item.title,
        width: item.width,
        parentKey: col.dataIndex,
      }));
    }
    return obj;
  })
}

export function getColumnNumber(width: number) {
  // 需要的列数，四舍五入
  return Math.round(width / DEFAULT_COLUMN_WIDTH);
}

export function addHeaderStyle(row: Row, attr?: IStyleAttr) {
  const { color, fontSize, horizontal, bold } = attr || {};
  // eslint-disable-next-line no-param-reassign
  row.height = DEFAULT_ROW_HEIGHT;
  row.eachCell((cell, colNumber) => {
    // eslint-disable-next-line no-param-reassign
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color },
    };
    // eslint-disable-next-line no-param-reassign
    cell.font = {
      bold: bold ?? true,
      size: fontSize ?? 11,
      name: '微软雅黑',
    };
    // eslint-disable-next-line no-param-reassign
    cell.alignment = { vertical: 'middle', wrapText: true, horizontal: horizontal ?? 'left' };
  });
}


// 合并行和列，用于处理表头合并
export function mergeColumnCell(
  headers: ITableHeader[],
  rowHeader1: Row,
  rowHeader2: Row,
  nameRow1: string[],
  nameRow2: string[],
  worksheet: Worksheet,
) {
  // 当前 index 的指针
  let pointer = -1;
  nameRow1.forEach((name, index) => {
    // 当 index 小于指针时，说明这一列已经被合并过了，不能再合并
    if (index <= pointer) return;
    // 是否应该列合并
    const shouldVerticalMerge = name === nameRow2[index];
    // 是否应该行合并
    const shouldHorizontalMerge = index !== nameRow1.lastIndexOf(name);
    pointer = nameRow1.lastIndexOf(name);
    if (shouldVerticalMerge && shouldHorizontalMerge) {
      // 两个方向都合并
      worksheet.mergeCells(
        Number(rowHeader1.number),
        index + 1,
        Number(rowHeader2.number),
        nameRow1.lastIndexOf(name) + 1,
      );
    } else if (shouldVerticalMerge && !shouldHorizontalMerge) {
      // 只在垂直方向上同一列的两行合并
      worksheet.mergeCells(Number(rowHeader1.number), index + 1, Number(rowHeader2.number), index + 1);
    } else if (!shouldVerticalMerge && shouldHorizontalMerge) {
      // 只有水平方向同一行的多列合并
      worksheet.mergeCells(
        Number(rowHeader1.number),
        index + 1,
        Number(rowHeader1.number),
        nameRow1.lastIndexOf(name) + 1,
      );
      // eslint-disable-next-line no-param-reassign
      const cell = rowHeader1.getCell(index + 1);
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
  });
}

// 行合并单元格
export function mergeRowCell(headers: ITableHeader[], row: Row, worksheet: Worksheet) {
  // 当前列的索引
  let colIndex = 1;
  headers.forEach(header => {
    const { width, children } = header;
    if (children) {
      children.forEach(child => {
        colIndex += 1;
      });
    } else {
      // 需要的列数，四舍五入
      const colNum = getColumnNumber(width);
      // 如果 colNum > 1 说明需要合并
      if (colNum > 1) {
        worksheet.mergeCells(Number(row.number), colIndex, Number(row.number), colIndex + colNum - 1);
      }
      colIndex += colNum;
    }
  });
}
