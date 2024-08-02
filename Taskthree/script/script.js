// script.js
$(document).ready(function() {
    const STORAGE_KEY = 'taskTreeData';

    // ローカルストレージからデータを取得
    function loadFromLocalStorage() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { name: 'タスク一覧', children: [] };
    }

    // ローカルストレージにデータを保存
    function saveToLocalStorage(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

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

    // データをロードしてツリーを構築、ローカルストレージからデータを取得
    const data = loadFromLocalStorage(); 
    $tree.append(buildTree(data));

    // プロジェクトクリック時の表示・非表示制御
    $tree.on('click', '.project > label', function(e) {
        $(this).siblings('ul').toggleClass('hidden');
        // 親要素へのイベントバブリングを防止
        e.stopPropagation(); 
    });

    // チェックボックス押下時のタイトル非活性化
    $tree.on('change', '.task-checkbox', function() {
        $(this).siblings('.task-name').toggleClass('completed', this.checked);
        checkProjectStatus($(this).closest('.project'));
    });

    // 初期表示時にプロジェクトの状態を確認
    $tree.find('.project').each(function() {
        checkProjectStatus($(this));
    });

    // フォームの表示・非表示制御
    $('#add-project-btn').on('click', function() {
        $('#form-container').toggleClass('hidden');
        if ($('#form-container').hasClass('hidden')) {
            $('#form-container').removeClass('active');
        } else {
            $('#form-container').addClass('active');
        }
    });

    // タスク追加ボタン
    $('#add-task-btn').on('click', function() {
        const $taskInput = $('<input type="text" name="task-name" class="task-name-input" required>');
        $('#tasks-container').append($taskInput);
    });

    // フォームの送信処理
    $('#project-form').on('submit', function(e) {
        e.preventDefault();

        const projectName = $('#project-name').val();
        const taskNames = $('.task-name-input').map(function() {
            return $(this).val();
        }).get();

        const newProject = {
            name: projectName,
            children: taskNames.map(name => ({ name: name }))
        };

        // データを更新して保存
        const taskListProject = data.children.find(child => child.name === 'タスク一覧');
        if (taskListProject) {
            // 既存の「タスク一覧」にプロジェクトを追加
            taskListProject.children.push(newProject);
        } else {
            // 追加部分: 「タスク一覧」が存在しない場合は作成して追加
            data.children.push({ name: 'タスク一覧', children: [newProject] });
        }

        // ツリーに新しいプロジェクトを追加
        $tree.empty(); // 追加部分: ツリーを再生成するために一旦クリア
        $tree.append(buildTree(data));

        // 追加部分: ローカルストレージに保存
        saveToLocalStorage(data);

        // フォームをリセットして非表示にする
        $('#form-container').removeClass('active').addClass('hidden');
        $('#project-form')[0].reset();
        $('#tasks-container').html('<label>タスク:</label><input type="text" name="task-name" class="task-name-input" required>');
    });
});
