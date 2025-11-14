/**
 * DOMキャッシュクラス - DOM検索結果のキャッシュ化
 *
 * 繰り返しのDOM検索を削減し、パフォーマンスを向上させます。
 *
 * @class DOMCache
 * @version 1.0.0
 */
export class DOMCache {
    /**
     * DOMキャッシュインスタンスを作成
     * @param {HTMLElement|Document} scope - 検索範囲（デフォルト: document）
     */
    constructor(scope = document) {
        this.scope = scope;
        /**
         * @type {Map<string, HTMLElement|HTMLElement[]>}
         */
        this.cache = new Map();
    }

    /**
     * 単一要素を取得（querySelector）
     * @param {string} selector - CSSセレクター
     * @returns {HTMLElement|null} 要素
     */
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, this.scope.querySelector(selector));
        }
        return this.cache.get(selector);
    }

    /**
     * 複数要素を取得（querySelectorAll）
     * @param {string} selector - CSSセレクター
     * @returns {HTMLElement[]} 要素の配列
     */
    getAll(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(
                selector,
                Array.from(this.scope.querySelectorAll(selector))
            );
        }
        return this.cache.get(selector);
    }

    /**
     * IDで要素を取得
     * @param {string} id - 要素のID
     * @returns {HTMLElement|null} 要素
     */
    getById(id) {
        const selector = `#${id}`;
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.getElementById(id));
        }
        return this.cache.get(selector);
    }

    /**
     * キャッシュをクリア
     */
    clear() {
        this.cache.clear();
    }

    /**
     * 特定のセレクターのキャッシュを削除
     * @param {string} selector - CSSセレクター
     */
    remove(selector) {
        this.cache.delete(selector);
    }

    /**
     * キャッシュサイズを取得
     * @returns {number} キャッシュされている要素の数
     */
    getSize() {
        return this.cache.size;
    }
}
