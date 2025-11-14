/**
 * フォームバリデーションクラス
 *
 * 労災申請フォームの包括的なバリデーション機能を提供します。
 * - 各ステップの入力値検証
 * - エラーメッセージの表示・非表示
 * - リアルタイムバリデーション
 * - 複合フィールドのバリデーション
 *
 * @module FormValidator
 */

import { Logger } from '../../core/Logger.js';

const logger = new Logger('FormValidator');

/**
 * バリデーションルール定義
 */
export const validationRules = {
    // ステップ1: 労働者基本情報
    lastName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【姓】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '姓'
    },
    firstName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【名】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '名'
    },
    lastNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【姓（フリガナ）】は全角カタカナで入力してください。例：ヤマダ',
        fieldName: '姓（フリガナ）'
    },
    firstNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【名（フリガナ）】は全角カタカナで入力してください。例：タロウ',
        fieldName: '名（フリガナ）'
    },
    tel1: {
        required: true,
        pattern: /^[0-9]{2,5}$/,
        message: '【電話番号（1番目）】は2〜5桁の半角数字で入力してください。',
        fieldName: '電話番号（1番目）'
    },
    tel2: {
        required: true,
        pattern: /^[0-9]{1,4}$/,
        message: '【電話番号（2番目）】は1〜4桁の半角数字で入力してください。',
        fieldName: '電話番号（2番目）'
    },
    tel3: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【電話番号（3番目）】は4桁の半角数字で入力してください。',
        fieldName: '電話番号（3番目）'
    },
    postalCode1: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【郵便番号（前半）】は3桁の半角数字で入力してください。',
        fieldName: '郵便番号（前半）'
    },
    postalCode2: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【郵便番号（後半）】は4桁の半角数字で入力してください。',
        fieldName: '郵便番号（後半）'
    },
    address1: {
        required: true,
        minLength: 3,
        message: '【住所（都道府県・市区町村）】を入力してください。郵便番号検索ボタンで自動入力できます。',
        fieldName: '住所（都道府県・市区町村）'
    },
    address2: {
        required: true,
        minLength: 1,
        message: '【住所（番地・建物名等）】を入力してください。番地、建物名、部屋番号などを入力してください。',
        fieldName: '住所（番地・建物名等）'
    },

    // ステップ2: 労働保険番号・職種情報
    insuranceMain: {
        required: true,
        pattern: /^[0-9]{11}$/,
        message: '【労働保険番号（前半）】は11桁の数字で入力してください。',
        fieldName: '労働保険番号（前半11桁）'
    },
    insuranceBranch: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【労働保険番号（後半）】は3桁の数字で入力してください。',
        fieldName: '労働保険番号（後半3桁）'
    },
    occupation: {
        required: true,
        minLength: 2,
        message: '【職種】を入力してください。例：製造業、事務職、建設作業員',
        fieldName: '職種'
    },
    averageWage: {
        required: true,
        validator: function(value) {
            const num = parseFloat(value);
            return !isNaN(num) && num > 0 && num <= 1000000;
        },
        message: '【平均賃金（日額）】は1円以上100万円以下の数値で入力してください。',
        fieldName: '平均賃金（日額）'
    },

    // ステップ3: 災害情報
    injuryDate: {
        required: true,
        validator: function(value) {
            if (!value) return false;
            const date = new Date(value);
            const today = new Date();
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(today.getFullYear() - 3);
            return date >= threeYearsAgo && date <= today;
        },
        message: '【負傷または発病年月日】は過去3年以内の日付を入力してください。未来の日付は入力できません。',
        fieldName: '負傷または発病年月日'
    },
    injuryHour: {
        required: true,
        message: '【災害発生時刻（時）】を選択してください。',
        fieldName: '災害発生時刻（時）'
    },
    injuryMinute: {
        required: true,
        message: '【災害発生時刻（分）】を選択してください。',
        fieldName: '災害発生時刻（分）'
    },
    accidentLocation: {
        required: true,
        minLength: 3,
        message: '【災害発生場所】を具体的に入力してください。例：工場内第2作業場、事務所3階会議室',
        fieldName: '災害発生場所'
    },
    accidentDescription: {
        required: true,
        minLength: 20,
        message: '【災害発生状況】は20文字以上で詳しく記入してください。いつ、どこで、何をしている時に、どのような災害が発生したかを具体的に記入してください。',
        fieldName: '災害発生状況'
    },
    leaveStartDate: {
        required: true,
        validator: function(value) {
            if (!value) return false;
            const injuryDate = document.getElementById('injuryDate')?.value;
            if (!injuryDate) return true;
            return new Date(value) >= new Date(injuryDate);
        },
        message: '【休業開始日】は負傷または発病年月日以降の日付を入力してください。',
        fieldName: '休業開始日'
    },
    leaveEndDate: {
        required: true,
        validator: function(value) {
            if (!value) return false;
            const startDate = document.getElementById('leaveStartDate')?.value;
            if (!startDate) return true;
            return new Date(value) >= new Date(startDate);
        },
        message: '【休業終了日（予定）】は休業開始日以降の日付を入力してください。',
        fieldName: '休業終了日（予定）'
    },

    // ステップ4: 振込先情報
    bankName: {
        required: true,
        minLength: 2,
        message: '【金融機関名】を入力してください。例：三菱UFJ銀行、みずほ銀行',
        fieldName: '金融機関名'
    },
    branchName: {
        required: true,
        minLength: 2,
        message: '【支店名】を入力してください。例：本店、東京支店',
        fieldName: '支店名'
    },
    accountNumber: {
        required: true,
        pattern: /^[0-9]{1,8}$/,
        message: '【口座番号】は半角数字で1～8桁で入力してください。',
        fieldName: '口座番号'
    },
    accountHolderLastNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【口座名義人 姓（カナ）】は全角カタカナで入力してください。例：ヤマダ',
        fieldName: '口座名義人 姓（カナ）'
    },
    accountHolderFirstNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【口座名義人 名（カナ）】は全角カタカナで入力してください。例：タロウ',
        fieldName: '口座名義人 名（カナ）'
    },

    // 回覧依頼セクション
    employerEmail: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '【事業主メールアドレス】を正しい形式で入力してください。例：employer@example.com',
        fieldName: '事業主メールアドレス'
    },

    // ステップ6: 事業主情報
    businessPostalCode1: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【事業の所在地 郵便番号（前半）】は3桁の半角数字で入力してください。',
        fieldName: '事業の所在地 郵便番号（前半）'
    },
    businessPostalCode2: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【事業の所在地 郵便番号（後半）】は4桁の半角数字で入力してください。',
        fieldName: '事業の所在地 郵便番号（後半）'
    },
    businessAddress1: {
        required: true,
        minLength: 3,
        message: '【事業の所在地（都道府県・市区町村）】を入力してください。郵便番号検索ボタンで自動入力できます。',
        fieldName: '事業の所在地（都道府県・市区町村）'
    },
    businessAddress2: {
        required: true,
        minLength: 1,
        message: '【事業の所在地（番地・建物名等）】を入力してください。番地、建物名、部屋番号などを入力してください。',
        fieldName: '事業の所在地（番地・建物名等）'
    },

    // ステップ7: 医療機関情報
    hospitalPostalCode1: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【医療機関 郵便番号（前半）】は3桁の半角数字で入力してください。',
        fieldName: '医療機関 郵便番号（前半）'
    },
    hospitalPostalCode2: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【医療機関 郵便番号（後半）】は4桁の半角数字で入力してください。',
        fieldName: '医療機関 郵便番号（後半）'
    },
    hospitalAddress1: {
        required: true,
        minLength: 3,
        message: '【病院又は診療所の所在地（都道府県・市区町村）】を入力してください。郵便番号検索ボタンで自動入力できます。',
        fieldName: '病院又は診療所の所在地（都道府県・市区町村）'
    },
    hospitalAddress2: {
        required: true,
        minLength: 1,
        message: '【病院又は診療所の所在地（番地・建物名等）】を入力してください。番地、建物名、部屋番号などを入力してください。',
        fieldName: '病院又は診療所の所在地（番地・建物名等）'
    },
    medicalDate: {
        required: true,
        message: '【記入日】を入力してください。',
        fieldName: '記入日'
    },
    hospitalName: {
        required: true,
        minLength: 2,
        message: '【病院又は診療所の名称】を入力してください。例：〇〇病院、△△診療所',
        fieldName: '病院又は診療所の名称'
    },
    doctorLastName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【担当者 姓】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '担当者 姓'
    },
    doctorFirstName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【担当者 名】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '担当者 名'
    },
    hospitalTel1: {
        required: true,
        pattern: /^[0-9]{2,5}$/,
        message: '【病院・診療所 電話番号（1番目）】は2〜5桁の半角数字で入力してください。',
        fieldName: '病院・診療所 電話番号（1番目）'
    },
    hospitalTel2: {
        required: true,
        pattern: /^[0-9]{1,4}$/,
        message: '【病院・診療所 電話番号（2番目）】は1〜4桁の半角数字で入力してください。',
        fieldName: '病院・診療所 電話番号（2番目）'
    },
    hospitalTel3: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【病院・診療所 電話番号（3番目）】は4桁の半角数字で入力してください。',
        fieldName: '病院・診療所 電話番号（3番目）'
    },

    // ステップ8: 診断証明
    injuryPart: {
        required: true,
        minLength: 2,
        message: '【傷病部位・名称】を入力してください。例：左手首捻挫、腰部打撲',
        fieldName: '傷病部位・名称'
    },
    actualDays: {
        required: true,
        validator: function(value) {
            const num = parseFloat(value);
            return !isNaN(num) && num >= 0 && num <= 365;
        },
        message: '【診療実日数】は0日以上365日以下の数値で入力してください。',
        fieldName: '診療実日数'
    }
};

