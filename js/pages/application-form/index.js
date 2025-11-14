/**
 * 労災申請アシストサイト - 申請フォーム メインエントリーポイント
 *
 * このファイルは、モジュール化された申請フォームの初期化を行います。
 * すべてのモジュール（FormState, FormValidator, FormNavigator等）を読み込み、
 * グローバル関数として既存のHTMLから呼び出せるようにします。
 *
 * @file index.js
 * @version 2.0.0
 * @requires FormState.js, FormValidator.js, FormNavigator.js, MedicalInstitutionService.js
 */

import { FormState } from './FormState.js';
import { FormValidator, validationRules } from './FormValidator.js';
import { FormNavigator, STEP_DEFINITIONS } from './FormNavigator.js';
import { MedicalInstitutionService } from './MedicalInstitutionService.js';
import { Logger } from '../../core/Logger.js';
import { EventManager } from '../../core/EventManager.js';
import { DOMCache } from '../../core/DOMCache.js';
import { A11yHelper } from '../../core/A11yHelper.js';

// ==========================================
// グローバルインスタンス
// ==========================================

const logger = new Logger('ApplicationForm');
const eventManager = new EventManager();
const domCache = new DOMCache();

let formState = null;
let formValidator = null;
let formNavigator = null;
let medicalService = null;

// ==========================================
// 後方互換性のためのグローバル変数
// ==========================================

window.currentStep = 1;
window.totalSteps = 9;
window.formData = {};

// ==========================================
// 初期化関数
// ==========================================

/**
 * アプリケーション全体の初期化
 */
async function initializeApplication() {
    try {
        logger.info('アプリケーションの初期化を開始します');

        // モジュールのインスタンス作成
        formState = new FormState(9);
        formValidator = new FormValidator();
        formNavigator = new FormNavigator(formState, formValidator);
        medicalService = new MedicalInstitutionService();

        // 医療機関データを遅延ロード
        await medicalService.loadData();
        logger.info('医療機関データのロード完了');

        // 既存のフォームデータを復元
        loadFormData();

        // UI初期化
        initializeUI();

        // イベントリスナーのセットアップ
        setupEventListeners();

        // プログレスバー初期化
        formNavigator.initializeProgress();

        // 自動保存の開始
        formState.startAutosave();

        // 日付セレクトボックスの初期化
        initializeDateSelects();

        // ファイルアップロードの初期化
        setupFileUpload();

        // 医療機関検索の初期化
        setupMedicalSearchListeners();

        logger.info('アプリケーションの初期化が完了しました');

        // アクセシビリティ機能の初期化
        initializeAccessibility();

    } catch (error) {
        logger.error('アプリケーションの初期化に失敗しました', error);
        alert('申請フォームの初期化に失敗しました。ページを再読み込みしてください。');
    }
}

/**
 * UI要素の初期化
 */
function initializeUI() {
    // 最初のステップを表示
    formNavigator.activateStep(1);

    // 回覧セクションは初期状態では非表示
    formNavigator.hideCirculationSection();

    // モバイルデバイスの場合の特別な処理
    if (isMobileDevice()) {
        logger.debug('モバイルデバイスを検出しました');
        applyMobileOptimizations();
    }
}

/**
 * イベントリスナーのセットアップ
 */
function setupEventListeners() {
    // 「次へ」ボタン
    const nextButtons = document.querySelectorAll('.btn-next');
    nextButtons.forEach(btn => {
        eventManager.on(btn, 'click', () => {
            formNavigator.nextStep();
        });
    });

    // 「前へ」ボタン
    const prevButtons = document.querySelectorAll('.btn-prev');
    prevButtons.forEach(btn => {
        eventManager.on(btn, 'click', () => {
            formNavigator.previousStep();
        });
    });

    // 開発用ボタン
    const devButtons = document.querySelectorAll('.btn-next-dev');
    devButtons.forEach(btn => {
        eventManager.on(btn, 'click', () => {
            formNavigator.nextStepDev();
        });
    });

    // リアルタイムバリデーションのセットアップ
    setupRealtimeValidation();

    // フォーム送信の防止
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        eventManager.on(form, 'submit', (e) => {
            e.preventDefault();
            logger.debug('フォーム送信をキャンセルしました');
        });
    });

    logger.debug('イベントリスナーのセットアップ完了');
}

