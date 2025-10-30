/**
 * 手続き一覧画面固有のJavaScript
 */

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
        window.location.href = '労災申請アシストサイト_TOP画面.html';
    }
});
