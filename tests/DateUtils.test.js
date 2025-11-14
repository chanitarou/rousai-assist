/**
 * DateUtilsモジュールのテスト
 * @jest-environment jsdom
 */

import { DateUtils } from '../js/core/DateUtils.js';

describe('DateUtils', () => {
    describe('getDaysInMonth', () => {
        test('通常の月の日数を正しく取得', () => {
            expect(DateUtils.getDaysInMonth(2024, 1)).toBe(31); // 1月
            expect(DateUtils.getDaysInMonth(2024, 4)).toBe(30); // 4月
            expect(DateUtils.getDaysInMonth(2024, 6)).toBe(30); // 6月
        });

        test('うるう年の2月は29日', () => {
            expect(DateUtils.getDaysInMonth(2024, 2)).toBe(29); // うるう年
        });

        test('平年の2月は28日', () => {
            expect(DateUtils.getDaysInMonth(2023, 2)).toBe(28); // 平年
        });

        test('12月は31日', () => {
            expect(DateUtils.getDaysInMonth(2024, 12)).toBe(31);
        });
    });

    describe('populateDateSelects', () => {
        beforeEach(() => {
            // セレクトボックスのDOM要素を作成
            document.body.innerHTML = `
                <select id="testYear"></select>
                <select id="testMonth"></select>
                <select id="testDay"></select>
            `;
        });

        test('セレクトボックスにオプションが正しく追加される', () => {
            DateUtils.populateDateSelects('test', 2020, 2024, false);

            const yearSelect = document.getElementById('testYear');
            const monthSelect = document.getElementById('testMonth');
            const daySelect = document.getElementById('testDay');

            // 年: 5年分 + プレースホルダー
            expect(yearSelect.options.length).toBe(6);
            expect(yearSelect.options[0].value).toBe('');
            expect(yearSelect.options[1].value).toBe('2020');
            expect(yearSelect.options[5].value).toBe('2024');

            // 月: 12ヶ月 + プレースホルダー
            expect(monthSelect.options.length).toBe(13);
            expect(monthSelect.options[0].value).toBe('');
            expect(monthSelect.options[1].value).toBe('1');
            expect(monthSelect.options[12].value).toBe('12');

            // 日: 31日 + プレースホルダー（初期状態）
            expect(daySelect.options.length).toBeGreaterThan(0);
        });

        test('降順ソートが正しく機能する', () => {
            DateUtils.populateDateSelects('test', 2020, 2024, true);

            const yearSelect = document.getElementById('testYear');
            expect(yearSelect.options[1].value).toBe('2024');
            expect(yearSelect.options[5].value).toBe('2020');
        });

        test('要素が見つからない場合は警告のみ', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            DateUtils.populateDateSelects('nonexistent', 2020, 2024, false);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('updateDayOptions', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <select id="testYear">
                    <option value="">--</option>
                    <option value="2024">2024年</option>
                </select>
                <select id="testMonth">
                    <option value="">--</option>
                    <option value="2">2月</option>
                    <option value="4">4月</option>
                </select>
                <select id="testDay"></select>
            `;
        });

        test('選択された年月に応じて日数が更新される', () => {
            const yearSelect = document.getElementById('testYear');
            const monthSelect = document.getElementById('testMonth');
            const daySelect = document.getElementById('testDay');

            yearSelect.value = '2024';
            monthSelect.value = '2';

            DateUtils.updateDayOptions('test');

            // うるう年の2月なので29日まで
            expect(daySelect.options.length).toBe(30); // プレースホルダー + 29日
        });

        test('要素が見つからない場合は警告のみ', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            DateUtils.updateDayOptions('nonexistent');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('getDateValue', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <select id="testYear">
                    <option value="2024">2024年</option>
                </select>
                <select id="testMonth">
                    <option value="5">5月</option>
                </select>
                <select id="testDay">
                    <option value="15">15日</option>
                </select>
            `;
        });

        test('日付文字列を正しく取得', () => {
            const yearSelect = document.getElementById('testYear');
            const monthSelect = document.getElementById('testMonth');
            const daySelect = document.getElementById('testDay');

            yearSelect.value = '2024';
            monthSelect.value = '5';
            daySelect.value = '15';

            expect(DateUtils.getDateValue('test')).toBe('2024-05-15');
        });

        test('未選択の場合は空文字列を返す', () => {
            const yearSelect = document.getElementById('testYear');
            yearSelect.value = '';

            expect(DateUtils.getDateValue('test')).toBe('');
        });

        test('1桁の月日は0埋めされる', () => {
            const yearSelect = document.getElementById('testYear');
            const monthSelect = document.getElementById('testMonth');
            const daySelect = document.getElementById('testDay');

            yearSelect.value = '2024';
            monthSelect.value = '3';
            daySelect.value = '7';

            expect(DateUtils.getDateValue('test')).toBe('2024-03-07');
        });

        test('要素が見つからない場合は空文字列', () => {
            expect(DateUtils.getDateValue('nonexistent')).toBe('');
        });
    });

    describe('setDateValue', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <select id="testYear">
                    <option value="">--</option>
                    <option value="2024">2024年</option>
                </select>
                <select id="testMonth">
                    <option value="">--</option>
                    <option value="5">5月</option>
                </select>
                <select id="testDay">
                    <option value="">--</option>
                    <option value="15">15日</option>
                </select>
            `;
        });

        test('日付文字列から各セレクトボックスに値をセット', () => {
            DateUtils.setDateValue('test', '2024-05-15');

            const yearSelect = document.getElementById('testYear');
            const monthSelect = document.getElementById('testMonth');
            const daySelect = document.getElementById('testDay');

            expect(yearSelect.value).toBe('2024');
            expect(monthSelect.value).toBe('5');
            expect(daySelect.value).toBe('15');
        });

        test('空文字列の場合は何もしない', () => {
            DateUtils.setDateValue('test', '');

            const yearSelect = document.getElementById('testYear');
            expect(yearSelect.value).toBe('');
        });

        test('nullの場合は何もしない', () => {
            DateUtils.setDateValue('test', null);

            const yearSelect = document.getElementById('testYear');
            expect(yearSelect.value).toBe('');
        });
    });

    describe('initializeDateSelects', () => {
        beforeEach(() => {
            // 全ての日付フィールドのDOM要素を作成
            const fields = [
                'birthDate',
                'injuryDate',
                'absenceStart',
                'absenceEnd',
                'employerDate',
                'medicalDate',
                'treatmentStart',
                'treatmentEnd'
            ];

            let html = '';
            fields.forEach(field => {
                html += `
                    <select id="${field}Year"></select>
                    <select id="${field}Month"></select>
                    <select id="${field}Day"></select>
                `;
            });
            document.body.innerHTML = html;
        });

        test('全ての日付フィールドが初期化される', () => {
            DateUtils.initializeDateSelects();

            // 生年月日フィールドが初期化されているか確認
            const birthYearSelect = document.getElementById('birthDateYear');
            expect(birthYearSelect.options.length).toBeGreaterThan(1);

            // 負傷日フィールドが初期化されているか確認
            const injuryYearSelect = document.getElementById('injuryDateYear');
            expect(injuryYearSelect.options.length).toBeGreaterThan(1);

            // 事業主記入日フィールドが初期化されているか確認
            const employerYearSelect = document.getElementById('employerDateYear');
            expect(employerYearSelect.options.length).toBeGreaterThan(1);
        });
    });
});
