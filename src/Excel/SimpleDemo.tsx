// 简单 demo
import React, {useEffect, useState} from 'react'
import {Button, Card, Table} from "antd";
import {ColumnsType} from "antd/lib/table/interface";
import * as ExcelJs from 'exceljs';
import {generateHeaders, saveWorkbook} from "../utils";

interface SimpleDemoProps {
}

interface StudentInfo {
  id: number;
  name: string;
  age: number;
  gender: string;
}

const SimpleDemo: React.FC<SimpleDemoProps> = () => {

  const [list, setList] = useState<StudentInfo[]>([]);

  useEffect(() => {
    generateData();
  }, [])

  function generateData() {
    let arr: StudentInfo[] = [];
    for (let i = 0; i < 10; i++) {
      arr.push({
        id: i,
        name: `小明${i}号`,
        age: i,
        gender: i % 2 === 0 ? '男' : '女'
      })
    }
    setList(arr);
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
  ];

  function onExportBasicExcel() {
    // 创建工作簿
    const workbook = new ExcelJs.Workbook();
    // 添加sheet
    const worksheet = workbook.addWorksheet('demo sheet');
    // 设置 sheet 的默认行高
    worksheet.properties.defaultRowHeight = 20;
    // 设置列
    worksheet.columns = generateHeaders(columns);
    // 添加行
    worksheet.addRows(list);
    // 导出excel
    saveWorkbook(workbook, 'simple-demo.xlsx');
  }

  return (
    <Card>
      <h3>简单表格</h3>
      <Button type={'primary'} style={{marginBottom: 10}} onClick={onExportBasicExcel}>导出excel</Button>
      <Table
        columns={columns}
        dataSource={list}
      />
    </Card>
  );
}

export default SimpleDemo
