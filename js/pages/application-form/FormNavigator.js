/**
 * フォームナビゲーションクラス
 *
 * 多段階フォームのステップ管理とナビゲーション機能を提供します。
 * - ステップの進む/戻る
 * - プログレスバーの更新
 * - 回覧セクションの表示/非表示
 * - 開発用ナビゲーション
 *
 * @module FormNavigator
 */

import { Logger } from '../../core/Logger.js';

const logger = new Logger('FormNavigator');

/**
 * ステップ情報の定義
 */
export const STEP_DEFINITIONS = [
    { id: 1, label: '基本情報', role: 'worker' },
    { id: 2, label: '保険番号', role: 'worker' },
    { id: 3, label: '災害情報', role: 'worker' },
    { id: 4, label: '振込先', role: 'worker' },
    { id: 5, label: '添付書類', role: 'worker' },
    { id: 6, label: '事業主情報', role: 'employer' },
    { id: 7, label: '医療機関', role: 'medical' },
    { id: 8, label: '診断証明', role: 'medical' },
    { id: 9, label: '確認・提出', role: 'worker' } // HTMLには存在しないがステップ10として処理
];

/**
 * フォームナビゲータークラス
 */
export class FormNavigator {
    /**
     * @param {Object} formState - FormStateインスタンス
     * @param {Function} validateFn - バリデーション関数
     */
    constructor(formState, validateFn = null) {
        this.formState = formState;
        this.validateFn = validateFn;
        this.totalSteps = 9;
    }

    /**
     * 次のステップへ進む
     * @param {boolean} skipValidation - バリデーションをスキップするか（開発用）
     * @returns {boolean} - 成功時true
     */
    async nextStep(skipValidation = false) {
        const currentStep = this.formState.getCurrentStep();
        logger.debug('nextStep called, currentStep:', currentStep);

        // バリデーション実行
        if (!skipValidation && this.validateFn) {
            const isValid = this.validateFn(currentStep);
            logger.debug('validateCurrentStep returned:', isValid);

            if (!isValid) {
                logger.debug('Validation failed for step-' + currentStep);
                return false;
            }
        }

        // データ保存
        this.formState.saveToStorage();

        // ステップ5の場合は回覧セクションを表示
        if (currentStep === 5) {
            this.showCirculationSection();
            window.scrollTo(0, 0);
            return true;
        }

        // 現在のステップを非アクティブ化
        this.deactivateStep(currentStep);

        // 次のステップへ移動
        const nextStep = this.getNextStep(currentStep);
        this.formState.setCurrentStep(nextStep);

        // 次のステップをアクティブ化
        if (nextStep <= this.totalSteps) {
            this.activateStep(nextStep);
            this.updateProgress();
            window.scrollTo(0, 0);
            return true;
        }

        return false;
    }

    /**
     * 前のステップへ戻る
     * @returns {boolean} - 成功時true
     */
    previousStep() {
        const currentStep = this.formState.getCurrentStep();

        // データ保存
        this.formState.saveToStorage();

        // 現在のステップを非アクティブ化
        this.deactivateStep(currentStep);

        // 前のステップへ移動
        const prevStep = this.getPreviousStep(currentStep);
        this.formState.setCurrentStep(prevStep);

        // 前のステップをアクティブ化
        if (prevStep >= 1) {
            this.activateStep(prevStep);
            this.updateProgress();
            window.scrollTo(0, 0);
            return true;
        }

        return false;
    }

    /**
     * 開発用：バリデーションをスキップして次へ進む
     * @returns {boolean} - 成功時true
     */
    nextStepDev() {
        const currentStep = this.formState.getCurrentStep();

        // 回覧セクションが表示されている場合
        const circulationSection = document.getElementById('circulation-section');
        if (circulationSection && circulationSection.classList.contains('active')) {
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
            return true;
        }

        // ステップ5の場合は回覧セクションを表示
        if (currentStep === 5) {
            this.showCirculationSection();
            window.scrollTo(0, 0);
            return true;
        }

        // ステップ6（事業主情報）の場合は回覧完了画面へ遷移
        if (currentStep === 6) {
            localStorage.setItem('completedBy', 'employer');
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
            return true;
        }

        // ステップ8（診断証明）の場合は回覧完了画面へ遷移
        if (currentStep === 8) {
            localStorage.setItem('completedBy', 'medical');
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
            return true;
        }

        // 通常の次へ進む処理（バリデーションスキップ）
        return this.nextStep(true);
    }

    /**
     * 次のステップ番号を取得
     * @param {number} currentStep - 現在のステップ
     * @returns {number} - 次のステップ番号
     */
    getNextStep(currentStep) {
        let nextStep = currentStep + 1;

        // ステップ9は存在しないため、ステップ8の次はステップ10にスキップ
        if (nextStep === 9) {
            nextStep = 10;
        }

        return nextStep;
    }

    /**
     * 前のステップ番号を取得
     * @param {number} currentStep - 現在のステップ
     * @returns {number} - 前のステップ番号
     */
    getPreviousStep(currentStep) {
        let prevStep = currentStep - 1;

        // ステップ9は存在しないため、ステップ10の前はステップ8にスキップ
        if (prevStep === 9) {
            prevStep = 8;
        }

        return prevStep;
    }

