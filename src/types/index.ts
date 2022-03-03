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
