/**
 * 共通JavaScript
 * 全ページで使用される共通機能
 */

// ログインメニューの開閉（TOP画面用）
function toggleLoginMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('loginMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// ページ内クリックでメニューを閉じる
document.addEventListener('click', function() {
    const menu = document.getElementById('loginMenu');
    if (menu && menu.classList.contains('active')) {
        menu.classList.remove('active');
    }
});

// ログインハンドラー（TOP画面用）
function handleLogin(userType) {
    event.preventDefault();
    const userTypeMessages = {
        employer: '事業主向けログイン画面',
        consultant: '社会保険労務士向けログイン画面',
        medical: '指定医療機関向けログイン画面'
    };

    alert(`${userTypeMessages[userType]}は現在準備中です。\n被災労働者ログインをご利用ください。`);
}

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ログアウト処理
function logout() {
    if (confirm('ログアウトしますか？')) {
        // LocalStorageをクリア
        localStorage.clear();
        // TOP画面へ遷移
        window.location.href = 'index.html';
    }
}

// ページ読み込み時の初期化処理
document.addEventListener('DOMContentLoaded', function() {
    console.log('共通JSが読み込まれました');
});