    /**
     * ステップをアクティブ化
     * @param {number} stepNumber - ステップ番号
     */
    activateStep(stepNumber) {
        const stepElement = document.getElementById(`step-${stepNumber}`);
        if (stepElement) {
            stepElement.classList.add('active');
            stepElement.style.display = ''; // インラインスタイルをクリアしてCSSに任せる
            logger.debug(`Added active class to step-${stepNumber}`);
        } else {
            logger.error(`Step element not found: step-${stepNumber}`);
        }
    }

    /**
     * ステップを非アクティブ化
     * @param {number} stepNumber - ステップ番号
     */
    deactivateStep(stepNumber) {
        const stepElement = document.getElementById(`step-${stepNumber}`);
        if (stepElement) {
            stepElement.classList.remove('active');
            logger.debug(`Removed active class from step-${stepNumber}`);
        } else {
            logger.error(`Step element not found: step-${stepNumber}`);
        }
    }

    /**
     * プログレスバーを更新
     */
    updateProgress() {
        const currentStep = this.formState.getCurrentStep();
        const progressStep = this.getProgressStep(currentStep);

        // プログレスバー更新
        const progressBar = document.querySelector('.progress-bar-fill');
        if (progressBar) {
            const percentage = (progressStep / this.totalSteps) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        // ステップテキスト更新
        const currentStepText = document.getElementById('current-step');
        if (currentStepText) {
            currentStepText.textContent = progressStep;
        }

        // プログレスアイテムの更新
        this.updateProgressItems(progressStep);

        logger.debug(`Progress updated: step ${progressStep}/${this.totalSteps}`);
    }

    /**
     * HTMLステップ番号から進捗ステップ番号を取得
     * @param {number} htmlStep - HTMLのステップ番号（1-10）
     * @returns {number} - 進捗バーのステップ番号（1-9）
     */
    getProgressStep(htmlStep) {
        // ステップ10（確認・提出）は進捗バーのステップ9として表示
        if (htmlStep === 10) return 9;
        return htmlStep;
    }

    /**
     * プログレスアイテムの状態を更新
     * @param {number} currentProgressStep - 現在の進捗ステップ
     */
    updateProgressItems(currentProgressStep) {
        const progressItems = document.querySelectorAll('.progress-item');
        progressItems.forEach((item, index) => {
            const stepNum = index + 1;
            if (stepNum < currentProgressStep) {
                item.classList.add('completed');
                item.classList.remove('active');
            } else if (stepNum === currentProgressStep) {
                item.classList.add('active');
                item.classList.remove('completed');
            } else {
                item.classList.remove('completed', 'active');
            }
        });
    }

    /**
     * 回覧セクションを表示
     */
    showCirculationSection() {
        const circulationSection = document.getElementById('circulation-section');
        if (circulationSection) {
            circulationSection.classList.add('active');
            logger.debug('Circulation section shown');

            // 回覧依頼のバリデーションをセットアップ
            this.setupCirculationValidation();
        }
    }

    /**
     * 回覧セクションを非表示
     */
    hideCirculationSection() {
        const circulationSection = document.getElementById('circulation-section');
        if (circulationSection) {
            circulationSection.classList.remove('active');
            logger.debug('Circulation section hidden');
        }
    }

    /**
     * 回覧依頼のバリデーションをセットアップ
     */
    setupCirculationValidation() {
        // メールアドレスフィールドのバリデーション
        const emailFields = ['employerEmail'];
        emailFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && this.validateFn) {
                field.addEventListener('blur', () => {
                    // メールアドレス形式のチェック
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(field.value)) {
                        field.classList.add('error');
                        const errorElement = document.getElementById(`${fieldId}-error`);
                        if (errorElement) {
                            errorElement.textContent = '【事業主メールアドレス】を正しい形式で入力してください。';
                            errorElement.classList.add('show');
                        }
                    } else {
                        field.classList.remove('error');
                        const errorElement = document.getElementById(`${fieldId}-error`);
                        if (errorElement) {
                            errorElement.classList.remove('show');
                        }
                    }
                });
            }
        });
    }

    /**
     * プログレスバーを初期化
     */
    initializeProgress() {
        const currentStep = this.formState.getCurrentStep();
        const progressItems = document.querySelectorAll('.progress-item');

        // HTMLの進捗アイテムは9個（ステップ1-8、ステップ10）
        // data-step属性に基づいて各アイテムを更新
        progressItems.forEach((item) => {
            const dataStep = parseInt(item.getAttribute('data-step'));
            if (dataStep === currentStep) {
                item.classList.add('active');
            } else if (dataStep < currentStep) {
                item.classList.add('completed');
            }
        });

        // 進捗バーの幅を更新
        this.updateProgress();

        logger.debug('Progress initialized for step:', currentStep);
    }

    /**
     * 特定のステップへ直接移動（デバッグ用）
     * @param {number} targetStep - 移動先のステップ番号
     */
    goToStep(targetStep) {
        if (targetStep < 1 || targetStep > this.totalSteps) {
            logger.error(`Invalid step number: ${targetStep}`);
            return false;
        }

        const currentStep = this.formState.getCurrentStep();
        this.deactivateStep(currentStep);
        this.formState.setCurrentStep(targetStep);
        this.activateStep(targetStep);
        this.updateProgress();
        window.scrollTo(0, 0);

        logger.debug(`Moved to step ${targetStep}`);
        return true;
    }
}
