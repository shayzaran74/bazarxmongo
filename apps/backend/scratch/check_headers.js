const XLSX = require('xlsx');
const path = require('path');

const filePath = '/Users/macbook/Desktop/bazarx/belge/exel/bazarx_trendyol_sablonu.xlsx';
try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheets:', workbook.SheetNames);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Headers (Row 1):', data[0]);
    console.log('Data (Row 2):', data[1]);
} catch (e) {
    console.error('Error reading file:', e.message);
}
