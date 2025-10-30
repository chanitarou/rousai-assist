/**
 * ログイン画面固有のJavaScript
 */

// QRコードタイマー
let seconds = 272; // 4:32
const timerElement = document.querySelector('.timer-value');

function updateTimer() {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (timerElement) {
        timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (seconds > 0) {
        seconds--;
    } else {
        // QRコード期限切れ処理
        refreshQRCode();
    }
}

function refreshQRCode() {
    // QRコード更新処理
    seconds = 300; // 5分にリセット
    const qrCode = document.querySelector('.qr-code');
    if (qrCode) {
        qrCode.style.opacity = '0.5';
        setTimeout(() => {
            qrCode.style.opacity = '1';
        }, 500);
    }
}

setInterval(updateTimer, 1000);

// QRコードクリックでモック遷移
document.querySelector('.qr-container')?.addEventListener('click', function() {
    alert('デジタル認証アプリでの認証が完了しました。\n手続き一覧画面に遷移します。');
    // 実際の実装では認証完了後に手続き一覧画面へ遷移
    window.location.href = '労災申請アシストサイト_手続き一覧画面.html';
});

// アプリダウンロードボタンのハンドラ
document.querySelectorAll('.app-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const store = this.textContent;
        alert(`${store}のダウンロードページに移動します。\n（モックのため実際には移動しません）`);
    });
});
