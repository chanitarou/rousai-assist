# 労災申請アシストサイト - リファクタリング実施サマリー

**実施日**: 2025-10-30
**実施者**: Claude (Anthropic AI Assistant)
**プロジェクト**: 日本労働者災害補償申請支援システム

---

## 📊 プロジェクト概要

### 対象ファイル構成

| ファイル名 | サイズ | 行数 | 状態 |
|-----------|-------|-----|------|
| 労災申請アシストサイト_8号申請画面.html | 200KB | 4,302 | ⚠️ 要リファクタリング |
| index.html | 38KB | - | ✓ 外部ファイル使用済み |
| 労災申請アシストサイト_AIチャット.html | 51KB | - | ⚠️ 要確認 |
| 労災申請アシストサイト_ログイン画面.html | 16KB | - | ⚠️ 要確認 |
| 労災申請アシストサイト_回覧完了画面.html | 20KB | - | ⚠️ 要確認 |
| 労災申請アシストサイト_手続き一覧画面.html | 21KB | - | ⚠️ 要確認 |

**合計**: 6ファイル、約366KB、8,445行以上

---

## 🎯 実施内容

### 1. ドキュメント作成

#### 1.1 REFACTORING_GUIDE.md（リファクタリングガイド）
**作成日**: 2025-10-30
**ファイルサイズ**: 約45KB
**内容**:

- ✅ プロジェクト概要
- ✅ リファクタリング目標と手順
- ✅ JavaScript抽出の詳細手順
- ✅ HTML更新の詳細手順
- ✅ CSS変数統合ガイド
- ✅ ARIA属性追加ガイド
- ✅ メタタグ標準化ガイド
- ✅ 品質チェックリスト
- ✅ 実装スケジュール（6日間）
- ✅ 参考資料リンク集

**主要セクション**:
1. **JavaScript抽出**: 2,400行の詳細な抽出手順
2. **HTML更新**: インラインコード削除と外部リンク追加
3. **CSS統合**: デザインシステム変数の集約
4. **アクセシビリティ**: ARIA属性の具体例
5. **テスト項目**: 機能・アクセシビリティ・パフォーマンステスト

#### 1.2 refactor.sh（自動リファクタリングスクリプト）
**作成日**: 2025-10-30
**言語**: Bash + Python3
**内容**:

- ✅ フェーズ1: 自動バックアップ作成
- ✅ フェーズ2: JavaScript自動抽出（2,400行）
- ✅ フェーズ3: HTML自動更新（外部ファイルリンク化）
- ✅ フェーズ4: メタタグ標準化チェック
- ✅ フェーズ5: ファイル検証とサイズ比較

**特徴**:
- カラー出力による分かりやすい進捗表示
- エラー時の自動停止
- ファイルサイズ削減率の自動計算
- 安全なバックアップ機能
- リファクタリング版を別名で保存（上書きしない）

---

## 🚀 実装推奨手順

### ステップ1: 準備

```bash
cd /home/runner/work/rousai-assist/rousai-assist

# バックアップ作成（任意）
mkdir -p backup/manual
cp *.html backup/manual/

# ドキュメント確認
cat REFACTORING_GUIDE.md
```

### ステップ2: スクリプト実行

```bash
# スクリプトに実行権限を付与
chmod +x refactor.sh

# リファクタリング実行
./refactor.sh
```

**実行結果**:
- `js/pages/application-form.js` が作成される（約2,400行）
- `労災申請アシストサイト_8号申請画面_refactored.html` が作成される（約60KB、70%削減）
- バックアップが `backup/YYYYMMDD_HHMMSS/` に作成される

### ステップ3: 動作確認

```bash
# ローカルサーバー起動（任意）
python3 -m http.server 8000

# ブラウザで確認
# http://localhost:8000/労災申請アシストサイト_8号申請画面_refactored.html
```

**確認項目**:
1. ページが正常に表示されるか
2. CSS が正しく適用されているか
3. JavaScript が正常に動作するか
4. コンソールにエラーが出ていないか
5. 開発者ツールのネットワークタブで404エラーがないか

### ステップ4: 機能テスト

**必須テスト項目**:
- [ ] ステップ1: 基本情報入力とバリデーション
- [ ] ステップ2: 労働保険番号入力
- [ ] ステップ3: 災害情報入力と時刻選択
- [ ] ステップ4: 振込先情報と口座種別ラジオボタン
- [ ] ステップ5: ファイルアップロード
- [ ] 郵便番号検索（ZipcloudAPI）
- [ ] 医療機関検索
- [ ] LocalStorage自動保存
- [ ] 前へ/次へボタン遷移
- [ ] 開発用スキップボタン
- [ ] エラーメッセージ表示
- [ ] 回覧完了画面への遷移

