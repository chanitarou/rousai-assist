/**
 * MedicalInstitutionServiceクラスのユニットテスト
 */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { MedicalInstitutionService } from '../js/pages/application-form/MedicalInstitutionService.js';

// グローバルfetchをモック
global.fetch = jest.fn();

describe('MedicalInstitutionService', () => {
    let service;
    const mockData = [
        {
            id: '1300016',
            name: '独立行政法人労働者健康安全機構東京労災病院',
            postalCode: '143-0013',
            address: '大田区大森南４－１３－２１',
            phone: '03-3742-7301',
            region: '東京都',
            type: '労災病院'
        },
        {
            id: '1231332',
            name: '学校法人慈恵大学東京慈恵会医科大学附属柏病院',
            postalCode: '277-8567',
            address: '柏市柏下１６３－１',
            phone: '04-7164-1111',
            region: '千葉県',
            type: '総合病院'
        }
    ];

    beforeEach(() => {
        service = new MedicalInstitutionService();
        fetch.mockClear();
    });

    describe('データ読み込み', () => {
        test('データを正常に読み込める', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const data = await service.loadData();
            expect(data).toEqual(mockData);
            expect(service.isDataLoaded()).toBe(true);
        });

        test('2回目の読み込みはキャッシュを使用', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            await service.loadData();
            await service.loadData(); // 2回目

            expect(fetch).toHaveBeenCalledTimes(1); // fetchは1回だけ
        });

        test('読み込みエラーをハンドリング', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(service.loadData()).rejects.toThrow('Network error');
        });
    });

    describe('検索機能', () => {
        beforeEach(async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });
        });

        test('名前で検索できる', async () => {
            const results = await service.search('東京労災');
            expect(results).toHaveLength(1);
            expect(results[0].name).toContain('東京労災病院');
        });

        test('住所で検索できる', async () => {
            const results = await service.search('大田区');
            expect(results).toHaveLength(1);
            expect(results[0].address).toContain('大田区');
        });

        test('地域で検索できる', async () => {
            const results = await service.search('千葉');
            expect(results).toHaveLength(1);
            expect(results[0].region).toBe('千葉県');
        });

        test('空のクエリは空配列を返す', async () => {
            const results = await service.search('');
            expect(results).toEqual([]);
        });
    });

    describe('フィルタリング', () => {
        beforeEach(async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });
        });

        test('地域でフィルタできる', async () => {
            const results = await service.filterByRegion('東京都');
            expect(results).toHaveLength(1);
            expect(results[0].region).toBe('東京都');
        });

        test('種別でフィルタできる', async () => {
            const results = await service.filterByType('労災病院');
            expect(results).toHaveLength(1);
            expect(results[0].type).toBe('労災病院');
        });
    });

    describe('ID検索', () => {
        beforeEach(async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });
        });

        test('IDで医療機関を取得できる', async () => {
            const institution = await service.getById('1300016');
            expect(institution).toBeTruthy();
            expect(institution.name).toContain('東京労災病院');
        });

        test('存在しないIDはnullを返す', async () => {
            const institution = await service.getById('999999');
            expect(institution).toBeNull();
        });
    });
});
