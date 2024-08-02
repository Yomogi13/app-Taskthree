// script.js
$(document).ready(function() {
    const data = {
        name: 'タスク一覧',
        children: [
            {
                name: 'プロジェクト1',
                children: [
                    { name: 'タスク1-1' },
                    { name: 'タスク1-2' }
                ]
            },
            {
                name: 'プロジェクト2',
                children: [
                    { name: 'タスク2-1' },
                    {
                        name: 'サブプロジェクト2-1',
                        children: [
                            { name: 'タスク2-1-1' }
                        ]
                    }
                ]
            }
        ]
    };

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

    function checkProjectStatus($project) {
        const $tasks = $project.find('.task-checkbox');
        const allCompleted = $tasks.length && $tasks.toArray().every(task => task.checked);
        const $label = $project.children('label');

        $label.toggleClass('completed', allCompleted);
    }

    const $tree = $('#task-tree');
    $tree.append(buildTree(data));

    // プロジェクトクリック時の表示・非表示制御
    $tree.on('click', '.project > label', function(e) {
        $(this).siblings('ul').toggleClass('hidden');
        e.stopPropagation(); // 親要素へのイベントバブリングを防止
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

        const $newProjectElement = buildTree(newProject);
        $tree.append($newProjectElement);

        $('#form-container').removeClass('active').addClass('hidden');
        $('#project-form')[0].reset(); // フォームのリセット
        $('#tasks-container').html('<label>タスク:</label><input type="text" name="task-name" class="task-name-input" required>'); // タスク入力フィールドを1つに戻す
    });
});