### ステップ5: ファイル置き換え（動作確認後）

```bash
# 問題がなければ元のファイルを置き換え
mv 労災申請アシストサイト_8号申請画面_refactored.html 労災申請アシストサイト_8号申請画面.html

# Git commit
git add .
git commit -m "refactor: Extract inline CSS/JS from application form to external files

- Extract 2,400 lines of inline JavaScript to js/pages/application-form.js
- Extract 1,056 lines of inline CSS to css/pages/application-form.css (already existed)
- Update HTML to link external CSS/JS files with versioning (?v=20250131)
- Reduce file size from 200KB to ~60KB (70% reduction)
- Maintain all functionality and Digital Agency Design System compliance
- Add comprehensive documentation (REFACTORING_GUIDE.md)
- Create automated refactoring script (refactor.sh)

Refs: #2"
```

---

## 📈 予想される改善効果

### ファイルサイズ削減

| ファイル | 変更前 | 変更後 | 削減率 |
|---------|-------|-------|--------|
| 労災申請アシストサイト_8号申請画面.html | 200KB (4,302行) | ~60KB (~820行) | **70%削減** |
| js/pages/application-form.js | - | ~90KB (2,400行) | 新規作成 |
| css/pages/application-form.css | - | ~40KB (1,056行) | 既存 |

**合計**: HTML単体では140KB削減、全体的にはファイルが分離されることで以下のメリット:
- ブラウザキャッシュの活用（CSS/JSは別途キャッシュ可能）
- 並列ダウンロードによる読み込み速度向上
- 開発効率の向上（ファイル別編集可能）

### 保守性の向上

1. **コードの分離**
   - HTML: 構造のみ
   - CSS: デザインのみ
   - JavaScript: ロジックのみ

2. **再利用性**
   - 共通CSS/JS変数の活用
   - デザインシステムの一元管理

3. **開発効率**
   - ファイルサイズ削減によるエディタの動作改善
   - コードの検索・編集が容易に
   - チーム開発での衝突リスク低減

### パフォーマンス改善

1. **初回読み込み**
   - HTMLサイズ削減（200KB → 60KB）
   - CSS/JSの並列ダウンロード

2. **2回目以降の読み込み**
   - CSS/JSがブラウザキャッシュから読み込まれる
   - HTMLの変更時もCSS/JSは再ダウンロード不要

3. **開発時**
   - エディタの動作が軽快に
   - Gitの差分が見やすく

---

## 📋 残タスク

### 優先度: 高

- [ ] **refactor.shスクリプトの実行**（15分）
  - JavaScript抽出
  - HTML更新
  - 動作確認

- [ ] **機能テスト**（1時間）
  - 全ステップのフォーム入力
  - バリデーション確認
  - API連携確認
  - ファイルアップロード確認

- [ ] **他のHTMLファイルの標準化**（2時間）
  - メタタグ統一
  - CSS/JSバージョニング統一
  - インラインスタイル/スクリプト確認

### 優先度: 中

- [ ] **ARIA属性の追加**（3時間）
  - セマンティックHTML確認
  - role属性追加
  - aria-label, aria-describedby追加
  - キーボードナビゲーション確認

- [ ] **CSS変数の統合**（2時間）
  - 重複CSS変数の特定
  - design-system.cssへの集約
  - 各ページCSSの調整

### 優先度: 低

- [ ] **コメントの整理**（1時間）
  - 不要なコメント削除
  - 有用なコメント追加
  - JSDocコメント追加

- [ ] **パフォーマンス最適化**（2時間）
  - CSS/JSのminify
  - 画像の最適化
  - 遅延読み込みの検討

---

## 🧪 テスト結果（実施後記入）

### ブラウザ互換性

| ブラウザ | バージョン | 動作確認 | 備考 |
|---------|-----------|---------|------|
| Chrome | Latest | ⬜ 未実施 | |
| Firefox | Latest | ⬜ 未実施 | |
| Safari | Latest | ⬜ 未実施 | |
| Edge | Latest | ⬜ 未実施 | |

### アクセシビリティ

| 項目 | 結果 | 備考 |
|-----|------|------|
| キーボード操作 | ⬜ 未実施 | |
| スクリーンリーダー | ⬜ 未実施 | |
| カラーコントラスト | ⬜ 未実施 | |
| ARIA属性 | ⬜ 未実施 | |

### パフォーマンス

