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

export interface StudentInfo {
  id: number;
  name: string;
  age: number;
  gender: string;
  english?: number;
  math?: number;
  physics?: number;
  comment?: string;
}

export interface IStyleAttr {
  color?: string;
  fontSize?: number;
  horizontal?: 'fill' | 'distributed' | 'justify' | 'center' | 'left' | 'right' | 'centerContinuous' | undefined;
  bold?: boolean;
}