/**
 * フォームバリデータークラス
 */
export class FormValidator {
    /**
     * @param {Function} getDateValueFn - 日付セレクトボックスから値を取得する関数
     * @param {Function} isMobileFn - モバイルデバイス判定関数
     */
    constructor(getDateValueFn = null, isMobileFn = null) {
        this.getDateValue = getDateValueFn;
        this.isMobile = isMobileFn || (() => false);
        this.rules = validationRules;
    }

    /**
     * 現在のステップのバリデーションを実行
     * @param {number} stepNumber - ステップ番号
     * @returns {boolean} - バリデーション成功時true
     */
    validateStep(stepNumber) {
        const stepElement = document.getElementById(`step-${stepNumber}`);
        logger.debug(`validateStep: step-${stepNumber}`, stepElement);

        if (!stepElement) {
            logger.error(`Step element not found: step-${stepNumber}`);
            return false;
        }

        let isValid = true;

        // エラー状態をリセット
        this.clearErrors(stepElement);

        // ステップ別の複合バリデーション
        const stepValidators = {
            1: () => this.validateStep1(stepElement),
            2: () => this.validateStep2(stepElement),
            3: () => this.validateStep3(stepElement),
            4: () => this.validateStep4(stepElement),
            7: () => this.validateStep7(stepElement)
        };

        if (stepValidators[stepNumber]) {
            isValid = stepValidators[stepNumber]() && isValid;
        }

        // 必須フィールドのバリデーション
        isValid = this.validateRequiredFields(stepElement) && isValid;

        // エラー時のスクロール処理
        if (!isValid) {
            this.scrollToFirstError(stepElement);
            this.showErrorSummary(stepNumber, stepElement);
        } else {
            this.hideErrorSummary(stepElement);
        }

        logger.debug(`validateStep for step-${stepNumber} result:`, isValid);
        return isValid;
    }