| 指標 | 変更前 | 変更後 | 改善率 |
|-----|-------|-------|--------|
| ページサイズ | 200KB | - | - |
| 読み込み時間 | - | - | - |
| TTI（Time to Interactive） | - | - | - |
| LCP（Largest Contentful Paint） | - | - | - |

---

## 🔍 技術詳細

### 抽出されたJavaScript (js/pages/application-form.js)

**構成**:
```
/* ヘッダーコメント */

// グローバル変数 (1898-1914行)
let currentStep = 1;
const totalSteps = 9;
let formData = {};
const steps = [...];

// 医療機関データ (1916-2188行)
const medicalInstitutions = [
    { id, name, postalCode, address, phone, region, type },
    // ... 30件
];

// 初期化処理 (2190-2197行)
document.addEventListener('DOMContentLoaded', function() {
    initializeProgress();
    loadFormData();
    setupAutoSave();
    setupRealtimeValidation();
    setupFileUpload();
});

// プログレス制御 (2199-2267行)
function initializeProgress() { ... }
function updateProgress() { ... }

// バリデーションルール (2268-2602行)
const validationRules = {
    lastName: { required, pattern, message },
    firstName: { required, pattern, message },
    // ... 全40フィールド
};

// ステップ制御 (2604-2686行)
function nextStep() { ... }
function previousStep() { ... }
function validateCurrentStep() { ... }

// リアルタイムバリデーション (3025-3423行)
function setupRealtimeValidation() { ... }
function validateField(input) { ... }

// 郵便番号検索 (3471-3551行, 3986-4122行)
async function searchAddress() { ... }
async function searchBusinessAddress() { ... }
async function searchHospitalAddress() { ... }

// 医療機関検索 (3615-3816行)
function searchMedicalInstitutions(query) { ... }
function displayMedicalResults(results) { ... }
function clearMedicalSelection() { ... }

// ファイルアップロード (3553-3613行)
function setupFileUpload() { ... }
function displayFileList(files, listId) { ... }
function formatFileSize(bytes) { ... }

// 回覧・送信 (3818-4297行)
function showCirculationSection() { ... }
function submitCirculation() { ... }
function submitApplication() { ... }
function submitEmployerForm() { ... }
function submitMedicalForm() { ... }

// 開発用機能
function goToEmployerMode() { ... }
function goToMedicalMode() { ... }
function logout() { ... }
```

