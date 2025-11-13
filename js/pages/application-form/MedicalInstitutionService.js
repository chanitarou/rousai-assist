/**
 * 医療機関サービスクラス
 *
 * 労災保険指定医療機関のデータ管理と検索機能を提供します。
 * データは外部JSONファイルから遅延ロードされます。
 *
 * @class MedicalInstitutionService
 * @version 1.0.0
 */
export class MedicalInstitutionService {
    constructor() {
        /**
         * @type {Array|null}
         */
        this._data = null;
        this.dataUrl = 'data/medical-institutions.json';
    }

    /**
     * 医療機関データを読み込み
     * @returns {Promise<Array>} 医療機関データの配列
     */
    async loadData() {
        if (this._data) {
            return this._data;
        }

        try {
            const response = await fetch(this.dataUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this._data = await response.json();
            return this._data;
        } catch (error) {
            console.error('MedicalInstitutionService: データの読み込みに失敗しました', error);
            throw error;
        }
    }

    /**
     * 医療機関を検索
     * @param {string} query - 検索クエリ（医療機関名、住所、地域）
     * @returns {Promise<Array>} 検索結果の配列
     */
    async search(query) {
        if (!this._data) {
            await this.loadData();
        }

        if (!query || query.trim() === '') {
            return [];
        }

        const normalizedQuery = query.trim().toLowerCase();

        return this._data.filter(institution => {
            return (
                institution.name.toLowerCase().includes(normalizedQuery) ||
                institution.address.toLowerCase().includes(normalizedQuery) ||
                institution.region.toLowerCase().includes(normalizedQuery)
            );
        });
    }

    /**
     * IDで医療機関を取得
     * @param {string} id - 医療機関ID
     * @returns {Promise<Object|null>} 医療機関データまたはnull
     */
    async getById(id) {
        if (!this._data) {
            await this.loadData();
        }

        return this._data.find(institution => institution.id === id) || null;
    }

    /**
     * 地域で医療機関を絞り込み
     * @param {string} region - 地域名（例: '東京都', '千葉県'）
     * @returns {Promise<Array>} 該当する医療機関の配列
     */
    async filterByRegion(region) {
        if (!this._data) {
            await this.loadData();
        }

        return this._data.filter(institution => institution.region === region);
    }

    /**
     * 種別で医療機関を絞り込み
     * @param {string} type - 医療機関の種別（例: '総合病院', '診療所'）
     * @returns {Promise<Array>} 該当する医療機関の配列
     */
    async filterByType(type) {
        if (!this._data) {
            await this.loadData();
        }

        return this._data.filter(institution => institution.type === type);
    }

    /**
     * データがロード済みかどうかを確認
     * @returns {boolean} ロード済みならtrue
     */
    isDataLoaded() {
        return this._data !== null;
    }

    /**
     * データをクリア（再読み込み用）
     */
    clearCache() {
        this._data = null;
    }
}
