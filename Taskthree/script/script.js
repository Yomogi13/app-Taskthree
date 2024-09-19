$(document).ready(function () {
    console.log(typeof XLSX); // 'object' が期待される結果

    // dataを初期化
    const data = { name: 'プロジェクト一覧', children: [] };

    const STORAGE_KEY = 'taskTreeData';

    // タスクツリーを構築
    function buildTree(data) {
        const $li = $('<li>');
        if (data.children) {
            const $label = $('<label>').text(data.name);
            $li.append($label);
            const $ul = $('<ul class="hidden">');
            data.children.forEach(child => {
                $ul.append(buildTree(child));
            });
            $li.append($ul);
            $li.addClass('project');
        } else {
            const $checkbox = $('<input type="checkbox" class="task-checkbox">');
            const $taskName = $('<span class="task-name">').text(data.name);
            $li.append($checkbox).append($taskName);
            $li.addClass('task');
        }
        return $li;
    }

    // プロジェクトの状態をチェック
    function checkProjectStatus($project) {
        const $tasks = $project.find('.task-checkbox');
        const allCompleted = $tasks.length && $tasks.toArray().every(task => task.checked);
        const $label = $project.children('label');

        $label.toggleClass('completed', allCompleted);
    }

    const $tree = $('#task-tree');

    // プロジェクトクリック時の表示・非表示制御
    $tree.on('click', '.project > label', function (e) {
        $(this).siblings('ul').toggleClass('hidden');
        e.stopPropagation();
    });

    // チェックボックス押下時のタイトル非活性化
    $tree.on('change', '.task-checkbox', function () {
        $(this).siblings('.task-name').toggleClass('completed', this.checked);
        checkProjectStatus($(this).closest('.project'));
        updateTable(); // テーブル更新
    });

    // テーブルタグへのデータ反映
    function updateTable() {
        const $tableBody = $('#task-table tbody');
        $tableBody.empty(); // テーブルの内容をクリア

        function addRowToTable(node, indent = 0) {
            const $row = $('<tr>');
            const $cell = $('<td>').text(' '.repeat(indent * 2) + node.name);
            $row.append($cell);
            $tableBody.append($row);

            if (node.children) {
                node.children.forEach(child => addRowToTable(child, indent + 1));
            }
        }

        addRowToTable(data);

        // テーブルが更新された後に、Excelファイルの出力を準備
        prepareExcelExport();
    }

    // 初期表示時にテーブルを更新
    updateTable();

    // フォームの表示・非表示制御
    $('#add-project-btn').on('click', function () {
        console.log('プロジェクト追加ボタンがクリックされました');
        $('#form-container').toggleClass('hidden');
        if ($('#form-container').hasClass('hidden')) {
            $('#form-container').removeClass('active');
        } else {
            $('#form-container').addClass('active');
        }
    });

    // タスク追加ボタン
    $('#add-task-btn').on('click', function () {
        const $taskInput = $('<input type="text" name="task-name" class="task-name-input" required>');
        $('#tasks-container').append($taskInput);
    });

    // フォームの送信処理
    $('#project-form').on('submit', function (e) {
        e.preventDefault();

        const projectName = $('#project-name').val();
        const taskNames = $('.task-name-input').map(function () {
            return $(this).val();
        }).get();

        const newProject = {
            name: projectName,
            children: taskNames.map(name => ({ name: name }))
        };

        const taskListProject = data.children.find(child => child.name === 'タスク一覧');
        if (taskListProject) {
            taskListProject.children.push(newProject);
        } else {
            data.children.push({ name: 'タスク一覧', children: [newProject] });
        }

        $tree.empty(); // ツリーを再生成するために一旦クリア
        $tree.append(buildTree(data));
        updateTable(); // テーブルを更新

        $('#form-container').removeClass('active').addClass('hidden');
        $('#project-form')[0].reset();
        $('#tasks-container').html('<label>タスク:</label><input type="text" name="task-name" class="task-name-input" required>');
    });

   // Excel出力の準備
function prepareExcelExport() {
    const table = document.getElementById('task-table'); // テーブルのIDを指定
    const workbook = XLSX.utils.table_to_book(table); // xlsx -> XLSX へ変更

    for (const sheet of Object.values(workbook.Sheets)) {
        for (const rangeName in sheet) {
            if (rangeName.indexOf('!') === 0) continue;
            const s = sheet[rangeName]?.s || {};
            s.alignment = { vertical: 'top' };
            s.font = { name: 'Yu Gothic medium', sz: 12, color: { rgb: '223344' } };
            sheet[rangeName] = { ...sheet[rangeName], s };
        }
    }

    // ファイル出力処理を実行
    XLSX.writeFile(workbook, 'タスク一覧.xlsx'); // xlsx -> XLSX へ変更
        
    }
});
