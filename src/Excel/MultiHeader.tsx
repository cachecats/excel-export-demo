import React, {useEffect, useState} from 'react'
import {Button, Card, Space, Table} from "antd";
import {ColumnsType} from "antd/lib/table/interface";
import {ITableHeader, StudentInfo} from "../types";
import * as ExcelJs from "exceljs";
import {
  addHeaderStyle,
  DEFAULT_COLUMN_WIDTH, DEFAULT_ROW_HEIGHT,
  generateHeaders,
  getColumnNumber,
  mergeColumnCell,
  mergeRowCell,
  saveWorkbook
} from "../utils";
import {Worksheet} from "exceljs";

interface MultiHeaderProps {
}

const columns: ColumnsType<any> = [
  {
    width: 50,
    dataIndex: 'id',
    key: 'id',
    title: 'ID',
  },
  {
    width: 100,
    dataIndex: 'name',
    key: 'name',
    title: '姓名',
  },
  {
    width: 50,
    dataIndex: 'age',
    key: 'age',
    title: '年龄',
  },
  {
    width: 80,
    dataIndex: 'gender',
    key: 'gender',
    title: '性别',
  },
  {
    dataIndex: 'score',
    key: 'score',
    title: '成绩',
    children: [
      {
        width: 80,
        dataIndex: 'english',
        key: 'english',
        title: '英语',
      },
      {
        width: 80,
        dataIndex: 'math',
        key: 'math',
        title: '数学',
      },
      {
        width: 80,
        dataIndex: 'physics',
        key: 'physics',
        title: '物理',
      },
    ]
  },
  {
    width: 250,
    dataIndex: 'comment',
    key: 'comment',
    title: '老师评语',
  },
];


const MultiHeader: React.FC<MultiHeaderProps> = () => {

  const [list, setList] = useState<StudentInfo[]>([]);

  useEffect(() => {
    generateData();
  }, [])

  function generateData() {
    let arr: StudentInfo[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push({
        id: i,
        name: `小明${i}号`,
        age: 8+i,
        gender: i % 2 === 0 ? '男' : '女',
        english: 80 + i,
        math: 60 + i,
        physics: 70 + i,
        comment: `小明${i}号同学表现非常好，热心助人，成绩优秀，是社会主义接班人。热心助人，成绩优秀，是社会主义接班人。热心助人，成绩优秀，是社会主义接班人`
      })
    }
    setList(arr);
  }

  function onExportMultiHeaderExcel() {
    // 创建工作簿
    const workbook = new ExcelJs.Workbook();
    // 添加sheet
    const worksheet = workbook.addWorksheet('demo sheet');
    // 设置 sheet 的默认行高
    worksheet.properties.defaultRowHeight = 20;
    // 解析 AntD Table 的 columns
    const headers = generateHeaders(columns);
    console.log({headers})
    // 第一行表头
    const names1: string[] = [];
    // 第二行表头
    const names2: string[] = [];
    // 用于匹配数据的 keys
    const headerKeys: string[] = [];
    headers.forEach(item => {
      if (item.children) {
        // 有 children 说明是多级表头，header name 需要两行
        item.children.forEach(child => {
          names1.push(item.header);
          names2.push(child.header);
          headerKeys.push(child.key);
        });
      } else {
        const columnNumber = getColumnNumber(item.width);
        for (let i = 0; i < columnNumber; i++) {
          names1.push(item.header);
          names2.push(item.header);
          headerKeys.push(item.key);
        }
      }
    });
    handleHeader(worksheet, headers, names1, names2);
    // 添加数据
    addData2Table(worksheet, headerKeys, headers);
    // 给每列设置固定宽度
    worksheet.columns = worksheet.columns.map(col => ({ ...col, width: DEFAULT_COLUMN_WIDTH }));
    // 导出excel
    saveWorkbook(workbook, 'simple-demo.xlsx');
  }

  function handleHeader(
    worksheet: Worksheet,
    headers: ITableHeader[],
    names1: string[],
    names2: string[],
  ) {
    // 判断是否有 children, 有的话是两行表头
    const isMultiHeader = headers?.some(item => item.children);
    if (isMultiHeader) {
      // 加表头数据
      const rowHeader1 = worksheet.addRow(names1);
      const rowHeader2 = worksheet.addRow(names2);
      // 添加表头样式
      addHeaderStyle(rowHeader1, {color: 'dff8ff'});
      addHeaderStyle(rowHeader2, {color: 'dff8ff'});
      mergeColumnCell(headers, rowHeader1, rowHeader2, names1, names2, worksheet);
      return;
    }
    // 加表头数据
    const rowHeader = worksheet.addRow(names1);
    // 表头根据内容宽度合并单元格
    mergeRowCell(headers, rowHeader, worksheet);
    // 添加表头样式
    addHeaderStyle(rowHeader, {color: 'dff8ff'});
  }

  function addData2Table(worksheet: Worksheet, headerKeys: string[], headers: ITableHeader[]) {
    list?.forEach((item: any) => {
      const rowData = headerKeys?.map(key => item[key]);
      const row = worksheet.addRow(rowData);
      mergeRowCell(headers, row, worksheet);
      row.height = 26;
      // 设置行样式, wrapText: 自动换行
      row.alignment = { vertical: 'middle', wrapText: true, shrinkToFit: false };
      row.font = { size: 11, name: '微软雅黑' };
    })
  }

  return (
    <Card>
      <h3>多表头表格</h3>
      <Space style={{marginBottom: 10}}>
        <Button type={'primary'} onClick={onExportMultiHeaderExcel}>导出excel</Button>
      </Space>
      <Table
        rowKey={'id'}
        columns={columns}
        dataSource={list}
      />
    </Card>
  );
}

export default MultiHeader
