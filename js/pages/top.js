/**
 * TOP画面固有のJavaScript
 */

// フローティングボタンのパルスアニメーション制御
const floatingBtn = document.getElementById('floatingChatBtn');
if (floatingBtn) {
    let pulseTimeout;

    // 5秒後にパルスアニメーションを停止
    pulseTimeout = setTimeout(() => {
        floatingBtn.classList.remove('pulse');
    }, 5000);

    // スクロール時にパルスを再開（初回のみ）
    let hasScrolledOnce = false;
    window.addEventListener('scroll', () => {
        if (!hasScrolledOnce && window.scrollY > 100) {
            hasScrolledOnce = true;
            floatingBtn.classList.add('pulse');
            setTimeout(() => {
                floatingBtn.classList.remove('pulse');
            }, 3000);
        }
    });

    // ホバー時にパルスを停止
    floatingBtn.addEventListener('mouseenter', () => {
        floatingBtn.classList.remove('pulse');
    });
}
