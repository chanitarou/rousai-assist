/**
 * 労災申請アシストサイト - 8号申請画面 JavaScript (リファクタリング後)
 *
 * このファイルは労災保険給付（様式第8号）の申請フォームの残存機能を提供します。
 *
 * 【重要】フェーズ6のモジュール化により、以下の機能は別モジュールに移行されました：
 * - FormState.js: フォーム状態管理、自動保存
 * - FormValidator.js: バリデーションロジック
 * - FormNavigator.js: ステップナビゲーション、プログレスバー管理
 * - MedicalInstitutionService.js: 医療機関検索
 * - DateUtils.js: 日付セレクトボックス操作
 * - FileUploadManager.js: ファイルアップロード処理
 * - index.js: メインエントリーポイント、初期化処理
 *
 * このファイルには以下の機能のみが残されています：
 * - ユーティリティ関数（isMobileDevice, showToast, logout）
 * - フォーム送信処理（回覧依頼、申請送信、事業主・医療機関フォーム送信）
 * - モード切替（事業主モード、医療機関モード）
 *
 * @file application-form.js
 * @version 3.0.0 (Phase 6 Refactored)
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
        employerDate: window.getDateValue ? window.getDateValue('employerDate') : '',
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
        treatmentStart: window.getDateValue ? window.getDateValue('treatmentStart') : '',
        treatmentEnd: window.getDateValue ? window.getDateValue('treatmentEnd') : '',
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
// レガシーサポート
// ============================================================================

/**
 * 以下の関数はモジュールに移行されました。
 * 後方互換性のため、index.jsでグローバル関数として提供されています。
 */

/**
 * ファイル削除
 * @deprecated この関数はFileUploadManager.jsに移行されました
 */
function removeFile(listId, index) {
    console.warn('removeFile: この関数はFileUploadManager.jsに移行されました');
    // index.jsで提供されるグローバル関数を呼び出し
    if (typeof window.removeFile === 'function') {
        window.removeFile(listId, index);
    }
}

/**
 * リアルタイムバリデーションのセットアップ
 * @deprecated この関数はindex.jsに移行されました
 */
function setupRealtimeValidation() {
    console.warn('setupRealtimeValidation: この関数はindex.jsに移行されました');
}

/**
 * 医療機関検索リスナーのセットアップ
 * @deprecated この関数はindex.jsに移行されました
 */
function setupMedicalSearchListeners() {
    console.warn('setupMedicalSearchListeners: この関数はindex.jsに移行されました');
}

// ============================================================================
// 初期化処理
// ============================================================================

// DOMContentLoaded時の初期化は index.js に移行されました
// このファイルは関数定義のみを提供します
