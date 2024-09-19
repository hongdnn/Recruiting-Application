import ExcelJS from 'exceljs'
import { Constants } from './common/constants'


export const exportExcel = async (columns, data, filename, sheetName: string): Promise<string> => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(sheetName) 
    worksheet.columns = columns
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { horizontal: 'center' }
    data.forEach((e, index) => {
        // row 1 is the header.
        const row = worksheet.getRow((index + 2))
        row.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' }
        row.values = e
        worksheet.addRow({ row })
    })
    let dataMax: number[];
    let max: number;
    worksheet.columns.forEach(function (column, i) {
        dataMax = []
        column.eachCell({ includeEmpty: true }, (cell) => {
            dataMax.push(cell.value?.toString().length || 0)
        });
        max = Math.max(...dataMax);
        column.width = (max < 10 ? 10 : max) + 2;
    });
    const path = Constants.pathExcel + filename
    await workbook.xlsx.writeFile(path)
    return path
}