/**
 * リアルタイムバリデーションのセットアップ
 */
function setupRealtimeValidation() {
    // テキスト入力フィールド
    const textInputs = document.querySelectorAll('.form-input, .form-textarea');
    textInputs.forEach(input => {
        // フォーカス離脱時にバリデーション
        eventManager.on(input, 'blur', () => {
            validateField(input);
        });

        // エラー状態の場合は入力中にも再検証
        eventManager.on(input, 'input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });

    // セレクトボックス
    const selects = document.querySelectorAll('.form-select');
    selects.forEach(select => {
        eventManager.on(select, 'change', () => {
            validateField(select);
        });
    });

    // ラジオボタン
    const radioGroups = {};
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        const name = radio.name;
        if (!radioGroups[name]) {
            radioGroups[name] = [];
        }
        radioGroups[name].push(radio);
    });

    Object.values(radioGroups).forEach(group => {
        group.forEach(radio => {
            eventManager.on(radio, 'change', () => {
                // ラジオボタングループ全体のエラーをクリア
                const errorElement = document.getElementById(`${radio.name}-error`);
                if (errorElement) {
                    errorElement.classList.remove('show');
                }
                group.forEach(r => r.classList.remove('error'));
            });
        });
    });

    logger.debug('リアルタイムバリデーションのセットアップ完了');
}

/**
 * 単一フィールドのバリデーション
 */
function validateField(input) {
    const fieldId = input.id;
    const rule = validationRules[fieldId];

    if (!rule) return; // ルールが定義されていない場合はスキップ

    const isValid = formValidator.validateSingleField(input, rule);

    if (!isValid) {
        logger.debug(`フィールド "${fieldId}" のバリデーションエラー`);
    } else {
        // エラーをクリア
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
        input.classList.remove('error');
    }
}

/**
 * モバイル最適化の適用
 */
function applyMobileOptimizations() {
    // タッチイベントの最適化
    document.body.classList.add('mobile-optimized');

    // 仮想キーボード表示時の自動スクロール
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        eventManager.on(input, 'focus', () => {
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
}

/**
 * アクセシビリティ機能の初期化
 */
function initializeAccessibility() {
    // ライブリージョンの作成
    if (!document.getElementById('aria-live-region')) {
        A11yHelper.announce('申請フォームを読み込みました', 'polite');
    }

    // スキップリンクがあればフォーカストラップをセットアップ
    // (モーダルやダイアログが将来追加された場合に備えて)
    logger.debug('アクセシビリティ機能を初期化しました');
}

// ==========================================
// 既存コードとの互換性のためのグローバル関数
// ==========================================

/**
 * 次のステップへ進む（グローバル関数）
 */
window.nextStep = function() {
    if (formNavigator) {
        formNavigator.nextStep();
    }
};

/**
 * 前のステップへ戻る（グローバル関数）
 */
window.previousStep = function() {
    if (formNavigator) {
        formNavigator.previousStep();
    }
};

/**
 * 開発用: バリデーションをスキップして次へ（グローバル関数）
 */
window.nextStepDev = function() {
    if (formNavigator) {
        formNavigator.nextStepDev();
    }
};

/**
 * 回覧セクションを表示（グローバル関数）
 */
window.showCirculationSection = function() {
    if (formNavigator) {
        formNavigator.showCirculationSection();
    }
};

/**
 * 回覧セクションを非表示（グローバル関数）
 */
window.hideCirculationSection = function() {
    if (formNavigator) {
        formNavigator.hideCirculationSection();
    }
};

/**
 * フォームデータを読み込み（グローバル関数）
 */
window.loadFormData = function() {
    if (!formState) return;

    const savedData = formState.loadFromStorage();
    if (savedData) {
        window.formData = savedData;
        logger.info('保存されたフォームデータを復元しました');

        // フィールドに値を復元
        Object.keys(savedData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = savedData[key];
                } else if (element.type === 'radio') {
                    if (element.value === savedData[key]) {
                        element.checked = true;
                    }
                } else {
                    element.value = savedData[key];
                }
            }
        });

        // ステップ番号を復元
        const savedStep = formState.getCurrentStep();
        if (savedStep && savedStep > 1) {
            window.currentStep = savedStep;
            if (formNavigator) {
                formNavigator.goToStep(savedStep);
            }
        }
    }
};

