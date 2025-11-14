# リファクタリング フェーズ2 実施記録

## 実施日
2025年11月13日

## 目的
Issue #22で提案されたリファクタリングを実施し、コードの可読性・再利用性・保守性を向上させる。

---

## 実施内容

### 1. ディレクトリ構造の整理

新しいディレクトリを作成：

```
rousai-assist/
├── js/
│   ├── core/                          # 新規：コアユーティリティ
│   │   ├── Logger.js
│   │   ├── EventManager.js
│   │   ├── DOMCache.js
│   │   └── A11yHelper.js
│   └── pages/
│       └── application-form/          # 新規：申請フォームモジュール
│           ├── FormState.js
│           └── MedicalInstitutionService.js
├── data/                              # 新規：データファイル
│   └── medical-institutions.json
└── tests/                             # 新規：テストファイル
    ├── FormState.test.js
    └── MedicalInstitutionService.test.js
```

### 2. コアユーティリティクラスの実装

#### Logger.js
- **目的**: 環境別のログレベル制御、エラーメッセージの日本語化
- **機能**:
  - 開発環境（localhost）: DEBUGレベルで詳細ログ
  - 本番環境: ERRORレベルのみ
  - ErrorMessageHelper: エラーコードから日本語メッセージへの変換
- **使用例**:
  ```javascript
  import { Logger } from './js/core/Logger.js';
  const logger = new Logger('FormValidator');
  logger.debug('バリデーション開始');
  logger.error('バリデーションエラー', error);
  ```

#### EventManager.js
- **目的**: イベントリスナーの一元管理、重複防止
- **機能**:
  - イベントリスナーの登録・解除
  - 重複登録の自動防止
  - 一括クリーンアップ
- **使用例**:
  ```javascript
  import { EventManager } from './js/core/EventManager.js';
  const eventManager = new EventManager();
  eventManager.on(button, 'click', handleClick);
  eventManager.cleanup(); // すべて解除
  ```

#### DOMCache.js
- **目的**: DOM検索結果のキャッシュ化によるパフォーマンス向上
- **機能**:
  - querySelector/querySelectorAllの結果をキャッシュ
  - 繰り返し検索の削減
- **使用例**:
  ```javascript
  import { DOMCache } from './js/core/DOMCache.js';
  const cache = new DOMCache();
  const button = cache.get('#submitButton'); // 1回目: DOM検索
  const button2 = cache.get('#submitButton'); // 2回目: キャッシュから取得
  ```

#### A11yHelper.js
- **目的**: WCAG準拠のアクセシビリティ機能
- **機能**:
  - フォーカストラップ（モーダル用）
  - ライブリージョン通知（スクリーンリーダー対応）
  - エラー状態のARIA属性管理
  - ボタンのロード中状態管理
- **使用例**:
  ```javascript
  import { A11yHelper } from './js/core/A11yHelper.js';
  A11yHelper.announce('フォームを送信しました', 'polite');
  A11yHelper.focusElement(errorField);
  ```

### 3. アプリケーションフォームモジュールの作成

#### FormState.js
- **目的**: フォーム状態の一元管理
- **機能**:
  - 現在のステップ管理
  - フォームデータの保存・読み込み
  - LocalStorageとの連携
  - 自動保存（30秒間隔）
- **削減効果**: グローバル変数の削除、状態管理の明確化
- **使用例**:
  ```javascript
  import { FormState } from './js/pages/application-form/FormState.js';
  const formState = new FormState(9);
  formState.saveField('lastName', '山田');
  formState.startAutosave(); // 自動保存開始
  ```

#### MedicalInstitutionService.js
- **目的**: 医療機関データの管理と検索
- **機能**:
  - JSONファイルからの遅延ロード
  - 医療機関の検索（名前・住所・地域）
  - 地域・種別によるフィルタリング
  - IDによる取得
- **削減効果**: application-form.jsから約270行のデータを分離
- **使用例**:
  ```javascript
  import { MedicalInstitutionService } from './js/pages/application-form/MedicalInstitutionService.js';
  const service = new MedicalInstitutionService();
  const results = await service.search('東京労災');
  ```

### 4. データファイルの分離

#### medical-institutions.json
- **内容**: 30件の労災保険指定医療機関データ
- **効果**:
  - JavaScriptとデータの分離
  - データの保守性向上
  - 将来的なAPI化への準備

### 5. テスト環境のセットアップ

#### package.json
- **追加した依存関係**:
  - Jest: ユニットテストフレームワーク
  - ESLint: コード品質チェック
  - Prettier: コードフォーマッター
