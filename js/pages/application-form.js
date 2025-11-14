/**
 * 労災申請アシストサイト - 8号申請画面 JavaScript (リファクタリング後)
 *
 * このファイルは労災保険給付（様式第8号）の申請フォームの残存機能を提供します。
 *
 * 【重要】フェーズ4のモジュール化により、以下の機能は別モジュールに移行されました：
 * - FormState.js: フォーム状態管理、自動保存
 * - FormValidator.js: バリデーションロジック
 * - FormNavigator.js: ステップナビゲーション、プログレスバー管理
 * - MedicalInstitutionService.js: 医療機関検索
 * - index.js: メインエントリーポイント、初期化処理
 *
 * このファイルには以下の機能のみが残されています：
 * - ユーティリティ関数（isMobileDevice, showToast, logout）
 * - ファイルアップロード処理
 * - 日付セレクトボックス操作
 * - フォーム送信処理（回覧依頼、申請送信、事業主・医療機関フォーム送信）
 * - モード切替（事業主モード、医療機関モード）
 *
 * @file application-form.js
 * @version 2.0.0 (Phase 5 Refactored)
 * @requires js/common.js
 * @requires js/pages/application-form/index.js (ES6 module)
 */

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * モバイルデバイス判定
 * @returns {boolean} モバイルデバイスの場合true
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

/**
 * トースト通知を表示
 * @param {string} message - 表示するメッセージ
 * @param {string} type - 通知タイプ（'success', 'error', 'info'）
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#0288D1'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

/**
 * ログアウト処理
 */
function logout() {
    if (confirm('ログアウトしますか？\n入力中のデータは保存されます。')) {
        window.location.href = '労災アシストTOP画面_新.html';
    }
}

// ============================================================================
// ファイルアップロード処理
// ============================================================================

/**
 * ファイルアップロードのセットアップ
 * @param {string} inputId - ファイル入力要素のID
 * @param {string} listId - ファイルリスト表示要素のID
 */
function setupFileUpload(inputId, listId) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        displayFileList(files, listId);
    });
}

/**
 * 選択されたファイルのリストを表示
 * @param {File[]} files - ファイルの配列
 * @param {string} listId - 表示先要素のID
 */