/**
 * 現在のステップのデータを保存（グローバル関数）
 */
window.saveCurrentStepData = function() {
    if (!formState) return;

    const currentStepElement = document.getElementById(`step-${window.currentStep}`);
    if (!currentStepElement) return;

    const inputs = currentStepElement.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formState.saveField(input.id, input.checked);
        } else if (input.type === 'radio') {
            if (input.checked) {
                formState.saveField(input.name, input.value);
            }
        } else {
            formState.saveField(input.id, input.value);
        }
    });

    formState.setCurrentStep(window.currentStep);
    formState.saveToStorage();
    logger.debug(`ステップ ${window.currentStep} のデータを保存しました`);
};

/**
 * 手動保存（グローバル関数）
 */
window.manualSave = function() {
    window.saveCurrentStepData();
    showToast('データを保存しました', 'success');
};

/**
 * トースト通知を表示（グローバル関数）
 */
window.showToast = function(message, type = 'info') {
    A11yHelper.announce(message, 'polite');

    // トースト要素を作成
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#16A34A' : '#1D4ED8'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
};

/**
 * モバイルデバイス判定（グローバル関数）
 */
window.isMobileDevice = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
};

// ==========================================
// 医療機関検索関連のグローバル関数
// ==========================================

/**
 * 医療機関を検索（グローバル関数）
 */
window.searchMedicalInstitutions = async function(query) {
    if (!medicalService) return [];

    try {
        const results = await medicalService.search(query);
        displayMedicalResults(results);
        return results;
    } catch (error) {
        logger.error('医療機関検索でエラーが発生しました', error);
        return [];
    }
};

/**
 * 医療機関検索結果を表示（グローバル関数）
 */
window.displayMedicalResults = function(results) {
    const resultsDiv = document.getElementById('medical-search-results');
    if (!resultsDiv) return;

    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="search-no-results">該当する医療機関が見つかりませんでした</div>';
        return;
    }

    resultsDiv.innerHTML = results.map(institution => `
        <div class="medical-result-item" onclick="selectMedicalInstitution('${institution.id}')">
            <div class="medical-name">${institution.name}</div>
            <div class="medical-address">${institution.address}</div>
            <div class="medical-info">
                <span class="medical-type">${institution.type}</span>
                <span class="medical-phone">${institution.phone}</span>
            </div>
        </div>
    `).join('');
};

/**
 * 医療機関を選択（グローバル関数）
 */
window.selectMedicalInstitution = async function(institutionId) {
    if (!medicalService) return;

    try {
        const institution = await medicalService.getById(institutionId);
        if (!institution) {
            logger.warn(`医療機関 ID "${institutionId}" が見つかりませんでした`);
            return;
        }

        // フォームフィールドに値をセット
        document.getElementById('hospitalName').value = institution.name;
        document.getElementById('hospitalPostalCode1').value = institution.postalCode.split('-')[0];
        document.getElementById('hospitalPostalCode2').value = institution.postalCode.split('-')[1];
        document.getElementById('hospitalAddress').value = institution.address;
        document.getElementById('hospitalPhone1').value = institution.phone.split('-')[0];
        document.getElementById('hospitalPhone2').value = institution.phone.split('-')[1];
        document.getElementById('hospitalPhone3').value = institution.phone.split('-')[2];

        // 検索結果を非表示
        document.getElementById('medical-search-results').innerHTML = '';

        A11yHelper.announce(`${institution.name}を選択しました`, 'polite');
        logger.info(`医療機関を選択: ${institution.name}`);

    } catch (error) {
        logger.error('医療機関の選択でエラーが発生しました', error);
    }
};

/**
 * 医療機関選択をクリア（グローバル関数）
 */
