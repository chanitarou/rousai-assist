/**
 * 日付ユーティリティクラス
 *
 * 日付セレクトボックスの生成・管理、日付フォーマット変換などの
 * 日付関連の汎用機能を提供します。
 *
 * @class DateUtils
 * @module core/DateUtils
 * @version 1.0.0
 */

export class DateUtils {
    /**
     * 指定された年月の日数を取得
     * @param {number} year - 年
     * @param {number} month - 月（1-12）
     * @returns {number} その月の日数
     *
     * @example
     * DateUtils.getDaysInMonth(2024, 2); // => 29 (うるう年)
     * DateUtils.getDaysInMonth(2023, 2); // => 28
     */
    static getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    }

    /**
     * 日付セレクトボックスを生成
     * @param {string} baseId - セレクトボックスのベースID（例: 'birthDate'）
     * @param {number} startYear - 開始年
     * @param {number} endYear - 終了年
     * @param {boolean} sortDesc - 降順ソート（デフォルト: false）
     *
     * @example
     * DateUtils.populateDateSelects('birthDate', 1900, 2024, false);
     */
    static populateDateSelects(baseId, startYear, endYear, sortDesc = false) {
        const yearSelect = document.getElementById(`${baseId}Year`);
        const monthSelect = document.getElementById(`${baseId}Month`);
        const daySelect = document.getElementById(`${baseId}Day`);

        if (!yearSelect || !monthSelect || !daySelect) {
            console.warn(
                `DateUtils: セレクトボックスが見つかりません (baseId: ${baseId})`
            );
            return;
        }

        // 年の選択肢を生成
        yearSelect.innerHTML = '<option value="">--</option>';
        const years = [];
        for (let y = startYear; y <= endYear; y++) {
            years.push(y);
        }
        if (sortDesc) years.reverse();

        years.forEach((year) => {
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
        }

        // 日の選択肢を生成（初期状態は31日まで）
        DateUtils.updateDayOptions(baseId);

        // 年・月が変更されたら日の選択肢を更新
        yearSelect.addEventListener('change', () =>
            DateUtils.updateDayOptions(baseId)
        );
        monthSelect.addEventListener('change', () =>
            DateUtils.updateDayOptions(baseId)
        );
    }

    /**
     * 日の選択肢を更新（選択された年月に応じて）
     * @param {string} baseId - セレクトボックスのベースID
     *
     * @example
     * DateUtils.updateDayOptions('birthDate');
     */
    static updateDayOptions(baseId) {
        const yearSelect = document.getElementById(`${baseId}Year`);
        const monthSelect = document.getElementById(`${baseId}Month`);
        const daySelect = document.getElementById(`${baseId}Day`);

        if (!yearSelect || !monthSelect || !daySelect) {
            console.warn(
                `DateUtils: セレクトボックスが見つかりません (baseId: ${baseId})`
            );
            return;
        }

        const year = parseInt(yearSelect.value) || new Date().getFullYear();
        const month = parseInt(monthSelect.value) || 1;
        const currentDay = parseInt(daySelect.value) || '';

        const daysInMonth = DateUtils.getDaysInMonth(year, month);

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
     *
     * @example
     * DateUtils.getDateValue('birthDate'); // => "1990-05-15"
     */
    static getDateValue(baseId) {
        const yearEl = document.getElementById(`${baseId}Year`);
        const monthEl = document.getElementById(`${baseId}Month`);
        const dayEl = document.getElementById(`${baseId}Day`);

        if (!yearEl || !monthEl || !dayEl) {
            console.warn(
                `DateUtils: セレクトボックスが見つかりません (baseId: ${baseId})`
            );
            return '';
        }

        const year = yearEl.value;
        const month = monthEl.value;
        const day = dayEl.value;

        if (!year || !month || !day) return '';

        const paddedMonth = month.padStart(2, '0');
        const paddedDay = day.padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}`;
    }

    /**
     * 日付セレクトボックスに日付文字列をセット
     * @param {string} baseId - セレクトボックスのベースID
     * @param {string} dateString - 日付文字列（YYYY-MM-DD形式）
     *
     * @example
     * DateUtils.setDateValue('birthDate', '1990-05-15');
     */
    static setDateValue(baseId, dateString) {
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
     * 申請フォーム用にプリセットされた日付フィールドを初期化します
     *
     * @example
     * DateUtils.initializeDateSelects();
     */
    static initializeDateSelects() {
        const currentYear = new Date().getFullYear();

        // 生年月日（過去120年～現在）
        DateUtils.populateDateSelects(
            'birthDate',
            currentYear - 120,
            currentYear,
            false
        );

        // 負傷日・休業期間（過去5年～現在）
        DateUtils.populateDateSelects(
            'injuryDate',
            currentYear - 5,
            currentYear,
            false
        );
        DateUtils.populateDateSelects(
            'absenceStart',
            currentYear - 5,
            currentYear,
            false
        );
        DateUtils.populateDateSelects(
            'absenceEnd',
            currentYear - 5,
            currentYear,
            false
        );

        // 事業主・医療機関の記入日（現在のみ）
        DateUtils.populateDateSelects(
            'employerDate',
            currentYear,
            currentYear,
            false
        );
        DateUtils.populateDateSelects(
            'medicalDate',
            currentYear,
            currentYear,
            false
        );

        // 療養期間（過去5年～現在）
        DateUtils.populateDateSelects(
            'treatmentStart',
            currentYear - 5,
            currentYear,
            false
        );
        DateUtils.populateDateSelects(
            'treatmentEnd',
            currentYear - 5,
            currentYear,
            false
        );
    }
}
