/**
 * FormStateクラスのユニットテスト
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { FormState } from '../js/pages/application-form/FormState.js';

describe('FormState', () => {
    let formState;

    beforeEach(() => {
        // LocalStorageをクリア
        localStorage.clear();
        formState = new FormState(9);
    });

    describe('初期化', () => {
        test('デフォルト値で初期化される', () => {
            expect(formState.getCurrentStep()).toBe(1);
            expect(formState.getTotalSteps()).toBe(9);
        });

        test('カスタム総ステップ数で初期化できる', () => {
            const customFormState = new FormState(5);
            expect(customFormState.getTotalSteps()).toBe(5);
        });
    });

    describe('ステップ管理', () => {
        test('現在のステップを設定できる', () => {
            formState.setCurrentStep(3);
            expect(formState.getCurrentStep()).toBe(3);
        });

        test('無効なステップ番号は無視される', () => {
            formState.setCurrentStep(10); // 総ステップ9を超える
            expect(formState.getCurrentStep()).toBe(1); // 変更されない
        });

        test('ステップ0は無効', () => {
            formState.setCurrentStep(0);
            expect(formState.getCurrentStep()).toBe(1);
        });
    });

    describe('フィールド管理', () => {
        test('フィールドの値を保存・取得できる', () => {
            formState.saveField('lastName', '山田');
            expect(formState.getField('lastName')).toBe('山田');
        });

        test('複数のフィールドを保存できる', () => {
            formState.saveField('lastName', '山田');
            formState.saveField('firstName', '太郎');

            const allData = formState.getAllData();
            expect(allData.lastName).toBe('山田');
            expect(allData.firstName).toBe('太郎');
        });
    });

    describe('LocalStorage連携', () => {
        test('データを保存できる', () => {
            formState.saveField('testField', 'testValue');
            formState.saveToStorage();

            const saved = localStorage.getItem('formData');
            expect(saved).toBeTruthy();

            const parsed = JSON.parse(saved);
            expect(parsed.testField).toBe('testValue');
        });

        test('データを読み込める', () => {
            localStorage.setItem('formData', JSON.stringify({ lastName: '佐藤' }));
            localStorage.setItem('currentStep', '3');

            const newFormState = new FormState(9);
            expect(newFormState.getField('lastName')).toBe('佐藤');
            expect(newFormState.getCurrentStep()).toBe(3);
        });

        test('データをクリアできる', () => {
            formState.saveField('testField', 'testValue');
            formState.saveToStorage();
            formState.clearData();

            expect(localStorage.getItem('formData')).toBeNull();
            expect(formState.getAllData()).toEqual({});
        });
    });
});
