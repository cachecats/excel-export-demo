import {ITableHeader} from "src/types";
import {ColumnsType} from "antd/lib/table/interface";
import {saveAs} from "file-saver";
import {Workbook} from "exceljs";

const DEFAULT_COLUMN_WIDTH = 20;

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
    return obj;
  })
}
