/**
 * FormNavigator.js のテストスイート
 */

import { FormNavigator, STEP_DEFINITIONS } from '../js/pages/application-form/FormNavigator.js';
import { FormState } from '../js/pages/application-form/FormState.js';

// DOM環境のモック
global.document = {
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => [])
};

global.window = {
    scrollTo: jest.fn(),
    location: { href: '' },
    localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn()
    }
};

describe('FormNavigator', () => {
    let navigator;
    let formState;
    let mockValidateFn;

    beforeEach(() => {
        formState = new FormState(9);
        mockValidateFn = jest.fn(() => true);
        navigator = new FormNavigator(formState, mockValidateFn);
        jest.clearAllMocks();
    });

    describe('STEP_DEFINITIONS', () => {
        test('ステップ定義が正しく設定されている', () => {
            expect(STEP_DEFINITIONS).toHaveLength(9);
            expect(STEP_DEFINITIONS[0]).toEqual({ id: 1, label: '基本情報', role: 'worker' });
            expect(STEP_DEFINITIONS[5]).toEqual({ id: 6, label: '事業主情報', role: 'employer' });
            expect(STEP_DEFINITIONS[8]).toEqual({ id: 9, label: '確認・提出', role: 'worker' });
        });
    });

    describe('getNextStep', () => {
        test('通常のステップ遷移', () => {
            expect(navigator.getNextStep(1)).toBe(2);
            expect(navigator.getNextStep(2)).toBe(3);
            expect(navigator.getNextStep(7)).toBe(8);
        });

        test('ステップ8の次はステップ10にスキップ', () => {
            expect(navigator.getNextStep(8)).toBe(10);
        });
    });

    describe('getPreviousStep', () => {
        test('通常のステップ遷移', () => {
            expect(navigator.getPreviousStep(2)).toBe(1);
            expect(navigator.getPreviousStep(3)).toBe(2);
            expect(navigator.getPreviousStep(8)).toBe(7);
        });

        test('ステップ10の前はステップ8にスキップ', () => {
            expect(navigator.getPreviousStep(10)).toBe(8);
        });
    });

    describe('getProgressStep', () => {
        test('通常のステップは同じ番号を返す', () => {
            expect(navigator.getProgressStep(1)).toBe(1);
            expect(navigator.getProgressStep(5)).toBe(5);
            expect(navigator.getProgressStep(8)).toBe(8);
        });

        test('ステップ10は進捗バーのステップ9として表示', () => {
            expect(navigator.getProgressStep(10)).toBe(9);
        });
    });

    describe('activateStep', () => {
        test('ステップ要素をアクティブ化する', () => {
            const mockElement = {
                classList: { add: jest.fn() },
                style: { display: '' }
            };
            document.getElementById.mockReturnValue(mockElement);

            navigator.activateStep(2);

            expect(document.getElementById).toHaveBeenCalledWith('step-2');
            expect(mockElement.classList.add).toHaveBeenCalledWith('active');
        });

        test('存在しないステップの場合はエラーログ', () => {
            document.getElementById.mockReturnValue(null);

            navigator.activateStep(99);

            expect(document.getElementById).toHaveBeenCalledWith('step-99');
        });
    });

    describe('deactivateStep', () => {
        test('ステップ要素を非アクティブ化する', () => {
            const mockElement = {
                classList: { remove: jest.fn() }
            };
            document.getElementById.mockReturnValue(mockElement);

            navigator.deactivateStep(2);

            expect(document.getElementById).toHaveBeenCalledWith('step-2');
            expect(mockElement.classList.remove).toHaveBeenCalledWith('active');
        });
    });

    describe('nextStep', () => {
        test('バリデーション成功時は次のステップへ進む', async () => {
            mockValidateFn.mockReturnValue(true);
            formState.setCurrentStep(1);

            const mockCurrentStep = { classList: { remove: jest.fn() } };
            const mockNextStep = {
                classList: { add: jest.fn() },
                style: { display: '' }
            };

            document.getElementById.mockImplementation((id) => {
                if (id === 'step-1') return mockCurrentStep;
                if (id === 'step-2') return mockNextStep;
                return null;
            });

            const result = await navigator.nextStep();

            expect(result).toBe(true);
            expect(mockValidateFn).toHaveBeenCalledWith(1);
            expect(formState.getCurrentStep()).toBe(2);
            expect(mockCurrentStep.classList.remove).toHaveBeenCalledWith('active');
            expect(mockNextStep.classList.add).toHaveBeenCalledWith('active');
        });

        test('バリデーション失敗時は次のステップへ進まない', async () => {
            mockValidateFn.mockReturnValue(false);
            formState.setCurrentStep(1);

            const result = await navigator.nextStep();

            expect(result).toBe(false);
            expect(formState.getCurrentStep()).toBe(1);
        });

        test('バリデーションスキップ時は常に次へ進む', async () => {
            formState.setCurrentStep(1);

            document.getElementById.mockImplementation((id) => {
                return {
                    classList: { add: jest.fn(), remove: jest.fn() },
                    style: { display: '' }
                };
            });

            const result = await navigator.nextStep(true);

            expect(result).toBe(true);
            expect(mockValidateFn).not.toHaveBeenCalled();
            expect(formState.getCurrentStep()).toBe(2);
        });

        test('ステップ5の場合は回覧セクションを表示', async () => {
            mockValidateFn.mockReturnValue(true);
            formState.setCurrentStep(5);

            const mockCirculation = {
                classList: { add: jest.fn() }
            };
            document.getElementById.mockReturnValue(mockCirculation);

            const result = await navigator.nextStep();

            expect(result).toBe(true);
            expect(formState.getCurrentStep()).toBe(5); // ステップは変わらない
        });
    });

    describe('previousStep', () => {
        test('前のステップへ戻る', () => {
            formState.setCurrentStep(3);

            const mockCurrentStep = { classList: { remove: jest.fn() } };
            const mockPrevStep = {
                classList: { add: jest.fn() },
                style: { display: '' }
            };

            document.getElementById.mockImplementation((id) => {
                if (id === 'step-3') return mockCurrentStep;
                if (id === 'step-2') return mockPrevStep;
                return null;
            });

            const result = navigator.previousStep();

            expect(result).toBe(true);
            expect(formState.getCurrentStep()).toBe(2);
            expect(mockCurrentStep.classList.remove).toHaveBeenCalledWith('active');
            expect(mockPrevStep.classList.add).toHaveBeenCalledWith('active');
        });

        test('ステップ10から戻る場合はステップ8へ', () => {
            formState.setCurrentStep(10);

            document.getElementById.mockImplementation((id) => {
                return {
                    classList: { add: jest.fn(), remove: jest.fn() },
                    style: { display: '' }
                };
            });

            navigator.previousStep();

            expect(formState.getCurrentStep()).toBe(8);
        });
    });

    describe('nextStepDev', () => {
        test('ステップ6の場合は事業主完了として回覧完了画面へ遷移', () => {
            formState.setCurrentStep(6);

            document.getElementById.mockReturnValue(null);

            const result = navigator.nextStepDev();

            expect(result).toBe(true);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('completedBy', 'employer');
            expect(window.location.href).toBe('労災申請アシストサイト_回覧完了画面.html');
        });

        test('ステップ8の場合は医療機関完了として回覧完了画面へ遷移', () => {
            formState.setCurrentStep(8);

            document.getElementById.mockReturnValue(null);

            const result = navigator.nextStepDev();

            expect(result).toBe(true);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('completedBy', 'medical');
            expect(window.location.href).toBe('労災申請アシストサイト_回覧完了画面.html');
        });

        test('回覧セクション表示中の場合は回覧完了画面へ遷移', () => {
            const mockCirculation = {
                classList: {
                    contains: jest.fn(() => true)
                }
            };
            document.getElementById.mockReturnValue(mockCirculation);

            const result = navigator.nextStepDev();

            expect(result).toBe(true);
            expect(window.location.href).toBe('労災申請アシストサイト_回覧完了画面.html');
        });
    });

    describe('updateProgress', () => {
        test('プログレスバーと現在ステップを更新', () => {
            formState.setCurrentStep(3);

            const mockProgressBar = { style: { width: '' } };
            const mockStepText = { textContent: '' };
            const mockProgressItems = [
                { classList: { add: jest.fn(), remove: jest.fn() } },
                { classList: { add: jest.fn(), remove: jest.fn() } },
                { classList: { add: jest.fn(), remove: jest.fn() } }
            ];

            document.querySelector.mockReturnValue(mockProgressBar);
            document.getElementById.mockReturnValue(mockStepText);
            document.querySelectorAll.mockReturnValue(mockProgressItems);

            navigator.updateProgress();

            expect(mockProgressBar.style.width).toBe('33.333333333333336%'); // 3/9 * 100
            expect(mockStepText.textContent).toBe(3);
        });
    });

    describe('goToStep', () => {
        test('指定したステップへ直接移動', () => {
            formState.setCurrentStep(1);

            document.getElementById.mockImplementation((id) => {
                return {
                    classList: { add: jest.fn(), remove: jest.fn() },
                    style: { display: '' }
                };
            });

            const result = navigator.goToStep(5);

            expect(result).toBe(true);
            expect(formState.getCurrentStep()).toBe(5);
        });

        test('無効なステップ番号の場合はfalseを返す', () => {
            const result1 = navigator.goToStep(0);
            const result2 = navigator.goToStep(11);

            expect(result1).toBe(false);
            expect(result2).toBe(false);
        });
    });

    describe('showCirculationSection', () => {
        test('回覧セクションを表示', () => {
            const mockCirculation = {
                classList: { add: jest.fn() }
            };
            document.getElementById.mockReturnValue(mockCirculation);

            navigator.showCirculationSection();

            expect(mockCirculation.classList.add).toHaveBeenCalledWith('active');
        });
    });

    describe('hideCirculationSection', () => {
        test('回覧セクションを非表示', () => {
            const mockCirculation = {
                classList: { remove: jest.fn() }
            };
            document.getElementById.mockReturnValue(mockCirculation);

            navigator.hideCirculationSection();

            expect(mockCirculation.classList.remove).toHaveBeenCalledWith('active');
        });
    });
});
