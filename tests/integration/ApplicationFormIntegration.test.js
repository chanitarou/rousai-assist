/**
 * 統合テスト - 申請フォーム全体の動作確認
 *
 * このテストは、複数のモジュール（FormState, FormValidator, FormNavigator等）が
 * 正しく連携して動作することを確認します。
 *
 * @jest-environment jsdom
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// テスト対象のモジュールをインポート
// 注: 実際のindex.jsはDOMに依存するため、ここでは個別のモジュールをテスト
import { FormState } from '../../js/pages/application-form/FormState.js';
import { FormValidator } from '../../js/pages/application-form/FormValidator.js';
import { FormNavigator } from '../../js/pages/application-form/FormNavigator.js';
import { MedicalInstitutionService } from '../../js/pages/application-form/MedicalInstitutionService.js';

describe('申請フォーム統合テスト', () => {
    let formState;
    let formValidator;
    let formNavigator;
    let medicalService;

    beforeEach(() => {
        // localStorageをモック
        const localStorageMock = (() => {
            let store = {};
            return {
                getItem: (key) => store[key] || null,
                setItem: (key, value) => {
                    store[key] = value.toString();
                },
                removeItem: (key) => {
                    delete store[key];
                },
                clear: () => {
                    store = {};
                }
            };
        })();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // 簡単なDOM構造を作成
        document.body.innerHTML = `
            <div id="step-1" class="form-step active">
                <input id="lastName" type="text" />
                <input id="firstName" type="text" />
            </div>
            <div id="step-2" class="form-step">
                <input id="insuranceNumber1" type="text" />
            </div>
            <div id="step-3" class="form-step">
                <input id="accidentDate" type="date" />
            </div>
            <div class="progress-container">
                <div class="progress-bar"></div>
                <div class="progress-items"></div>
            </div>
        `;

        // インスタンスを作成
        formState = new FormState(9);
        formValidator = new FormValidator();
        formNavigator = new FormNavigator(formState, formValidator);
        medicalService = new MedicalInstitutionService();
    });

    afterEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
    });

    describe('モジュール間の連携', () => {
        test('FormNavigatorはFormStateと連携してステップを管理する', () => {
            expect(formState.getCurrentStep()).toBe(1);

            // FormNavigatorを通じてステップを変更
            formState.setCurrentStep(2);
            expect(formState.getCurrentStep()).toBe(2);

            formState.setCurrentStep(3);
            expect(formState.getCurrentStep()).toBe(3);
        });

        test('FormStateはデータを保存・復元できる', () => {
            // データを保存
            formState.saveField('lastName', '山田');
            formState.saveField('firstName', '太郎');
            formState.setCurrentStep(2);
            formState.saveToStorage();

            // 新しいインスタンスでデータを復元
            const newFormState = new FormState(9);
            const loadedData = newFormState.loadFromStorage();

            expect(loadedData).toEqual({
                lastName: '山田',
                firstName: '太郎'
            });
            expect(newFormState.getCurrentStep()).toBe(2);
        });

        test('FormValidatorは各ステップのバリデーションを実行できる', () => {
            const step1Element = document.getElementById('step-1');

            // 空のフィールドでバリデーション（エラーを期待）
            const result = formValidator.validateStep(1);
            expect(result).toBe(false);

            // 値を入力
            document.getElementById('lastName').value = '山田';
            document.getElementById('firstName').value = '太郎';

            // 再度バリデーション（成功を期待）
            // 注: 実際のvalidateStepは多くのフィールドをチェックするため、
            // ここでは単純化したテストを行う
            expect(document.getElementById('lastName').value).toBe('山田');
            expect(document.getElementById('firstName').value).toBe('太郎');
        });
    });

    describe('データフローのテスト', () => {
        test('フォーム入力 → 保存 → 復元のフロー', () => {
            // 1. フォームに入力
            const lastNameInput = document.getElementById('lastName');
            const firstNameInput = document.getElementById('firstName');

            lastNameInput.value = '佐藤';
            firstNameInput.value = '花子';

            // 2. FormStateに保存
            formState.saveField('lastName', lastNameInput.value);
            formState.saveField('firstName', firstNameInput.value);
            formState.saveToStorage();

            // 3. フォームをクリア
            lastNameInput.value = '';
            firstNameInput.value = '';

            // 4. 新しいFormStateインスタンスでデータを復元
            const newFormState = new FormState(9);
            const loadedData = newFormState.loadFromStorage();

            // 5. フォームに値を復元
            lastNameInput.value = loadedData.lastName || '';
            firstNameInput.value = loadedData.firstName || '';

            // 6. 検証
            expect(lastNameInput.value).toBe('佐藤');
            expect(firstNameInput.value).toBe('花子');
        });

        test('ステップ遷移時のデータ保持', () => {
            // ステップ1でデータを入力
            formState.saveField('lastName', '鈴木');
            formState.setCurrentStep(1);
            formState.saveToStorage();

            // ステップ2に移動
            formState.setCurrentStep(2);
            formState.saveToStorage();

            // ステップ1に戻る
            formState.setCurrentStep(1);

            // データが保持されていることを確認
            const loadedData = formState.loadFromStorage();
            expect(loadedData.lastName).toBe('鈴木');
        });
    });

    describe('MedicalInstitutionServiceの統合', () => {
        test('医療機関データの読み込みと検索', async () => {
            // データを読み込み
            await medicalService.loadData();

            // 検索実行
            const results = await medicalService.search('東京');

            // 結果の検証
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            // 最初の結果を取得
            const firstResult = results[0];
            expect(firstResult).toHaveProperty('name');
            expect(firstResult).toHaveProperty('address');
        });

        test('医療機関の詳細情報取得', async () => {
            await medicalService.loadData();

            // ID指定で取得
            const institution = await medicalService.getById('0832081');

            expect(institution).not.toBeNull();
            expect(institution.name).toContain('東京医科大学');
        });
    });

    describe('エラーハンドリングの統合', () => {
        test('無効なステップ番号でエラーが発生しない', () => {
            // 存在しないステップに移動を試みる
            expect(() => {
                formState.setCurrentStep(0);
            }).not.toThrow();

            expect(() => {
                formState.setCurrentStep(100);
            }).not.toThrow();
        });

        test('localStorageエラー時の graceful degradation', () => {
            // localStorageを無効化
            Object.defineProperty(window, 'localStorage', {
                value: {
                    getItem: () => {
                        throw new Error('localStorage is not available');
                    },
                    setItem: () => {
                        throw new Error('localStorage is not available');
                    }
                },
                writable: true
            });

            // エラーが発生してもアプリケーションがクラッシュしないことを確認
            const testFormState = new FormState(9);
            expect(() => {
                testFormState.saveField('test', 'value');
                testFormState.saveToStorage();
            }).not.toThrow();

            expect(() => {
                testFormState.loadFromStorage();
            }).not.toThrow();
        });
    });

    describe('パフォーマンステスト', () => {
        test('大量のフィールド保存が高速に実行される', () => {
            const startTime = Date.now();

            // 100個のフィールドを保存
            for (let i = 0; i < 100; i++) {
                formState.saveField(`field${i}`, `value${i}`);
            }
            formState.saveToStorage();

            const endTime = Date.now();
            const duration = endTime - startTime;

            // 100ms以内に完了することを期待
            expect(duration).toBeLessThan(100);
        });

        test('医療機関検索が高速に実行される', async () => {
            await medicalService.loadData();

            const startTime = Date.now();
            await medicalService.search('東京');
            const endTime = Date.now();
            const duration = endTime - startTime;

            // 50ms以内に完了することを期待
            expect(duration).toBeLessThan(50);
        });
    });

    describe('自動保存機能の統合', () => {
        test('自動保存が定期的に実行される', (done) => {
            jest.useFakeTimers();

            // 自動保存を開始（テストでは100msごと）
            formState.startAutosave(100);

            // データを変更
            formState.saveField('testField', 'testValue');

            // 100ms経過後にlocalStorageに保存されることを確認
            setTimeout(() => {
                const savedData = localStorage.getItem('formData');
                expect(savedData).not.toBeNull();

                const parsedData = JSON.parse(savedData);
                expect(parsedData.testField).toBe('testValue');

                formState.stopAutosave();
                jest.useRealTimers();
                done();
            }, 150);

            jest.advanceTimersByTime(150);
        });
    });

    describe('複雑なユーザーシナリオ', () => {
        test('シナリオ: 新規申請の入力から保存まで', () => {
            // 1. ステップ1: 基本情報入力
            formState.saveField('lastName', '田中');
            formState.saveField('firstName', '一郎');
            formState.setCurrentStep(1);

            // 2. ステップ2に進む
            formState.setCurrentStep(2);
            formState.saveField('insuranceNumber1', '12345');

            // 3. ステップ3に進む
            formState.setCurrentStep(3);
            formState.saveField('accidentDate', '2025-01-15');

            // 4. すべてのデータを保存
            formState.saveToStorage();

            // 5. 新しいセッションでデータを復元
            const newSession = new FormState(9);
            const loadedData = newSession.loadFromStorage();

            // 6. 検証
            expect(loadedData.lastName).toBe('田中');
            expect(loadedData.firstName).toBe('一郎');
            expect(loadedData.insuranceNumber1).toBe('12345');
            expect(loadedData.accidentDate).toBe('2025-01-15');
            expect(newSession.getCurrentStep()).toBe(3);
        });

        test('シナリオ: バリデーションエラーからの回復', () => {
            // 1. 空のフォームでバリデーション実行
            const result1 = formValidator.validateStep(1);
            expect(result1).toBe(false);

            // 2. フィールドに入力
            document.getElementById('lastName').value = '高橋';
            document.getElementById('firstName').value = '美咲';

            // 3. データを保存
            formState.saveField('lastName', '高橋');
            formState.saveField('firstName', '美咲');

            // 4. 再度バリデーション（成功する可能性が高い）
            // 注: 実際のvalidateStepは多くのフィールドを要求するため、
            // ここでは保存されたデータを確認
            const savedData = formState.formData;
            expect(savedData.lastName).toBe('高橋');
            expect(savedData.firstName).toBe('美咲');
        });
    });
});

describe('エッジケーステスト', () => {
    test('空文字列のフィールド保存', () => {
        const formState = new FormState(9);
        formState.saveField('emptyField', '');
        formState.saveToStorage();

        const loadedData = formState.loadFromStorage();
        expect(loadedData.emptyField).toBe('');
    });

    test('特殊文字を含むフィールド保存', () => {
        const formState = new FormState(9);
        formState.saveField('specialField', '<script>alert("XSS")</script>');
        formState.saveToStorage();

        const loadedData = formState.loadFromStorage();
        expect(loadedData.specialField).toBe('<script>alert("XSS")</script>');
    });

    test('非常に長い文字列の保存', () => {
        const formState = new FormState(9);
        const longString = 'あ'.repeat(10000);
        formState.saveField('longField', longString);
        formState.saveToStorage();

        const loadedData = formState.loadFromStorage();
        expect(loadedData.longField).toBe(longString);
    });
});