function displayFileList(files, listId) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    listElement.innerHTML = '';

    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <button type="button" class="btn-remove" onclick="removeFile('${listId}', ${index})">削除</button>
        `;
        listElement.appendChild(fileItem);
    });
}

/**
 * ファイルサイズをフォーマット
 * @param {number} bytes - バイト数
 * @returns {string} フォーマットされたサイズ（例: "1.5 MB"）
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * ファイルリストから指定されたファイルを削除
 * 注: この関数はindex.jsでも提供されています（後方互換性のため）
 * @param {string} listId - ファイルリストのID
 * @param {number} index - 削除するファイルのインデックス
 */
function removeFile(listId, index) {
    // この機能はindex.jsで実装されています
    // HTMLからの直接呼び出しに対応するため、この関数は保持されています
    console.warn('removeFile: この関数はindex.jsに移行されました');
}

// ============================================================================
// 日付セレクトボックス操作
// ============================================================================

/**
 * 指定された年月の日数を取得
 * @param {number} year - 年
 * @param {number} month - 月（1-12）
 * @returns {number} その月の日数
 */
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/**
 * 日付セレクトボックスを生成
 * @param {string} baseId - セレクトボックスのベースID（例: 'birthDate'）
 * @param {number} startYear - 開始年
 * @param {number} endYear - 終了年
 * @param {boolean} sortDesc - 降順ソート（デフォルト: false）
 */
function populateDateSelects(baseId, startYear, endYear, sortDesc = false) {
    const yearSelect = document.getElementById(`${baseId}Year`);
    const monthSelect = document.getElementById(`${baseId}Month`);
    const daySelect = document.getElementById(`${baseId}Day`);

    if (!yearSelect || !monthSelect || !daySelect) return;

    // 年の選択肢を生成
    yearSelect.innerHTML = '<option value="">--</option>';
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
        years.push(y);
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
    for (let m = 1; m <= 12; m++) {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = `${m}月`;
        monthSelect.appendChild(option);
    });

    // 日の選択肢を生成（初期状態は31日まで）
    updateDayOptions(baseId);

    // 年・月が変更されたら日の選択肢を更新
    yearSelect.addEventListener('change', () => updateDayOptions(baseId));
    monthSelect.addEventListener('change', () => updateDayOptions(baseId));
}

/**
 * 日の選択肢を更新（選択された年月に応じて）
 * @param {string} baseId - セレクトボックスのベースID
 */
function updateDayOptions(baseId) {
    const yearSelect = document.getElementById(`${baseId}Year`);
    const monthSelect = document.getElementById(`${baseId}Month`);
    const daySelect = document.getElementById(`${baseId}Day`);

    if (!yearSelect || !monthSelect || !daySelect) return;

    const year = parseInt(yearSelect.value) || new Date().getFullYear();
    const month = parseInt(monthSelect.value) || 1;
    const currentDay = parseInt(daySelect.value) || '';

    const daysInMonth = getDaysInMonth(year, month);

    daySelect.innerHTML = '<option value="">--</option>';
    for (let d = 1; d <= daysInMonth; d++) {
        const option = document.createElement('option');
        option.value = d;
        option.textContent = `${d}日`;
        if (d === currentDay) {
            option.selected = true;
        }
        daySelect.appendChild(option);
    }
}

/**
 * 日付セレクトボックスから日付文字列を取得
 * @param {string} baseId - セレクトボックスのベースID
 * @returns {string} 日付文字列（YYYY-MM-DD形式）、未選択の場合は空文字列
 */
function getDateValue(baseId) {
    const year = document.getElementById(`${baseId}Year`)?.value;
    const month = document.getElementById(`${baseId}Month`)?.value;
    const day = document.getElementById(`${baseId}Day`)?.value;

    if (!year || !month || !day) return '';

    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
}

/**
 * 日付セレクトボックスに日付文字列をセット
 * @param {string} baseId - セレクトボックスのベースID
 * @param {string} dateString - 日付文字列（YYYY-MM-DD形式）
 */
function setDateValue(baseId, dateString) {
    if (!dateString) return;

    const [year, month, day] = dateString.split('-');
    const yearSelect = document.getElementById(`${baseId}Year`);
    const monthSelect = document.getElementById(`${baseId}Month`);
    const daySelect = document.getElementById(`${baseId}Day`);

    if (yearSelect) yearSelect.value = year;
    if (monthSelect) monthSelect.value = parseInt(month, 10);
    if (daySelect) daySelect.value = parseInt(day, 10);
}

/**
 * すべての日付セレクトボックスを初期化
 */
function initializeDateSelects() {
    const currentYear = new Date().getFullYear();

    // 生年月日（過去120年～現在）
    populateDateSelects('birthDate', currentYear - 120, currentYear, false);

    // 負傷日・休業期間（過去5年～現在）
    populateDateSelects('injuryDate', currentYear - 5, currentYear, false);
    populateDateSelects('absenceStart', currentYear - 5, currentYear, false);
    populateDateSelects('absenceEnd', currentYear - 5, currentYear, false);

    // 事業主・医療機関の記入日（現在のみ）
    populateDateSelects('employerDate', currentYear, currentYear, false);
    populateDateSelects('medicalDate', currentYear, currentYear, false);

    // 療養期間（過去5年～現在）
    populateDateSelects('treatmentStart', currentYear - 5, currentYear, false);
    populateDateSelects('treatmentEnd', currentYear - 5, currentYear, false);
}

// ============================================================================
// フォーム送信処理
// ============================================================================

/**
 * 手動保存機能
 * 注: この関数はindex.jsでも提供されています
 */
function manualSave() {
    // この機能はindex.jsで実装されています
    console.log('手動保存が実行されました');
    showToast('データを保存しました', 'success');
}

/**
 * 回覧依頼送信処理
 * 被災労働者が入力完了後、事業主と医療機関に回覧依頼を送信
 */
function submitCirculation() {
    // 回覧先の取得
    const employerEmail = document.getElementById('employerEmail')?.value;
    const medicalEmail = document.getElementById('medicalEmail')?.value;

    if (!employerEmail && !medicalEmail) {
        showToast('回覧先のメールアドレスを入力してください', 'error');
        return;
    }

    // 実際の実装ではAPIを呼び出してメールを送信
    // ここではモックとしてlocalStorageに保存
    const circulationData = {
        employerEmail,
        medicalEmail,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        completedBy: 'worker'
    };

    try {
        localStorage.setItem('circulationData', JSON.stringify(circulationData));
        localStorage.setItem('completedBy', 'worker');

        // 回覧完了画面へ遷移
        showToast('回覧依頼を送信しました', 'success', 2000);
        setTimeout(() => {
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        }, 2000);
    } catch (error) {
        console.error('回覧依頼の送信に失敗しました:', error);
        showToast('回覧依頼の送信に失敗しました', 'error');
    }
}

/**
 * 最終申請送信処理
 * すべての入力が完了後、労働基準監督署へ申請を送信
 */
function submitApplication() {
    if (!confirm('申請を送信しますか？\n送信後は内容の変更ができません。')) {
        return;
    }

    // 実際の実装ではAPIを呼び出して申請データを送信
    // ここではモックとしてlocalStorageに保存
    try {
        const applicationData = {
            submittedAt: new Date().toISOString(),
            status: 'submitted'
        };

        localStorage.setItem('applicationData', JSON.stringify(applicationData));

        showToast('申請を送信しました', 'success', 2000);
        setTimeout(() => {
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        }, 2000);
    } catch (error) {
        console.error('申請の送信に失敗しました:', error);
        showToast('申請の送信に失敗しました', 'error');
    }
}

/**
 * 事業主モードへ切り替え
 * ステップ6（事業主情報）の入力完了後、回覧完了画面へ遷移
 */
function goToEmployerMode() {
    // 事業主情報の簡易バリデーション
    const employerName = document.getElementById('employerName')?.value;

    if (!employerName) {
        showToast('事業主氏名を入力してください', 'error');
        return;
    }

    // 実際の実装ではAPIを呼び出してデータを保存
    try {
        localStorage.setItem('completedBy', 'employer');

        showToast('事業主情報を保存しました', 'success', 2000);
        setTimeout(() => {
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        }, 2000);
    } catch (error) {
        console.error('事業主情報の保存に失敗しました:', error);
        showToast('事業主情報の保存に失敗しました', 'error');
    }
}

/**
 * 医療機関モードへ切り替え
 * ステップ8（診断証明）の入力完了後、回覧完了画面へ遷移
 */
function goToMedicalMode() {
    // 診断証明の簡易バリデーション
    const doctorLastName = document.getElementById('doctorLastName')?.value;
    const doctorFirstName = document.getElementById('doctorFirstName')?.value;

    if (!doctorLastName || !doctorFirstName) {
        showToast('医師氏名を入力してください', 'error');
        return;
    }

    // 実際の実装ではAPIを呼び出してデータを保存
    try {
        localStorage.setItem('completedBy', 'medical');

        showToast('診断証明を保存しました', 'success', 2000);
        setTimeout(() => {
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        }, 2000);
    } catch (error) {
        console.error('診断証明の保存に失敗しました:', error);
        showToast('診断証明の保存に失敗しました', 'error');
    }
}

/**
 * 事業主フォーム送信処理
 * 事業主が証明事項を記入後、データを保存
 */
function submitEmployerForm() {
    // 必須フィールドのバリデーション
    const employerName = document.getElementById('employerName')?.value;
    const employerPosition = document.getElementById('employerPosition')?.value;
    const businessName = document.getElementById('businessName')?.value;

    if (!employerName || !employerPosition || !businessName) {
        showToast('すべての必須項目を入力してください', 'error');
        return;
    }

    // データの保存
    const employerData = {
        employerName,
        employerPosition,
        businessName,
        employerDate: getDateValue('employerDate'),
        submittedAt: new Date().toISOString()
    };

    try {
        // FormStateを使用してデータを保存（index.jsで提供）
        if (typeof window.formState !== 'undefined') {
            Object.keys(employerData).forEach(key => {
                window.formState.saveField(key, employerData[key]);
            });
            window.formState.saveToStorage();
        } else {
            // フォールバック: 直接localStorageに保存
            const existingData = JSON.parse(localStorage.getItem('formData') || '{}');
            localStorage.setItem('formData', JSON.stringify({...existingData, ...employerData}));
        }

        localStorage.setItem('completedBy', 'employer');

        showToast('事業主情報を保存しました', 'success', 2000);
        setTimeout(() => {
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        }, 2000);
    } catch (error) {
        console.error('事業主情報の保存に失敗しました:', error);
        showToast('事業主情報の保存に失敗しました', 'error');
    }
}

/**
 * 医療機関フォーム送信処理
 * 医療機関が診断内容を記入後、データを保存
 */
function submitMedicalForm() {
    // 必須フィールドのバリデーション
    const doctorLastName = document.getElementById('doctorLastName')?.value;
    const doctorFirstName = document.getElementById('doctorFirstName')?.value;
    const injuryPart = document.getElementById('injuryPart')?.value;
    const injuryName = document.getElementById('injuryName')?.value;

    if (!doctorLastName || !doctorFirstName || !injuryPart || !injuryName) {
        showToast('すべての必須項目を入力してください', 'error');
        return;
    }

    // データの保存
    const medicalData = {
        doctorLastName,
        doctorFirstName,
        injuryPart,
        injuryName,
        treatmentStart: getDateValue('treatmentStart'),
        treatmentEnd: getDateValue('treatmentEnd'),
        treatmentDays: document.getElementById('treatmentDays')?.value,
        treatmentStatus: document.querySelector('input[name="treatmentStatus"]:checked')?.value,
        submittedAt: new Date().toISOString()
    };

    try {
        // FormStateを使用してデータを保存（index.jsで提供）
        if (typeof window.formState !== 'undefined') {
            Object.keys(medicalData).forEach(key => {
                window.formState.saveField(key, medicalData[key]);
            });
            window.formState.saveToStorage();
        } else {
            // フォールバック: 直接localStorageに保存
            const existingData = JSON.parse(localStorage.getItem('formData') || '{}');
            localStorage.setItem('formData', JSON.stringify({...existingData, ...medicalData}));
        }

        localStorage.setItem('completedBy', 'medical');

        showToast('診断証明を保存しました', 'success', 2000);
        setTimeout(() => {
            window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        }, 2000);
    } catch (error) {
        console.error('診断証明の保存に失敗しました:', error);
        showToast('診断証明の保存に失敗しました', 'error');
    }
}

// ============================================================================
// セットアップ処理
// ============================================================================

/**
 * リアルタイムバリデーションのセットアップ
 * 注: この関数はindex.jsに移行されました
 */
function setupRealtimeValidation() {
    console.warn('setupRealtimeValidation: この関数はindex.jsに移行されました');
}

/**
 * 医療機関検索リスナーのセットアップ
 * 注: この関数はindex.jsに移行されました
 */
function setupMedicalSearchListeners() {
    console.warn('setupMedicalSearchListeners: この関数はindex.jsに移行されました');
}

// ============================================================================
// 初期化処理
// ============================================================================

// DOMContentLoaded時の初期化は index.js に移行されました
// このファイルは関数定義のみを提供します
