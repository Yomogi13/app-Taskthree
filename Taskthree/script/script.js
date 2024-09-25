$(document).ready(function () {

    // テスト用のダミーデータ
    const data = {
        name: 'プロジェクトA',
        children: [
            { name: 'タスク1' },
            { name: 'タスク2', children: [{ name: 'サブタスク1' }] },
            { name: 'タスク3' }
        ]
    };

    function updateTable() {
        const $tableContainer = $('#table-container');
        console.log('debug1');

        // table-container の確認
        if ($tableContainer.length === 0) {
            console.error('#table-container is not found');
            return; // ここで処理を中断
        }

        // テーブルが初めて作成されるときのみヘッダーを作成
        if ($tableContainer.find('table').length === 0) {
            console.log('debug2 - Table not found, creating a new table');
            const $table = $('<table id="task-table">');
            const $thead = $('<thead>').append('<tr><th>タスク名</th></tr>');
            $table.append($thead).append('<tbody></tbody>'); // 空の tbody を作成
            $tableContainer.append($table); // テーブルをコンテナに追加
        }

        const $tbody = $tableContainer.find('tbody');
        if ($tbody.length === 0) {
            console.log('tbody not found, creating new tbody');
            const $newTbody = $('<tbody></tbody>');
            $tableContainer.find('table').append($newTbody); // テーブルが存在すればそこに追加
        } else {
            console.log('debug3 - tbody found');
            $tbody.empty(); // tbody が見つかった場合のみクリア
        }

        console.log('debug4 - Starting to add rows to the table');

        function addRowToTable(node, indent = 0) {
            console.log('Adding row for node:', node); // ノードの内容を表示
            const $row = $('<tr>');
            const $cell = $('<td>').text(' '.repeat(indent * 2) + node.name);
            $row.append($cell);
            $tbody.append($row);

            if (node.children && node.children.length > 0) {
                console.log('Node has children:', node.children); // 子ノードがある場合に表示
                node.children.forEach(child => addRowToTable(child, indent + 1));
            } else {
                console.log('No children found for node:', node.name); // 子ノードがない場合の表示
            }
        }

        console.log('Data:', JSON.stringify(data, null, 2));

        if (!data) {
            console.error('Data object is missing or empty:', data);
        } else {
            console.log('Before adding rows');
            addRowToTable(data);
            console.log('After adding rows');
        }
    }

    // 初期表示時にテーブルを更新
    updateTable();
});
