/**
 * アクセシビリティヘルパー - WCAG準拠のアクセシビリティ機能
 *
 * スクリーンリーダー対応、キーボードナビゲーション、フォーカス管理などを提供します。
 *
 * @class A11yHelper
 * @version 1.0.0
 */
export class A11yHelper {
    /**
     * フォーカストラップを設定（モーダルダイアログ用）
     *
     * モーダル内でTabキーを押したとき、フォーカスがモーダル外に移動しないようにします。
     *
     * @param {HTMLElement} containerElement - フォーカスをトラップするコンテナ要素
     * @returns {Function} トラップを解除する関数
     */
    static setupFocusTrap(containerElement) {
        const focusableElements = containerElement.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), ' +
            'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
            console.warn('A11yHelper: フォーカス可能な要素が見つかりません');
            return () => {};
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift+Tab: 最初の要素から前に戻ろうとしたら最後の要素へ
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                // Tab: 最後の要素から次に進もうとしたら最初の要素へ
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        containerElement.addEventListener('keydown', handleKeyDown);

        // フォーカスを最初の要素に移動
        firstElement.focus();

        // トラップを解除する関数を返す
        return () => {
            containerElement.removeEventListener('keydown', handleKeyDown);
        };
    }

    /**
     * ライブリージョンで動的コンテンツをスクリーンリーダーに通知
     *
     * @param {string} message - 通知メッセージ
     * @param {string} politeness - 通知の緊急度（'polite' | 'assertive'）
     */
    static announce(message, politeness = 'polite') {
        const liveRegion = document.getElementById('aria-live-region') ||
            this.createLiveRegion(politeness);

        liveRegion.textContent = message;

        // 通知後にクリア（1秒後）
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }

    /**
     * ライブリージョン要素を作成
     *
     * @param {string} politeness - 通知の緊急度
     * @returns {HTMLElement} ライブリージョン要素
     */
    static createLiveRegion(politeness) {
        const region = document.createElement('div');
        region.id = 'aria-live-region';
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only'; // スクリーンリーダー専用（視覚的に非表示）
        document.body.appendChild(region);
        return region;
    }

    /**
     * 要素にフォーカスを移動し、スクロールして表示
     *
     * @param {HTMLElement} element - フォーカスする要素
     * @param {Object} options - スクロールオプション
     */
    static focusElement(element, options = { behavior: 'smooth', block: 'center' }) {
        if (!element) {
            console.warn('A11yHelper: フォーカスする要素が見つかりません');
            return;
        }

        element.focus();
        element.scrollIntoView(options);
    }

    /**
     * エラーフィールドに適切なARIA属性を設定
     *
     * @param {HTMLElement} inputElement - 入力要素
     * @param {string} errorMessage - エラーメッセージ
     * @param {HTMLElement} errorElement - エラーメッセージ表示要素
     */
    static setErrorState(inputElement, errorMessage, errorElement) {
        if (!inputElement) return;

        inputElement.setAttribute('aria-invalid', 'true');

        if (errorElement) {
            const errorId = errorElement.id || `${inputElement.id}-error`;
            errorElement.id = errorId;
            inputElement.setAttribute('aria-describedby', errorId);
        }
    }

    /**
     * エラー状態をクリア
     *
     * @param {HTMLElement} inputElement - 入力要素
     */
    static clearErrorState(inputElement) {
        if (!inputElement) return;

        inputElement.removeAttribute('aria-invalid');
        inputElement.removeAttribute('aria-describedby');
    }

    /**
     * ボタンのロード中状態を設定
     *
     * @param {HTMLButtonElement} button - ボタン要素
     * @param {boolean} isLoading - ロード中かどうか
     * @param {string} loadingText - ロード中のテキスト（デフォルト: '処理中...'）
     */
    static setButtonLoadingState(button, isLoading, loadingText = '処理中...') {
        if (!button) return;

        if (isLoading) {
            button.setAttribute('aria-busy', 'true');
            button.disabled = true;
            button.dataset.originalText = button.textContent;
            button.textContent = loadingText;
        } else {
            button.removeAttribute('aria-busy');
            button.disabled = false;
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }
}
