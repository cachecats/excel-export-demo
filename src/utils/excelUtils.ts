import {ColumnType} from 'antd/es/table/interface';
// @ts-ignore
import {saveAs} from 'file-saver';
import * as ExcelJs from 'exceljs';
import {Workbook, Worksheet, Row, Cell} from 'exceljs';
import JsZip from 'jszip'

export interface IDownloadFiles2Zip {
  // 压缩包的文件名
  zipName: string;
  files: IDownloadExcel[];
}

export interface IDownloadFiles2ZipWithFolder {
  zipName: string;
  folders: IFolder[];
}

export interface IFolder {
  folderName: string;
  files: IDownloadExcel[];
}

export interface IDownloadExcel {
  filename: string;
  sheets: ISheet[];
}

export interface ISheet {
  // sheet 的名字
  sheetName: string;
  // 这个 sheet 中表格的 column，类型同 antd 的 column
  columns: ColumnType<any>[];
  // 表格的数据
  dataSource: any[];
}

export interface ITableHeader {
  header: string;
  // 用于数据匹配的 key
  key: string;
  // 列宽
  width: number;
  // 父级的 key
  parentKey?: string;
  children?: ITableHeader[];
}

export interface IStyleAttr {
  color?: string;
  fontSize?: number;
  horizontal?: 'fill' | 'distributed' | 'justify' | 'center' | 'left' | 'right' | 'centerContinuous' | undefined;
  bold?: boolean;
}

// 默认的列宽
export const DEFAULT_COLUMN_WIDTH = 20;
// 默认行高
export const DEFAULT_ROW_HEIGHT = 20;

/**
 * 下载导出简单的表格
 * @param params
 */
export function downloadExcel(params: IDownloadExcel) {
  console.log({params});
  // 创建工作簿
  const workbook = new ExcelJs.Workbook();
  params?.sheets?.forEach((sheet) => handleEachSheet(workbook, sheet));
  saveWorkbook(workbook, `${params.filename}.xlsx`);
}

/**
 * 导出多个文件为zip压缩包
 */
export async function downloadFiles2Zip(params: IDownloadFiles2Zip) {
  const zip = new JsZip();
  // 待每个文件都写入完之后再生成 zip 文件
  const promises = params?.files?.map(async param => await handleEachFile(param, zip, ''))
  await Promise.all(promises);
  zip.generateAsync({type: "blob"}).then(blob => {
    saveAs(blob, `${params.zipName}.zip`)
  })
}

/**
 * 导出支持多级文件夹的压缩包
 * @param params
 */
export async function downloadFiles2ZipWithFolder(params: IDownloadFiles2ZipWithFolder) {
  const zip = new JsZip();
  const outPromises = params?.folders?.map(async folder => await handleFolder(zip, folder))
  await Promise.all(outPromises);
  zip.generateAsync({type: "blob"}).then(blob => {
    saveAs(blob, `${params.zipName}.zip`)
  })
}

async function handleFolder(zip: JsZip, folder: IFolder) {
  console.log({folder})
  let folderPromises: Promise<any>[] = [];
  const promises = folder?.files?.map(async param => await handleEachFile(param, zip, folder.folderName));
  await Promise.all([...promises, ...folderPromises]);
}

async function handleEachFile(param: IDownloadExcel, zip: JsZip, folderName: string) {
  // 创建工作簿
  const workbook = new ExcelJs.Workbook();
  param?.sheets?.forEach((sheet) => handleEachSheet(workbook, sheet));
  // 生成 blob
  const data = await workbook.xlsx.writeBuffer();
  const blob = new Blob([data], {type: ''});
  if (folderName) {
    zip.folder(folderName)?.file(`${param.filename}.xlsx`, blob)
  } else {
    // 写入 zip 中一个文件
    zip.file(`${param.filename}.xlsx`, blob);
  }
}

function handleEachSheet(workbook: Workbook, sheet: ISheet) {
  // 添加sheet
  const worksheet = workbook.addWorksheet(sheet.sheetName);
  // 设置 sheet 的默认行高。设置默认行高跟自动撑开单元格冲突
  // worksheet.properties.defaultRowHeight = 20;
  // 设置列
  worksheet.columns = generateHeaders(sheet.columns);
  handleHeader(worksheet);
  // handleData(worksheet, sheet);
  handleDataWithRender(worksheet, sheet);
}