    /**
     * ステップ1（労働者基本情報）のバリデーション
     * @param {HTMLElement} stepElement - ステップ要素
     * @returns {boolean}
     */
    validateStep1(stepElement) {
        let isValid = true;

        // 性別のバリデーション
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        const isGenderChecked = Array.from(genderRadios).some(radio => radio.checked);

        if (!isGenderChecked) {
            this.showFieldError('gender', '【性別】を選択してください。');
            isValid = false;
        }

        // 生年月日のバリデーション
        const birthDateValid = this.validateDateSelect('birthDate', '生年月日', {
            minAge: 15,
            maxAge: 100
        });
        isValid = birthDateValid && isValid;

        // 郵便番号の複合バリデーション
        const postalValid = this.validateCompositeField(
            ['postalCode1', 'postalCode2'],
            'postalCode',
            '【郵便番号】は前半3桁、後半4桁で入力してください。例：123-4567'
        );
        isValid = postalValid && isValid;

        // 電話番号の複合バリデーション
        const telValid = this.validateCompositeField(
            ['tel1', 'tel2', 'tel3'],
            'tel',
            '【電話番号】はすべての項目を入力してください。3つの入力欄すべてに入力してください。'
        );
        isValid = telValid && isValid;

        return isValid;
    }

    /**
     * ステップ2（労働保険番号・職種情報）のバリデーション
     * @param {HTMLElement} stepElement - ステップ要素
     * @returns {boolean}
     */
    validateStep2(stepElement) {
        return this.validateCompositeField(
            ['insuranceMain', 'insuranceBranch'],
            'insurance',
            '【労働保険番号】はすべての項目を入力してください。前半11桁と後半3桁の両方を正しく入力してください。'
        );
    }

