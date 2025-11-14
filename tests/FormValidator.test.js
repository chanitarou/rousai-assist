/**
 * FormValidator.js のテストスイート
 */

import { FormValidator, validationRules } from '../js/pages/application-form/FormValidator.js';

// DOM環境のモック
global.document = {
    getElementById: jest.fn(),
    querySelectorAll: jest.fn(() => [])
};

describe('FormValidator', () => {
    let validator;

    beforeEach(() => {
        validator = new FormValidator();
        jest.clearAllMocks();
    });

    describe('バリデーションルール定義', () => {
        test('必須フィールドのルールが定義されている', () => {
            expect(validationRules.lastName).toBeDefined();
            expect(validationRules.lastName.required).toBe(true);
            expect(validationRules.lastName.fieldName).toBe('姓');
        });

        test('パターンチェックのルールが正しく設定されている', () => {
            // カタカナチェック
            expect(validationRules.lastNameKana.pattern.test('ヤマダ')).toBe(true);
            expect(validationRules.lastNameKana.pattern.test('山田')).toBe(false);
            expect(validationRules.lastNameKana.pattern.test('yamada')).toBe(false);
        });

        test('数値チェックのルールが正しく設定されている', () => {
            // 郵便番号（前半）: 3桁の数字
            expect(validationRules.postalCode1.pattern.test('123')).toBe(true);
            expect(validationRules.postalCode1.pattern.test('12')).toBe(false);
            expect(validationRules.postalCode1.pattern.test('1234')).toBe(false);
            expect(validationRules.postalCode1.pattern.test('abc')).toBe(false);
        });

        test('電話番号のルールが正しく設定されている', () => {
            // tel1: 2-5桁
            expect(validationRules.tel1.pattern.test('03')).toBe(true);
            expect(validationRules.tel1.pattern.test('090')).toBe(true);
            expect(validationRules.tel1.pattern.test('1')).toBe(false);

            // tel2: 1-4桁
            expect(validationRules.tel2.pattern.test('1234')).toBe(true);
            expect(validationRules.tel2.pattern.test('12345')).toBe(false);

            // tel3: 4桁固定
            expect(validationRules.tel3.pattern.test('5678')).toBe(true);
            expect(validationRules.tel3.pattern.test('567')).toBe(false);
        });

        test('労働保険番号のルールが正しく設定されている', () => {
            // 前半: 11桁
            expect(validationRules.insuranceMain.pattern.test('12345678901')).toBe(true);
            expect(validationRules.insuranceMain.pattern.test('1234567890')).toBe(false);

            // 後半: 3桁
            expect(validationRules.insuranceBranch.pattern.test('123')).toBe(true);
            expect(validationRules.insuranceBranch.pattern.test('12')).toBe(false);
        });

        test('メールアドレスのルールが正しく設定されている', () => {
            expect(validationRules.employerEmail.pattern.test('test@example.com')).toBe(true);
            expect(validationRules.employerEmail.pattern.test('invalid.email')).toBe(false);
            expect(validationRules.employerEmail.pattern.test('@example.com')).toBe(false);
            expect(validationRules.employerEmail.pattern.test('test@')).toBe(false);
        });
    });

    describe('validateCompositeField', () => {
        test('すべてのフィールドが入力されている場合はtrueを返す', () => {
            document.getElementById.mockImplementation((id) => {
                if (id === 'tel1') return { value: '03', classList: { add: jest.fn() } };
                if (id === 'tel2') return { value: '1234', classList: { add: jest.fn() } };
                if (id === 'tel3') return { value: '5678', classList: { add: jest.fn() } };
                return null;
            });

            const result = validator.validateCompositeField(
                ['tel1', 'tel2', 'tel3'],
                'tel',
                '電話番号エラー'
            );

            expect(result).toBe(true);
        });

        test('一部のフィールドが空の場合はfalseを返す', () => {
            document.getElementById.mockImplementation((id) => {
                if (id === 'tel1') return { value: '03', classList: { add: jest.fn() }, trim: () => '03' };
                if (id === 'tel2') return { value: '', classList: { add: jest.fn() }, trim: () => '' };
                if (id === 'tel3') return { value: '5678', classList: { add: jest.fn() }, trim: () => '5678' };
                if (id === 'tel-error') return { textContent: '', classList: { add: jest.fn() } };
                return null;
            });

            const result = validator.validateCompositeField(
                ['tel1', 'tel2', 'tel3'],
                'tel',
                '電話番号エラー'
            );

            expect(result).toBe(false);
        });
    });

    describe('validateSingleField', () => {
        test('必須フィールドが空の場合はfalseを返す', () => {
            const input = {
                value: '',
                id: 'lastName',
                classList: { add: jest.fn() }
            };
            const rule = validationRules.lastName;

            document.getElementById.mockReturnValue({ textContent: '', classList: { add: jest.fn() } });

            const result = validator.validateSingleField(input, rule);

            expect(result).toBe(false);
            expect(input.classList.add).toHaveBeenCalledWith('error');
        });

        test('パターンにマッチしない場合はfalseを返す', () => {
            const input = {
                value: 'yamada',
                id: 'lastNameKana',
                classList: { add: jest.fn() }
            };
            const rule = validationRules.lastNameKana;

            document.getElementById.mockReturnValue({ textContent: '', classList: { add: jest.fn() } });

            const result = validator.validateSingleField(input, rule);

            expect(result).toBe(false);
        });

        test('正しい入力の場合はtrueを返す', () => {
            const input = {
                value: 'ヤマダ',
                id: 'lastNameKana',
                classList: { add: jest.fn() }
            };
            const rule = validationRules.lastNameKana;

            const result = validator.validateSingleField(input, rule);

            expect(result).toBe(true);
        });

        test('minLengthチェックが正しく動作する', () => {
            const input1 = {
                value: '山田',
                id: 'address1',
                classList: { add: jest.fn() }
            };
            const input2 = {
                value: '東京都渋谷区',
                id: 'address1',
                classList: { add: jest.fn() }
            };
            const rule = validationRules.address1;

            document.getElementById.mockReturnValue({ textContent: '', classList: { add: jest.fn() } });

            expect(validator.validateSingleField(input1, rule)).toBe(false); // 2文字
            expect(validator.validateSingleField(input2, rule)).toBe(true); // 6文字
        });
    });

    describe('カスタムバリデーター', () => {
        test('平均賃金の範囲チェックが正しく動作する', () => {
            const rule = validationRules.averageWage;

            expect(rule.validator('10000')).toBe(true);
            expect(rule.validator('0')).toBe(false); // 0円以下
            expect(rule.validator('1000001')).toBe(false); // 100万円超
            expect(rule.validator('abc')).toBe(false); // 数値でない
            expect(rule.validator('500000')).toBe(true);
        });

        test('負傷日の日付チェックが正しく動作する', () => {
            const rule = validationRules.injuryDate;
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const twoYearsAgo = new Date(today);
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            const fourYearsAgo = new Date(today);
            fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            expect(rule.validator(yesterday.toISOString().split('T')[0])).toBe(true);
            expect(rule.validator(twoYearsAgo.toISOString().split('T')[0])).toBe(true);
            expect(rule.validator(fourYearsAgo.toISOString().split('T')[0])).toBe(false); // 3年以上前
            expect(rule.validator(tomorrow.toISOString().split('T')[0])).toBe(false); // 未来
        });

        test('休業開始日と負傷日の関係チェックが正しく動作する', () => {
            const rule = validationRules.leaveStartDate;

            // 負傷日を設定
            document.getElementById.mockImplementation((id) => {
                if (id === 'injuryDate') return { value: '2025-01-01' };
                return null;
            });

            expect(rule.validator('2025-01-01')).toBe(true); // 同じ日
            expect(rule.validator('2025-01-05')).toBe(true); // 後の日
            expect(rule.validator('2024-12-31')).toBe(false); // 前の日
        });

        test('休業終了日と休業開始日の関係チェックが正しく動作する', () => {
            const rule = validationRules.leaveEndDate;

            // 休業開始日を設定
            document.getElementById.mockImplementation((id) => {
                if (id === 'leaveStartDate') return { value: '2025-01-01' };
                return null;
            });

            expect(rule.validator('2025-01-01')).toBe(true); // 同じ日
            expect(rule.validator('2025-01-10')).toBe(true); // 後の日
            expect(rule.validator('2024-12-31')).toBe(false); // 前の日
        });
    });

    describe('showFieldError', () => {
        test('エラーメッセージを表示する', () => {
            const errorElement = {
                textContent: '',
                classList: { add: jest.fn() }
            };
            document.getElementById.mockReturnValue(errorElement);

            validator.showFieldError('lastName', 'エラーメッセージ');

            expect(errorElement.textContent).toBe('エラーメッセージ');
            expect(errorElement.classList.add).toHaveBeenCalledWith('show');
        });
    });

    describe('clearErrors', () => {
        test('すべてのエラー状態をクリアする', () => {
            const mockInputs = [
                { classList: { remove: jest.fn() } },
                { classList: { remove: jest.fn() } }
            ];
            const mockErrorMessages = [
                { classList: { remove: jest.fn() } },
                { classList: { remove: jest.fn() } }
            ];

            const stepElement = {
                querySelectorAll: jest.fn((selector) => {
                    if (selector === '.form-input, .form-select') return mockInputs;
                    if (selector === '.error-message') return mockErrorMessages;
                    return [];
                })
            };

            validator.clearErrors(stepElement);

            mockInputs.forEach(input => {
                expect(input.classList.remove).toHaveBeenCalledWith('error');
            });
            mockErrorMessages.forEach(msg => {
                expect(msg.classList.remove).toHaveBeenCalledWith('show');
            });
        });
    });

    describe('実際のバリデーションシナリオ', () => {
        test('氏名フィールドの検証', () => {
            // 正しい入力
            expect(validationRules.lastName.pattern.test('山田')).toBe(true);
            expect(validationRules.lastName.pattern.test('やまだ')).toBe(true);
            expect(validationRules.lastName.pattern.test('ヤマダ')).toBe(true);
            expect(validationRules.lastName.pattern.test('山田太郎')).toBe(true);

            // 不正な入力
            expect(validationRules.lastName.pattern.test('Yamada')).toBe(false);
            expect(validationRules.lastName.pattern.test('123')).toBe(false);
            expect(validationRules.lastName.pattern.test('!@#')).toBe(false);
        });

        test('カタカナフィールドの検証', () => {
            // 正しい入力
            expect(validationRules.lastNameKana.pattern.test('ヤマダ')).toBe(true);
            expect(validationRules.lastNameKana.pattern.test('タロウ')).toBe(true);
            expect(validationRules.lastNameKana.pattern.test('トウキョウ')).toBe(true);

            // 不正な入力
            expect(validationRules.lastNameKana.pattern.test('やまだ')).toBe(false);
            expect(validationRules.lastNameKana.pattern.test('山田')).toBe(false);
            expect(validationRules.lastNameKana.pattern.test('yamada')).toBe(false);
        });

        test('口座番号の検証', () => {
            // 正しい入力
            expect(validationRules.accountNumber.pattern.test('1234567')).toBe(true);
            expect(validationRules.accountNumber.pattern.test('1')).toBe(true);
            expect(validationRules.accountNumber.pattern.test('12345678')).toBe(true);

            // 不正な入力
            expect(validationRules.accountNumber.pattern.test('123456789')).toBe(false); // 9桁
            expect(validationRules.accountNumber.pattern.test('abc')).toBe(false);
            expect(validationRules.accountNumber.pattern.test('')).toBe(false);
        });
    });
});