export function handleHeader(worksheet: Worksheet) {
  // 给表头添加背景色。因为表头是第一行，可以通过 getRow(1) 来获取表头这一行
  const headerRow = worksheet.getRow(1);
  headerRow.height = 22;
  // 通过 cell 设置样式，更精准
  headerRow.eachCell((cell) => addCellStyle(cell, {color: 'dff8ff', fontSize: 12, horizontal: 'left'}));
}

export function handleData(worksheet: Worksheet, sheet: ISheet) {
  // 添加行
  const rows = worksheet.addRows(sheet?.dataSource);
  // 设置每行的样式
  addStyleToData(rows);
}

/**
 * 如果 column 有 render 函数，则以 render 渲染的结果显示
 * @param worksheet
 * @param sheet
 */
function handleDataWithRender(worksheet: Worksheet, sheet: ISheet) {
  const {dataSource, columns} = sheet;
  const rowsData = dataSource?.map(data => {
    return columns?.map(column => {
      // @ts-ignore
      const renderResult = column?.render?.(data[column.dataIndex], data);
      if (renderResult) {
        // 如果不是 object 说明没包裹标签，是基本类型直接返回
        if (typeof renderResult !== "object") {
          return renderResult;
        }
        // 如果是 object 说明包裹了标签，逐级取出值
        return getValueFromRender(renderResult);
      }
      // @ts-ignore
      return data[column.dataIndex];
    })
  })
  console.log({rowsData})
  // 添加行
  const rows = worksheet.addRows(rowsData);
  // 设置每行的样式
  addStyleToData(rows);
}

// 递归取出 render 里的值
// @ts-ignore
function getValueFromRender(renderResult: any) {
  if (renderResult?.type) {
    let children = renderResult?.props?.children;
    if (children?.type) {
      return getValueFromRender(children);
    } else {
      return children;
    }
  }
  return ''
}

function addStyleToData(rows: Row[]) {
  // 设置每行的样式
  rows?.forEach((row) => {
    // 设置字体
    // eslint-disable-next-line no-param-reassign
    row.font = {
      size: 11,
      name: '微软雅黑',
    };
    // 设置对齐方式
    // eslint-disable-next-line no-param-reassign
    row.alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: true,
    };
  });
}

export function saveWorkbook(workbook: Workbook, fileName: string) {
  // 导出文件
  workbook.xlsx.writeBuffer().then((data: any) => {
    const blob = new Blob([data], {type: ''});
    saveAs(blob, fileName);
  });
}

// 根据 antd 的 column 生成 exceljs 的 column
export function generateHeaders(columns: any[]) {
  return columns?.map((col) => {
    const obj: ITableHeader = {
      // 显示的 name
      header: col.title,
      // 用于数据匹配的 key
      key: col.dataIndex,
      // 列宽
      width: col.width / 5 > DEFAULT_COLUMN_WIDTH ? col.width / 5 : DEFAULT_COLUMN_WIDTH,
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
  });
}

export function getColumnNumber(width: number) {
  // 需要的列数，向上取整
  return Math.ceil(width / DEFAULT_COLUMN_WIDTH);
}

export function addCellStyle(cell: Cell,  attr?: IStyleAttr) {
  const {color, fontSize, horizontal, bold} = attr || {};
  // eslint-disable-next-line no-param-reassign
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {argb: color},
  };
  // eslint-disable-next-line no-param-reassign
  cell.font = {
    bold: bold ?? true,
    size: fontSize ?? 11,
    name: '微软雅黑',
  };
  // eslint-disable-next-line no-param-reassign
  cell.alignment = {vertical: 'middle', wrapText: true, horizontal: horizontal ?? 'left'};
}

export function addHeaderStyle(row: Row, attr?: IStyleAttr) {
  // eslint-disable-next-line no-param-reassign
  row.height = DEFAULT_ROW_HEIGHT;
  row.eachCell((cell) => addCellStyle(cell, attr));
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
      cell.alignment = {vertical: 'middle', horizontal: 'center'};
    }
  });
}

// 行合并单元格
export function mergeRowCell(headers: ITableHeader[], row: Row, worksheet: Worksheet) {
  // 当前列的索引
  let colIndex = 1;
  headers.forEach((header) => {
    const {width, children} = header;
    if (children) {
      children.forEach(() => {
        colIndex += 1;
      });
    } else {
      // 需要的列数，向上取整
      const colNum = getColumnNumber(width);
      // 如果 colNum > 1 说明需要合并
      if (colNum > 1) {
        worksheet.mergeCells(Number(row.number), colIndex, Number(row.number), colIndex + colNum - 1);
      }
      colIndex += colNum;
    }
  });
}