    /**
     * ステップ3（災害情報）のバリデーション
     * @param {HTMLElement} stepElement - ステップ要素
     * @returns {boolean}
     */
    validateStep3(stepElement) {
        const hour = document.getElementById('injuryHour');
        const minute = document.getElementById('injuryMinute');

        if ((!hour || !hour.value) || (!minute || !minute.value)) {
            if (hour && !hour.value) hour.classList.add('error');
            if (minute && !minute.value) minute.classList.add('error');
            this.showFieldError('injuryTime', '【災害発生時刻】の時と分の両方を選択してください。');
            return false;
        }

        return true;
    }

    /**
     * ステップ4（振込先情報）のバリデーション
     * @param {HTMLElement} stepElement - ステップ要素
     * @returns {boolean}
     */
    validateStep4(stepElement) {
        const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
        const isAccountTypeChecked = Array.from(accountTypeRadios).some(radio => radio.checked);

        if (!isAccountTypeChecked) {
            this.showFieldError('accountType', '【口座種別】を選択してください。');
            return false;
        }

        return true;
    }

    /**
     * ステップ7（医療機関情報）のバリデーション
     * @param {HTMLElement} stepElement - ステップ要素
     * @returns {boolean}
     */
    validateStep7(stepElement) {
        let isValid = true;

        // 記入日のバリデーション
        const medicalDateValid = this.validateDateSelect('medicalDate', '記入日');
        isValid = medicalDateValid && isValid;

        // 郵便番号のバリデーション
        const postalValid = this.validateCompositeField(
            ['hospitalPostalCode1', 'hospitalPostalCode2'],
            'hospitalPostalCode',
            '【医療機関 郵便番号】は前半3桁、後半4桁で入力してください。例：123-4567'
        );
        isValid = postalValid && isValid;

        // 医師氏名のバリデーション
        const doctorLastName = document.getElementById('doctorLastName');
        const doctorFirstName = document.getElementById('doctorFirstName');

        if (!doctorLastName?.value.trim() || !doctorFirstName?.value.trim()) {
            if (doctorLastName && !doctorLastName.value.trim()) {
                doctorLastName.classList.add('error');
                this.showFieldError('doctorLastName', '【姓】を入力してください');
            }
            if (doctorFirstName && !doctorFirstName.value.trim()) {
                doctorFirstName.classList.add('error');
                this.showFieldError('doctorFirstName', '【名】を入力してください');
            }
            isValid = false;
        }

        // 電話番号のバリデーション
        const telValid = this.validateCompositeField(
            ['hospitalTel1', 'hospitalTel2', 'hospitalTel3'],
            'hospitalTel',
            '【電話番号】をすべて入力してください'
        );
        isValid = telValid && isValid;

        return isValid;
    }