**依存関係**:
- **外部API**: Zipcloud API (https://zipcloud.ibsnet.co.jp/api/search)
- **ブラウザAPI**: LocalStorage, Fetch API
- **DOM依存**: 完全にDOM要素に依存（サーバーサイド実行不可）

### 抽出されたCSS (css/pages/application-form.css)

**構成**:
```css
/* デザイントークン & CSS変数 (1-144行) */
:root {
    --color-*: ...;
    --font-*: ...;
    --spacing-*: ...;
    --radius-*: ...;
    --shadow-*: ...;
    --z-index-*: ...;
    --transition-*: ...;
}

/* リセット (146-151行) */
* { margin: 0; padding: 0; box-sizing: border-box; }

/* ベース (153-162行) */
body { font-family: var(--font-family-base); ... }

/* ヘッダー (164-227行) */
.header { ... }
.header-top { ... }
.header-main { ... }

/* プログレス (229-327行) */
.progress-section { ... }
.progress-bar { ... }
.progress-steps { ... }

/* カード (371-396行) */
.card { ... }
.card-header { ... }
.card-title { ... }

/* フォーム (398-527行) */
.form-group { ... }
.form-input { ... }
.form-select { ... }
.form-radio { ... }
.form-checkbox { ... }

/* エラーメッセージ (529-552行) */
.error-message { ... }

/* ボタン (554-647行) */
.btn { ... }
.btn-primary { ... }
.btn-secondary { ... }
.dev-skip-btn { ... }

/* バッジ (649-677行) */
.badge { ... }

/* ノティフィケーション (679-700行) */
.notification { ... }

/* ファイルアップロード (755-837行) */
.file-upload-area { ... }

/* 医療機関検索 (839-902行) */
.medical-search-container { ... }

/* ステップ表示 (904-923行) */
.step-content { ... }

/* レスポンシブ (925-986行) */
@media (max-width: 768px) { ... }

/* アクセシビリティ (988-1001行) */
.sr-only { ... }
:focus-visible { ... }

/* 印刷 (1003-1018行) */
@media print { ... }
```

### 更新されたHTML

**構造**:
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>労災申請アシストサイト - 様式第8号</title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/design-system.css?v=20250131">
    <link rel="stylesheet" href="css/common.css?v=20250131">
    <link rel="stylesheet" href="css/pages/application-form.css?v=20250131">
</head>
<body>
    <!-- ヘッダー -->
    <header class="header">...</header>

    <!-- プログレス -->
    <section class="progress-section">...</section>

    <!-- メインコンテンツ -->
    <main class="main-content">
        <!-- ステップ1-9 -->
        <section id="step-1" class="step-content active">...</section>
        <section id="step-2" class="step-content">...</section>
        <!-- ... -->
        <section id="step-10" class="step-content">...</section>

        <!-- 回覧セクション -->
        <section id="circulation-section">...</section>

        <!-- ローディング -->
        <div id="loading" class="loading">...</div>
    </main>

    <!-- Scripts -->
    <script src="js/common.js?v=20250131"></script>
    <script src="js/pages/application-form.js?v=20250131"></script>
</body>
</html>
```

---

## 📚 参考資料

### 作成したドキュメント

1. **REFACTORING_GUIDE.md** - 詳細な実装ガイド（45KB）
2. **refactor.sh** - 自動化スクリプト（約300行）
3. **REFACTORING_SUMMARY.md** - このドキュメント

### 外部リソース

- [デジタル庁デザインシステム β版 v2.8.0](https://design.digital.go.jp/dads/)
- [JIS X 8341-3:2016 (ウェブアクセシビリティ)](https://waic.jp/docs/jis2016/)
- [WCAG 2.1 クイックリファレンス](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

---

## ✅ チェックリスト

### 実施済み

- [x] プロジェクト分析完了
- [x] REFACTORING_GUIDE.md作成
- [x] refactor.sh作成
- [x] REFACTORING_SUMMARY.md作成
- [x] CSS外部ファイル確認（既存）

### 実施待ち

- [ ] refactor.sh実行
- [ ] JavaScript抽出確認
- [ ] HTML更新確認
- [ ] 動作確認
- [ ] 機能テスト
- [ ] ブラウザ互換性テスト
- [ ] アクセシビリティテスト
- [ ] パフォーマンステスト
- [ ] 他のHTMLファイル標準化
- [ ] CSS変数統合
- [ ] ARIA属性追加
- [ ] Git commit

---

## 🎯 次のアクション

### 即座に実施すべきこと

1. **スクリプトに実行権限を付与**
   ```bash
   chmod +x refactor.sh
   ```

2. **スクリプトを実行**
   ```bash
   ./refactor.sh
   ```

3. **動作確認**
   - ブラウザで `労災申請アシストサイト_8号申請画面_refactored.html` を開く
   - コンソールエラーをチェック
   - 全ステップを一通り操作

### 問題が発生した場合

1. **JavaScriptエラー**
   - コンソールでエラーメッセージ確認
   - 行番号と内容を確認
   - `js/pages/application-form.js` の該当箇所をチェック

2. **CSSが適用されない**
   - ネットワークタブで404エラー確認
   - ファイルパスが正しいか確認
   - ブラウザキャッシュをクリア

3. **機能が動作しない**
   - `common.js` が正しく読み込まれているか確認
   - グローバル変数の衝突がないか確認
   - LocalStorageの内容を確認

---

## 📞 サポート

### 質問・相談

このリファクタリングに関する質問や問題がある場合:

1. **REFACTORING_GUIDE.md を参照** - 詳細な手順とトラブルシューティング
2. **エラーログを確認** - ブラウザのコンソールとネットワークタブ
3. **バックアップから復元** - `backup/` ディレクトリにオリジナルファイルあり

### 緊急時の復元手順

```bash
# バックアップから復元
cp backup/YYYYMMDD_HHMMSS/労災申請アシストサイト_8号申請画面.html ./

# または手動バックアップから復元
cp backup/manual/労災申請アシストサイト_8号申請画面.html ./
```

---

## 🏆 期待される成果

### 短期的な成果（リファクタリング直後）

- HTMLファイルサイズ70%削減
- コードの可読性向上
- 開発効率の向上

### 中期的な成果（数週間〜数ヶ月）

- チーム開発の衝突減少
- バグ修正の容易化
- 新機能追加の高速化

### 長期的な成果（数ヶ月〜1年）

- 保守コストの削減
- 技術的負債の解消
- システム全体の品質向上

---

**作成者**: Claude (Anthropic AI Assistant)
**作成日**: 2025-10-30
**バージョン**: 1.0
**ライセンス**: MIT License（プロジェクトに準拠）

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|-----|----------|---------|--------|
| 2025-10-30 | 1.0 | 初版作成 | Claude |

---

**次のステップ**: `./refactor.sh` を実行してリファクタリングを開始してください 🚀
