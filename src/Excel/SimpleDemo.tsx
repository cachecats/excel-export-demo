// 简单 demo
import React, {useEffect, useState} from 'react'
import {Button, Card, Space, Table} from "antd";
import {ColumnsType} from "antd/lib/table/interface";
import * as ExcelJs from 'exceljs';
import {generateHeaders, saveWorkbook} from "../utils";
import {StudentInfo} from "../types";
import {downloadExcel, downloadFiles2Zip, downloadFiles2ZipWithFolder} from "../utils/excelUtils";

interface SimpleDemoProps {
}

const SimpleDemo: React.FC<SimpleDemoProps> = () => {

  const [list, setList] = useState<StudentInfo[]>([]);

  useEffect(() => {
    generateData();
  }, [])

  function generateData() {
    let arr: StudentInfo[] = [];
    for (let i = 0; i < 5; i++) {
      arr.push({
        id: i,
        name: i % 2 === 0 ? `小明${i}号哈哈哈哈哈哈哈啊哈哈哈哈哈哈哈哈哈哈哈哈啊哈嘿嘿哈哈或` : `小明${i}号`,
        age: 10 + i,
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
      render: (text, row) => <div><p>{row.id + 20}</p></div>,
      // render: (text, row) => String(text) === '0' ? '-' : text,
      // render: (text, row) => <div>{'hahaha'}</div>,
      // render: (text, row) => 'hahaha',
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

  // 导出
  function onExportBasicExcelWithStyle() {
    // 创建工作簿
    const workbook = new ExcelJs.Workbook();
    // 添加sheet
    const worksheet = workbook.addWorksheet('demo sheet');
    // 设置 sheet 的默认行高
    worksheet.properties.defaultRowHeight = 20;
    // 设置列
    worksheet.columns = generateHeaders(columns);
    // 给表头添加背景色。因为表头是第一行，可以通过 getRow(1) 来获取表头这一行
    let headerRow = worksheet.getRow(1);
    // 直接给这一行设置背景色
    // headerRow.fill = {
    //   type: 'pattern',
    //   pattern: 'solid',
    //   fgColor: {argb: 'dff8ff'},
    // }
    // 通过 cell 设置样式，更精准
    headerRow.eachCell((cell, colNum) => {
      // 设置背景色
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {argb: 'dff8ff'},
      }
      // 设置字体
      cell.font = {
        bold: true,
        italic: true,
        size: 12,
        name: '微软雅黑',
        color: {argb: 'ff0000'},
      };
      // 设置对齐方式
      cell.alignment = {vertical: 'middle', horizontal: 'left', wrapText: false,};
    })
    // 添加行
    let rows = worksheet.addRows(list);
    // 设置每行的样式
    rows?.forEach(row => {
      // 设置字体
      row.font = {
        size: 11,
        name: '微软雅黑',
      };
      // 设置对齐方式
      row.alignment = {vertical: 'middle', horizontal: 'left', wrapText: false,};
    })
    // 导出excel
    saveWorkbook(workbook, 'simple-demo.xlsx');
  }

  function onExportExcel() {
    downloadExcel({
      filename: 'test',
      sheets: [{
        sheetName: 'test',
        columns: columns,
        dataSource: list
      }]
    })
  }

  function onExportZip() {
    downloadFiles2Zip({
      zipName: '压缩包',
      files: [
        {
          filename: 'test',
          sheets: [
            {
              sheetName: 'test',
              columns: columns,
              dataSource: list
            },
            {
              sheetName: 'test2',
              columns: columns,
              dataSource: list
            }
          ]
        },
        {
          filename: 'test2',
          sheets: [{
            sheetName: 'test',
            columns: columns,
            dataSource: list
          }]
        },
        {
          filename: 'test3',
          sheets: [{
            sheetName: 'test',
            columns: columns,
            dataSource: list
          }]
        }
      ]
    })
  }

  function onExportFolderZip() {
    downloadFiles2ZipWithFolder({
      zipName: '压缩包',
      folders: [
        {
          folderName: '文件夹1',
          files: [
            {
              filename: 'test',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
            {
              filename: 'test2',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
          ]
        },
        {
          folderName: '文件夹2',
          files: [
            {
              filename: 'test',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
            {
              filename: 'test2',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
          ]
        },
        {
          folderName: '文件夹2/文件夹2-1',
          files: [
            {
              filename: 'test',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
            {
              filename: 'test2',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
          ]
        },
        {
          folderName: '文件夹2/文件夹2-1/文件夹2-1-1',
          files: [
            {
              filename: 'test',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
            {
              filename: 'test2',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
          ]
        },
        {
          folderName: '',
          files: [
            {
              filename: 'test',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              },
                {
                  sheetName: 'test2',
                  columns: columns,
                  dataSource: list
                }
              ]
            },
            {
              filename: 'test2',
              sheets: [{
                sheetName: 'test',
                columns: columns,
                dataSource: list
              }]
            },
          ]
        }
      ]
    })
  }

  return (
    <Card>
      <h3>简单表格</h3>
      <Space style={{marginBottom: 10}}>
        <Button type={'primary'} onClick={onExportBasicExcel}>导出excel</Button>
        <Button type={'primary'} onClick={onExportBasicExcelWithStyle}>导出带样式excel</Button>
        <Button type={'primary'} onClick={onExportExcel}>封装方法导出excel</Button>
        <Button type={'primary'} onClick={onExportZip}>导出zip</Button>
        <Button type={'primary'} onClick={onExportFolderZip}>导出分文件夹zip</Button>
      </Space>
      <Table
        rowKey='id'
        columns={columns}
        dataSource={list}
      />
    </Card>
  );
}

export default SimpleDemo