window.clearMedicalSelection = function() {
    const fields = [
        'hospitalName', 'hospitalPostalCode1', 'hospitalPostalCode2',
        'hospitalAddress', 'hospitalPhone1', 'hospitalPhone2', 'hospitalPhone3'
    ];

    fields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) element.value = '';
    });

    document.getElementById('medical-search-results').innerHTML = '';
    logger.debug('医療機関選択をクリアしました');
};

/**
 * 医療機関検索リスナーのセットアップ（グローバル関数）
 */
window.setupMedicalSearchListeners = function() {
    const searchButton = document.getElementById('search-medical-btn');
    const searchInput = document.getElementById('medical-search-query');
    const clearButton = document.getElementById('clear-medical-btn');

    if (searchButton && searchInput) {
        eventManager.on(searchButton, 'click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.searchMedicalInstitutions(query);
            }
        });

        eventManager.on(searchInput, 'keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    window.searchMedicalInstitutions(query);
                }
            }
        });
    }

    if (clearButton) {
        eventManager.on(clearButton, 'click', () => {
            window.clearMedicalSelection();
        });
    }

    logger.debug('医療機関検索リスナーをセットアップしました');
};

// ==========================================
// ファイルアップロード関連のグローバル関数
// ==========================================

/**
 * ファイルアップロードのセットアップ（グローバル関数）
 */
window.setupFileUpload = function() {
    const fileInputs = document.querySelectorAll('input[type="file"]');

    fileInputs.forEach(input => {
        eventManager.on(input, 'change', (e) => {
            const files = Array.from(e.target.files);
            const listId = input.id.replace('Input', 'List');
            displayFileList(files, listId);
        });
    });

    logger.debug('ファイルアップロードをセットアップしました');
};

/**
 * ファイルリストを表示（グローバル関数）
 */
window.displayFileList = function(files, listId) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    if (files.length === 0) {
        listElement.innerHTML = '<div class="file-item-empty">ファイルが選択されていません</div>';
        return;
    }

    listElement.innerHTML = files.map((file, index) => `
        <div class="file-item">
            <span class="file-icon">📄</span>
            <span class="file-name">${file.name}</span>
            <span class="file-size">(${formatFileSize(file.size)})</span>
            <button type="button" class="btn-remove-file" onclick="removeFile('${listId}', ${index})">削除</button>
        </div>
    `).join('');
};

/**
 * ファイルサイズをフォーマット（グローバル関数）
 */
window.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * ファイルを削除（グローバル関数）
 */
window.removeFile = function(listId, index) {
    const inputId = listId.replace('List', 'Input');
    const input = document.getElementById(inputId);

    if (input && input.files) {
        // FileListは読み取り専用なので、新しいFileListを作成
        const dataTransfer = new DataTransfer();
        Array.from(input.files).forEach((file, i) => {
            if (i !== index) {
                dataTransfer.items.add(file);
            }
        });
        input.files = dataTransfer.files;

        // リストを再表示
        displayFileList(Array.from(input.files), listId);
    }
};

// ==========================================
// 日付セレクトボックス関連のグローバル関数
// ==========================================

/**
 * 日付セレクトボックスを初期化（グローバル関数）
 */
window.initializeDateSelects = function() {
    // 生年月日（1900年～現在）
    populateDateSelects('birthDate', 1900, new Date().getFullYear(), true);

    // 記入日（現在年のみ、降順）
    const currentYear = new Date().getFullYear();
    populateDateSelects('employerFillingDate', currentYear, currentYear, true);
    populateDateSelects('hospitalFillingDate', currentYear, currentYear, true);

    // 療養期間（現在年±5年）
    populateDateSelects('treatmentStartDate', currentYear - 5, currentYear + 5);
    populateDateSelects('treatmentEndDate', currentYear - 5, currentYear + 5);

    logger.debug('日付セレクトボックスを初期化しました');
};

/**
 * 日付セレクトボックスを生成（グローバル関数）
 */
