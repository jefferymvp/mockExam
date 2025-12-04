const XLSX = require('xlsx');
const fs = require('fs');

try {
    const buf = fs.readFileSync('gesp题库.xlsx');
    const wb = XLSX.read(buf, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    
    if (json.length > 0) {
        console.log('First row keys:', Object.keys(json[0]));
        console.log('First row data:', json[0]);
    } else {
        console.log('Excel file appears empty.');
    }
} catch (e) {
    console.error('Error reading file:', e);
}
