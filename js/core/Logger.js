/**
 * ロガークラス - 環境別のログレベル制御
 *
 * 本番環境ではエラーのみをログに記録し、開発環境では詳細なデバッグ情報を出力します。
 *
 * @class Logger
 * @version 1.0.0
 */
export class Logger {
    /**
     * ロガーインスタンスを作成
     * @param {string} context - ログのコンテキスト名（例: 'FormValidator', 'App'）
     */
    constructor(context = 'App') {
        this.context = context;
        this.level = this.getLogLevel();
    }

    /**
     * 環境に基づいてログレベルを決定
     * @returns {string} ログレベル ('DEBUG' または 'ERROR')
     */
    getLogLevel() {
        // 本番環境では ERROR のみ、開発環境では DEBUG
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
            return 'DEBUG';
        }
        return 'ERROR';
    }

    /**
     * デバッグレベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {...any} args - 追加の引数
     */
    debug(message, ...args) {
        if (this.level === 'DEBUG') {
            console.log(`[${this.context}] DEBUG:`, message, ...args);
        }
    }

    /**
     * 情報レベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {...any} args - 追加の引数
     */
    info(message, ...args) {
        if (this.level === 'DEBUG' || this.level === 'INFO') {
            console.info(`[${this.context}] INFO:`, message, ...args);
        }
    }

    /**
     * 警告レベルのログを出力
     * @param {string} message - ログメッセージ
     * @param {...any} args - 追加の引数
     */
    warn(message, ...args) {
        if (this.level !== 'ERROR') {
            console.warn(`[${this.context}] WARN:`, message, ...args);
        }
    }

    /**
     * エラーレベルのログを出力
     * @param {string} message - エラーメッセージ
     * @param {Error} [error] - エラーオブジェクト
     */
    error(message, error) {
        console.error(`[${this.context}] ERROR:`, message, error);

        // 本番環境ではエラー報告サービスに送信（将来実装）
        if (this.level === 'ERROR') {
            this.reportError(message, error);
        }
    }

    /**
     * エラー報告サービスへの送信
     * @param {string} message - エラーメッセージ
     * @param {Error} [error] - エラーオブジェクト
     */
    reportError(message, error) {
        // TODO: エラー報告サービス（Sentry等）への送信実装
        // 現時点では何もしない
    }
}

/**
 * ユーザーフレンドリーなエラーメッセージ変換ヘルパー
 *
 * @class ErrorMessageHelper
 */
export class ErrorMessageHelper {
    /**
     * エラーコードから日本語のユーザー向けメッセージを取得
     * @param {string} errorCode - エラーコード
     * @returns {string} ユーザー向けエラーメッセージ
     */
    static getUserMessage(errorCode) {
        const messages = {
            'VALIDATION_REQUIRED': '必須項目が入力されていません。',
            'VALIDATION_FORMAT': '入力形式が正しくありません。',
            'VALIDATION_KATAKANA': '全角カタカナで入力してください。',
            'VALIDATION_POSTAL_CODE': '郵便番号の形式が正しくありません。（例：123-4567）',
            'VALIDATION_PHONE': '電話番号の形式が正しくありません。',
            'VALIDATION_DATE': '日付の形式が正しくありません。',
            'NETWORK_ERROR': '通信エラーが発生しました。インターネット接続を確認してください。',
            'STORAGE_ERROR': 'データの保存に失敗しました。ブラウザのストレージ設定を確認してください。',
            'UNKNOWN_ERROR': '予期しないエラーが発生しました。お手数ですが、時間をおいて再度お試しください。'
        };

        return messages[errorCode] || messages['UNKNOWN_ERROR'];
    }
}
