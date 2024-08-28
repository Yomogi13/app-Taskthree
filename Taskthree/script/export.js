import xlsx from 'xlsx-js-style';

const exportToExcel = () => {
    const table = document.getElementById('project-task-table');
    if (!table) {
        console.error('Table not found!');
        return;
    }

    const workbook = xlsx.utils.table_to_book(table);

    // すべてのワークシートに適用
    for (const sheet of Object.values(workbook.Sheets)) {
        for (const rangeName in sheet) {
            if (rangeName.indexOf('!') === 0) {
                continue;
            }

            const s = sheet[rangeName]?.s || {};
            s.alignment = { vertical: 'top' };
            s.font = { name: 'Yu Gothic medium', sz: 12, color: { rgb: '223344' } };

            sheet[rangeName] = {
                ...sheet[rangeName],
                s,
            };
        }
    }

    xlsx.writeFile(workbook, `Project_Tasks.xlsx`);
};

// ボタンなどでエクスポートをトリガー
document.getElementById('export-btn').addEventListener('click', exportToExcel);