    /**
     * 日付セレクトボックスのバリデーション
     * @param {string} baseId - フィールドのベースID
     * @param {string} fieldLabel - フィールド名
     * @param {Object} options - 年齢制限などのオプション
     * @returns {boolean}
     */
    validateDateSelect(baseId, fieldLabel, options = {}) {
        const year = document.getElementById(`${baseId}-year`);
        const month = document.getElementById(`${baseId}-month`);
        const day = document.getElementById(`${baseId}-day`);

        if (!year?.value || !month?.value || !day?.value) {
            if (year && !year.value) year.classList.add('error');
            if (month && !month.value) month.classList.add('error');
            if (day && !day.value) day.classList.add('error');
            this.showFieldError(baseId, `【${fieldLabel}】の年・月・日をすべて選択してください。`);
            return false;
        }

        // 年齢チェック（オプション）
        if (options.minAge || options.maxAge) {
            if (!this.getDateValue) {
                logger.warn('getDateValue function not provided, skipping age validation');
                return true;
            }

            const dateValue = this.getDateValue(baseId);
            if (dateValue) {
                const date = new Date(dateValue);
                const today = new Date();
                const age = today.getFullYear() - date.getFullYear();

                const minAge = options.minAge || 0;
                const maxAge = options.maxAge || 200;

                if (date >= today || age < minAge || age > maxAge) {
                    year.classList.add('error');
                    month.classList.add('error');
                    day.classList.add('error');
                    this.showFieldError(baseId, `【${fieldLabel}】を正しく選択してください。${minAge}歳以上${maxAge}歳以下の日付を選択してください。`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 複合フィールド（分割入力）のバリデーション
     * @param {string[]} fieldIds - フィールドIDの配列
     * @param {string} errorId - エラー表示用のID
     * @param {string} errorMessage - エラーメッセージ
     * @returns {boolean}
     */
    validateCompositeField(fieldIds, errorId, errorMessage) {
        let allFilled = true;

        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                allFilled = false;
            }
        });

        if (!allFilled) {
            fieldIds.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    field.classList.add('error');
                }
            });

            this.showFieldError(errorId, errorMessage);
            return false;
        }

