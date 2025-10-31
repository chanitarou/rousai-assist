/**
 * 手続き一覧画面固有のJavaScript
 */

// モバイル判定
function isMobile() {
    return window.innerWidth <= 768;
}

// カード展開/折りたたみ機能（モバイルのみ）
document.querySelectorAll('.procedure-card').forEach(card => {
    const header = card.querySelector('.procedure-header');

    if (header) {
        header.addEventListener('click', function(e) {
            // モバイルでのみ展開機能を有効化
            if (isMobile()) {
                // ボタンクリックの場合は展開処理をスキップ
                if (!e.target.closest('.btn-start')) {
                    e.preventDefault();
                    e.stopPropagation();

                    // 展開状態をトグル
                    card.classList.toggle('expanded');
                }
            }
        });
    }
});

// フィルタータグのクリック処理
document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', function() {
        // 現在のアクティブタグを解除
        document.querySelectorAll('.filter-tag').forEach(t => {
            t.classList.remove('active');
        });
        // クリックされたタグをアクティブに
        this.classList.add('active');

        // フィルター処理（デモ用）
        const filterType = this.textContent;
        const cards = document.querySelectorAll('.procedure-card');

        cards.forEach(card => {
            if (filterType === 'すべて') {
                card.style.display = 'block';
            } else if (filterType === '業務災害') {
                card.style.display = card.querySelector('.procedure-type.accident') ? 'block' : 'none';
            } else if (filterType === '通勤災害') {
                card.style.display = card.querySelector('.procedure-type.commute') ? 'block' : 'none';
            } else if (filterType === '継続申請') {
                card.style.display = 'block'; // 両方とも継続申請なので表示
            }
        });
    });
});

// 申請開始ボタンのクリック処理
document.querySelectorAll('.btn-start').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation(); // カード展開処理への伝播を防ぐ

        const card = this.closest('.procedure-card');
        // 16号の6の場合は遷移しない
        if (card && card.id === 'procedure-16-6') {
            return false;
        }
        // 親要素のリンク先に遷移
        if (card && card.href) {
            window.location.href = card.href;
        }
    });
});

// 16号の6カード全体のクリックを無効化
const procedure166 = document.getElementById('procedure-16-6');
if (procedure166) {
    procedure166.addEventListener('click', function(e) {
        e.preventDefault();
        return false;
    });
}

// ログアウトボタン
document.querySelector('.btn-logout')?.addEventListener('click', function() {
    if (confirm('ログアウトしてもよろしいですか？')) {
        window.location.href = 'index.html';
    }
});

// ウィンドウリサイズ時に展開状態をリセット（デスクトップに戻った時）
window.addEventListener('resize', function() {
    if (!isMobile()) {
        document.querySelectorAll('.procedure-card').forEach(card => {
            card.classList.remove('expanded');
        });
    }
});