window.populateDateSelects = function(baseId, startYear, endYear, sortDesc = false) {
    const yearSelect = document.getElementById(`${baseId}Year`);
    const monthSelect = document.getElementById(`${baseId}Month`);
    const daySelect = document.getElementById(`${baseId}Day`);

    if (!yearSelect || !monthSelect || !daySelect) return;

    // 年の選択肢を生成
    yearSelect.innerHTML = '<option value="">--</option>';
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
        years.push(year);
    }
    if (sortDesc) years.reverse();

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        yearSelect.appendChild(option);
    });

    // 月の選択肢を生成
    monthSelect.innerHTML = '<option value="">--</option>';
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = `${month}月`;
        monthSelect.appendChild(option);
    }

    // 日の選択肢を生成（初期は31日まで）
    daySelect.innerHTML = '<option value="">--</option>';
    for (let day = 1; day <= 31; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = `${day}日`;
        daySelect.appendChild(option);
    }

    // 年・月が変更されたら日の選択肢を更新
    eventManager.on(yearSelect, 'change', () => updateDayOptions(baseId));
    eventManager.on(monthSelect, 'change', () => updateDayOptions(baseId));
};

/**
 * 日の選択肢を更新（グローバル関数）
 */
window.updateDayOptions = function(baseId) {
    const yearSelect = document.getElementById(`${baseId}Year`);
    const monthSelect = document.getElementById(`${baseId}Month`);
    const daySelect = document.getElementById(`${baseId}Day`);

    if (!yearSelect || !monthSelect || !daySelect) return;

    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);

    if (!year || !month) return;

    const daysInMonth = getDaysInMonth(year, month);
    const currentDay = parseInt(daySelect.value);

    // 日の選択肢を再生成
    daySelect.innerHTML = '<option value="">--</option>';
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = `${day}日`;
        daySelect.appendChild(option);
    }

    // 選択されていた日が有効な場合は復元
    if (currentDay && currentDay <= daysInMonth) {
        daySelect.value = currentDay;
    }
};

/**
 * 指定された年月の日数を取得（グローバル関数）
 */
window.getDaysInMonth = function(year, month) {
    return new Date(year, month, 0).getDate();
};

/**
 * 日付セレクトボックスから値を取得（グローバル関数）
 */
window.getDateValue = function(baseId) {
    const year = document.getElementById(`${baseId}Year`)?.value;
    const month = document.getElementById(`${baseId}Month`)?.value;
    const day = document.getElementById(`${baseId}Day`)?.value;

    if (!year || !month || !day) return null;

    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');

    return `${year}-${paddedMonth}-${paddedDay}`;
};

/**
 * 日付セレクトボックスに値をセット（グローバル関数）
 */
window.setDateValue = function(baseId, dateString) {
    if (!dateString) return;

    const [year, month, day] = dateString.split('-');

    const yearSelect = document.getElementById(`${baseId}Year`);
    const monthSelect = document.getElementById(`${baseId}Month`);
    const daySelect = document.getElementById(`${baseId}Day`);

    if (yearSelect) yearSelect.value = year;
    if (monthSelect) monthSelect.value = parseInt(month);
    if (daySelect) daySelect.value = parseInt(day);
};

// ==========================================
// その他のグローバル関数
// ==========================================

/**
 * ログアウト（グローバル関数）
 */
window.logout = function() {
    if (confirm('ログアウトしますか？\n保存されていないデータは失われます。')) {
        localStorage.removeItem('formData');
        localStorage.removeItem('currentStep');
        window.location.href = 'index.html';
    }
};

/**
 * 事業主モードへ遷移（グローバル関数）
 */
window.goToEmployerMode = function() {
    if (formNavigator) {
        // ステップ6へ移動
        formNavigator.goToStep(6);
    }
};

/**
 * 医療機関モードへ遷移（グローバル関数）
 */
window.goToMedicalMode = function() {
    if (formNavigator) {
        // ステップ7へ移動
        formNavigator.goToStep(7);
    }
};

// ==========================================
// CSS アニメーションの追加
// ==========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==========================================
// ページ読み込み時の初期化
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}

// モジュールのエクスポート（デバッグ用）
export {
    formState,
    formValidator,
    formNavigator,
    medicalService,
    logger,
    eventManager,
    domCache
};