        return true;
    }

    /**
     * 必須フィールドのバリデーション
     * @param {HTMLElement} stepElement - ステップ要素
     * @returns {boolean}
     */
    validateRequiredFields(stepElement) {
        let isValid = true;

        stepElement.querySelectorAll('.form-label-required').forEach(label => {
            const formGroup = label.closest('.form-group');
            const input = formGroup.querySelector('.form-input:not([type="radio"]):not([type="checkbox"])');
            const selectInput = formGroup.querySelector('.form-select');
            const radioButtons = formGroup.querySelectorAll('.form-radio');
            const targetInput = input || selectInput;

            if (targetInput) {
                const fieldId = targetInput.id;
                const rule = this.rules[fieldId];

                if (rule) {
                    const fieldValid = this.validateSingleField(targetInput, rule);
                    isValid = fieldValid && isValid;
                }
            } else if (radioButtons.length > 0) {
                // 専用バリデーションで処理されていないラジオボタン
                const firstRadio = radioButtons[0];
                const radioName = firstRadio ? firstRadio.name : '';
                const skipRadioNames = ['gender', 'accountType'];

                if (!skipRadioNames.includes(radioName)) {
                    const isChecked = Array.from(radioButtons).some(radio => radio.checked);
                    if (!isChecked) {
                        isValid = false;
                        const labelText = label.textContent.trim();
                        const errorElement = formGroup.querySelector('.error-message');
                        if (errorElement) {
                            errorElement.textContent = `【${labelText}】を選択してください。`;
                            errorElement.classList.add('show');
                        }
                    }
                }
            }
        });

        return isValid;
    }

    /**
     * 単一フィールドのバリデーション
     * @param {HTMLElement} input - 入力要素
     * @param {Object} rule - バリデーションルール
     * @returns {boolean}
     */
    validateSingleField(input, rule) {
        let hasError = false;
        let errorMessage = '';

        if (rule.required && !input.value.trim()) {
            hasError = true;
            errorMessage = rule.message;
        } else if (input.value.trim()) {
            if (rule.pattern && !rule.pattern.test(input.value)) {
                hasError = true;
                errorMessage = rule.message;
            } else if (rule.validator && !rule.validator(input.value)) {
                hasError = true;
                errorMessage = rule.message;
            } else if (rule.minLength && input.value.length < rule.minLength) {
                hasError = true;
                errorMessage = rule.message;
            }
        }

        if (hasError) {
            input.classList.add('error');
            this.showFieldError(input.id, errorMessage);
            return false;
        }

        return true;
    }

    /**
     * フィールドエラーの表示
     * @param {string} fieldId - フィールドID
     * @param {string} message - エラーメッセージ
     */
    showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    /**
     * エラー状態のクリア
     * @param {HTMLElement} stepElement - ステップ要素
     */
    clearErrors(stepElement) {
        stepElement.querySelectorAll('.form-input, .form-select').forEach(input => {
            input.classList.remove('error');
        });
        stepElement.querySelectorAll('.error-message').forEach(msg => {
            msg.classList.remove('show');
        });
    }

    /**
     * 最初のエラーフィールドまでスクロール
     * @param {HTMLElement} stepElement - ステップ要素
     */
    scrollToFirstError(stepElement) {
        setTimeout(() => {
            const firstErrorField = stepElement.querySelector('.form-input.error, .form-select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // スマホではキーボード自動表示を防ぐためフォーカスしない
                if (!this.isMobile()) {
                    firstErrorField.focus();
                }
            }
        }, 100);
    }

    /**
     * エラーサマリーの表示
     * @param {number} stepNumber - ステップ番号
     * @param {HTMLElement} stepElement - ステップ要素
     */
    showErrorSummary(stepNumber, stepElement) {
        const errorFields = stepElement.querySelectorAll('.form-input.error, .form-select.error');
        const errorFieldIds = [];
        errorFields.forEach(field => {
            const fieldId = field.id || field.name;
            if (fieldId) errorFieldIds.push(fieldId);
        });

        if (errorFieldIds.length > 0) {
            const errorSummary = `【デバッグ】ステップ${stepNumber}で${errorFieldIds.length}件のエラーがあります: ${errorFieldIds.join(', ')}`;
            logger.error(errorSummary);

            // エラーサマリー要素の表示
            const summaryElement = stepElement.querySelector('.error-summary');
            if (summaryElement) {
                summaryElement.textContent = errorSummary;
                summaryElement.classList.add('show');
            }
        }
    }

    /**
     * エラーサマリーの非表示
     * @param {HTMLElement} stepElement - ステップ要素
     */
    hideErrorSummary(stepElement) {
        const summaryElement = stepElement.querySelector('.error-summary');
        if (summaryElement) {
            summaryElement.classList.remove('show');
        }
    }

    /**
     * 単一フィールドのリアルタイムバリデーション
     * @param {HTMLElement} input - 入力要素
     * @returns {boolean}
     */
    validateField(input) {
        const fieldId = input.id;
        const rule = this.rules[fieldId];

        if (!rule) {
            return true;
        }

        // エラー状態をクリア
        input.classList.remove('error');
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }

        // バリデーション実行
        return this.validateSingleField(input, rule);
    }
}