- **NPMスクリプト**:
  - `npm test`: テスト実行
  - `npm run lint`: リンター実行
  - `npm run format`: コードフォーマット
  - `npm run serve`: ローカルサーバー起動

#### テストファイル
- **FormState.test.js**: FormStateクラスの単体テスト
  - 初期化テスト
  - ステップ管理テスト
  - フィールド管理テスト
  - LocalStorage連携テスト
- **MedicalInstitutionService.test.js**: 医療機関サービステスト
  - データ読み込みテスト
  - 検索機能テスト
  - フィルタリングテスト

#### 設定ファイル
- **jest.config.js**: Jest設定
- **.eslintrc.json**: ESLint設定（4スペースインデント、シングルクォート）
- **.prettierrc.json**: Prettier設定

---

## 改善効果

### 可読性向上
- ✅ 関心の分離（状態管理、ロギング、アクセシビリティが独立）
- ✅ 明確なモジュール境界
- ✅ JSDocによる型情報の明示

### 再利用性向上
- ✅ Logger, EventManager, DOMCache, A11yHelperは他のプロジェクトでも使用可能
- ✅ MedicalInstitutionServiceは独立したサービスとして機能

### バグ削減
- ✅ ユニットテストによる品質保証
- ✅ ESLintによる潜在的なバグの検出
- ✅ 型安全性の向上（JSDoc）

### 保守性向上
- ✅ データとロジックの分離
- ✅ テストコードによる仕様の明確化
- ✅ リンター・フォーマッターによるコードスタイルの統一

### パフォーマンス改善
- ✅ DOMCacheによる繰り返し検索の削減
- ✅ 医療機関データの遅延ロード
- ✅ EventManagerによる重複リスナー防止

---

## 今後の作業（フェーズ3）

### 残存課題
1. **application-form.jsの完全なモジュール分割**
   - FormValidator.js（バリデーションロジック）
   - FormNavigator.js（ステップナビゲーション）
   - FormRenderer.js（UI更新処理）
   - index.js（メインエントリーポイント）

2. **CSS重複の削除**
   - application-form.cssとdesign-system.cssの変数統一
   - レスポンシブブレークポイントの統一

3. **HTMLファイルの更新**
   - ES6 moduleとしてJSを読み込む
   - アクセシビリティ属性の追加
   - メタタグの統一

4. **追加テストの作成**
   - バリデーションロジックのテスト
   - UI操作の統合テスト

### 移行ガイドライン

#### 既存コードの使用方法
現時点では、既存の`js/pages/application-form.js`は変更していません。
新しいモジュールを使用する場合は、以下のように段階的に移行できます：

**ステップ1**: テスト環境のセットアップ
```bash
npm install
npm test
```

**ステップ2**: 新しいモジュールの利用開始
```html
<script type="module">
import { FormState } from './js/pages/application-form/FormState.js';
import { Logger } from './js/core/Logger.js';

const formState = new FormState(9);
const logger = new Logger('Application');
</script>
```

**ステップ3**: 既存関数の置き換え
```javascript
// 旧: グローバル変数
let currentStep = 1;
let formData = {};

// 新: FormStateクラス
const formState = new FormState(9);
formState.setCurrentStep(1);
formState.saveField('lastName', '山田');
```

---

## 技術的な決定事項

### なぜモジュール分割を段階的に行うか

1. **リスク管理**: 一度にすべてを変更すると、既存機能が動作しなくなるリスクが高い
2. **テスト**: 小さな単位で変更し、テストしながら進める
3. **互換性**: 既存のHTMLファイルとの互換性を維持

### なぜES6 Modulesを使用するか

1. **標準規格**: ブラウザのネイティブサポート
2. **依存関係**: 明示的なimport/export
3. **将来性**: バンドルツール（Webpack, Vite等）への移行が容易

### なぜJestを選択したか

1. **人気**: JavaScriptテストフレームワークのデファクトスタンダード
2. **機能**: スナップショットテスト、モック、カバレッジレポート
3. **ドキュメント**: 豊富な日本語ドキュメント

---

## 参考資料

- [デジタル庁デザインシステム](https://design.digital.go.jp/dads/)
- [Jest公式ドキュメント](https://jestjs.io/)
- [ESLint公式ドキュメント](https://eslint.org/)
- [WCAG 2.1ガイドライン](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2025-11-13 | フェーズ2リファクタリング実施 | Claude (Issue #22) |
| 2025-10-XX | フェーズ1リファクタリング（CSS/JS分離） | - |
