/**
 * イベントマネージャー - イベントリスナーの一元管理
 *
 * イベントリスナーの重複登録を防ぎ、適切にクリーンアップを行います。
 *
 * @class EventManager
 * @version 1.0.0
 */
export class EventManager {
    constructor() {
        /**
         * @type {Map<string, {element: HTMLElement, event: string, handler: Function}>}
         */
        this.listeners = new Map();
    }

    /**
     * イベントリスナーを登録
     * @param {HTMLElement} element - 対象要素
     * @param {string} event - イベント名（例: 'click', 'input', 'blur'）
     * @param {Function} handler - イベントハンドラー
     * @param {Object} options - addEventListener のオプション
     */
    on(element, event, handler, options = {}) {
        if (!element || !element.id) {
            console.warn('EventManager: 要素にIDが設定されていません。IDを設定することを推奨します。');
            return;
        }

        const key = `${element.id}-${event}`;

        // 既存のリスナーを削除してから追加（重複防止）
        if (this.listeners.has(key)) {
            this.off(element, event);
        }

        element.addEventListener(event, handler, options);
        this.listeners.set(key, { element, event, handler });
    }

    /**
     * イベントリスナーを解除
     * @param {HTMLElement} element - 対象要素
     * @param {string} event - イベント名
     */
    off(element, event) {
        if (!element || !element.id) {
            return;
        }

        const key = `${element.id}-${event}`;
        const listener = this.listeners.get(key);

        if (listener) {
            listener.element.removeEventListener(listener.event, listener.handler);
            this.listeners.delete(key);
        }
    }

    /**
     * すべてのイベントリスナーをクリーンアップ
     */
    cleanup() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners.clear();
    }

    /**
     * 現在登録されているリスナーの数を取得
     * @returns {number} リスナー数
     */
    getListenerCount() {
        return this.listeners.size;
    }
}
