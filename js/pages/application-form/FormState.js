/**
 * フォーム状態管理クラス
 *
 * 申請フォームの状態（現在のステップ、フォームデータ）を管理し、
 * LocalStorageへの自動保存・読み込み機能を提供します。
 *
 * @class FormState
 * @version 1.0.0
 */
export class FormState {
    /**
     * FormStateインスタンスを作成
     * @param {number} totalSteps - 総ステップ数
     */
    constructor(totalSteps = 9) {
        this.currentStep = 1;
        this.totalSteps = totalSteps;
        this.formData = this.loadFromStorage() || {};
        this.autosaveInterval = null;
    }

    /**
     * 現在のステップを取得
     * @returns {number} 現在のステップ番号
     */
    getCurrentStep() {
        return this.currentStep;
    }

    /**
     * 総ステップ数を取得
     * @returns {number} 総ステップ数
     */
    getTotalSteps() {
        return this.totalSteps;
    }

    /**
     * 現在のステップを設定
     * @param {number} step - ステップ番号
     */
    setCurrentStep(step) {
        if (step < 1 || step > this.totalSteps) {
            console.warn(`FormState: 無効なステップ番号 ${step}`);
            return;
        }
        this.currentStep = step;
        this.saveToStorage();
    }

    /**
     * フィールドの値を保存
     * @param {string} fieldName - フィールド名
     * @param {any} value - 値
     */
    saveField(fieldName, value) {
        this.formData[fieldName] = value;
    }

    /**
     * フィールドの値を取得
     * @param {string} fieldName - フィールド名
     * @returns {any} 値
     */
    getField(fieldName) {
        return this.formData[fieldName];
    }

    /**
     * すべてのフォームデータを取得
     * @returns {Object} フォームデータ
     */
    getAllData() {
        return { ...this.formData };
    }

    /**
     * LocalStorageからデータを読み込み
     * @returns {Object|null} 保存されたフォームデータ
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem('formData');
            const step = localStorage.getItem('currentStep');

            if (step) {
                this.currentStep = parseInt(step, 10);
            }

            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('FormState: データの読み込みに失敗しました', error);
            return null;
        }
    }

    /**
     * LocalStorageにデータを保存
     */
    saveToStorage() {
        try {
            localStorage.setItem('formData', JSON.stringify(this.formData));
            localStorage.setItem('currentStep', this.currentStep.toString());
        } catch (error) {
            console.error('FormState: データの保存に失敗しました', error);
        }
    }

    /**
     * 自動保存を開始
     * @param {number} intervalMs - 保存間隔（ミリ秒、デフォルト: 30秒）
     */
    startAutosave(intervalMs = 30000) {
        if (this.autosaveInterval) {
            console.warn('FormState: 自動保存はすでに開始されています');
            return;
        }

        this.autosaveInterval = setInterval(() => {
            this.saveToStorage();
        }, intervalMs);
    }

    /**
     * 自動保存を停止
     */
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
    }

    /**
     * フォームデータをクリア
     */
    clearData() {
        this.formData = {};
        this.currentStep = 1;
        try {
            localStorage.removeItem('formData');
            localStorage.removeItem('currentStep');
        } catch (error) {
            console.error('FormState: データのクリアに失敗しました', error);
        }
    }
}
