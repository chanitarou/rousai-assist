# 労災申請アシストサイト - 包括的リファクタリングガイド

**作成日**: 2025-10-30
**対象**: 労災申請アシストサイト 全HTMLファイル
**目的**: コードの整理、保守性の向上、デジタル庁デザインシステム準拠の徹底

---

## 📋 プロジェクト概要

このプロジェクトは、6つのHTMLファイル（合計8,445行）で構成される日本の労災申請支援システムです。
最大のファイル（労災申請アシストサイト_8号申請画面.html）は4,302行あり、以下の構造になっています：

- **18-1075行目**: インラインCSS（1,057行）
- **1076-1896行目**: HTMLコンテンツ（821行）
- **1897-4298行目**: インラインJavaScript（2,401行）

## 🎯 リファクタリングの目標

### 1. コードの分離
- ✅ インラインCSSを外部ファイルに分離（完了済み）
- ⏳ インラインJavaScriptを外部ファイルに分離
- ⏳ HTMLファイルから外部ファイルへのリンクを更新

### 2. 標準化
- ⏳ すべてのHTMLファイルで一貫したメタタグ
- ⏳ CSS/JSバージョニングの統一（`?v=20250131`）
- ⏳ デジタル庁デザインシステム準拠の徹底

### 3. アクセシビリティ
- ⏳ ARIA属性の追加
- ⏳ セマンティックHTML構造の改善
- ⏳ スクリーンリーダー対応の強化

### 4. 保守性
- ⏳ CSS変数の集約（css/design-system.css）
- ⏳ 明確なセクションコメントの追加
- ⏳ コードの重複削除

---

## 📂 現在のファイル構造

```
/home/runner/work/rousai-assist/rousai-assist/
├── css/
│   ├── common.css                    # 共通スタイル
│   ├── design-system.css             # デザインシステム変数
│   └── pages/
│       ├── application-form.css      # ✅ 完了（1,056行）
│       ├── chat.css                  # AIチャット画面
│       ├── circulation.css           # 回覧完了画面
│       ├── login.css                 # ログイン画面
│       ├── procedures.css            # 手続き一覧画面
│       └── top.css                   # TOP画面
├── js/
│   ├── common.js                     # 共通JavaScript
│   └── pages/
│       ├── application-form.js       # ⏳ 未作成（2,400行必要）
│       ├── chat.js                   # AIチャット機能
│       ├── circulation.js            # 回覧完了機能
│       ├── login.js                  # ログイン機能
│       ├── procedures.js             # 手続き一覧機能
│       └── top.js                    # TOP画面機能
├── images/                           # 画像ファイル
├── index.html                        # メインエントリーポイント（38KB）
├── 労災申請アシストサイト_8号申請画面.html    # ⚠️ リファクタリング対象（200KB）
├── 労災申請アシストサイト_AIチャット.html   # （51KB）
├── 労災申請アシストサイト_ログイン画面.html  # （16KB）
├── 労災申請アシストサイト_回覧完了画面.html  # （20KB）
└── 労災申請アシストサイト_手続き一覧画面.html # （21KB）
```

---

## 🔧 実装手順

### ステップ1: JavaScriptの抽出【最優先】

**ファイル**: `労災申請アシストサイト_8号申請画面.html`
**対象行**: 1898-4297行目（2,400行）
**出力先**: `js/pages/application-form.js`

#### 抽出方法（Pythonスクリプト）

```python
#!/usr/bin/env python3
# extract_js.py

input_file = '労災申請アシストサイト_8号申請画面.html'
output_file = 'js/pages/application-form.js'

with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 行番号1898-4297 = Pythonインデックス1897-4296
js_content = ''.join(lines[1897:4297])

# ヘッダーコメントを追加
header = """/* ============================================
   デジタル庁デザインシステム準拠
   労災申請アシストサイト - 申請画面用JavaScript
   Version: 1.0.0
   Last Updated: 2025-10-30
============================================ */

"""

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(header + js_content)

print(f"✓ JavaScript extracted: {output_file}")
print(f"  Lines: {len(js_content.splitlines())}")
```

#### 実行コマンド

```bash
python3 extract_js.py
```

#### 抽出されるJavaScriptの主要機能

1. **グローバル変数管理** (1898-1914行)
   - `currentStep`: 現在のステップ番号
   - `totalSteps`: 総ステップ数（9）
   - `formData`: フォームデータオブジェクト
   - `steps`: ステップ情報配列

2. **医療機関データ** (1916-2188行)
   - 30件の労災保険指定医療機関サンプルデータ
   - ID、名称、郵便番号、住所、電話番号、地域、種別

3. **初期化処理** (2190-2197行)
   - `DOMContentLoaded`イベントリスナー
   - プログレスバー初期化
   - フォームデータ読み込み
   - 自動保存設定
   - リアルタイムバリデーション設定
   - ファイルアップロード設定

4. **バリデーションルール** (2268-2602行)
   - ステップ1〜8の詳細バリデーションルール
   - 必須チェック、形式チェック、日付チェック
   - エラーメッセージ定義

5. **ステップ制御** (2604-2972行)
   - `nextStep()`: 次のステップへ進む
   - `nextStepDev()`: 開発用スキップ機能
   - `previousStep()`: 前のステップへ戻る
   - `validateCurrentStep()`: 現在のステップのバリデーション

6. **リアルタイムバリデーション** (3025-3423行)
   - フィールド単位のバリデーション
   - 複合フィールドバリデーション（郵便番号、電話番号、労働保険番号）
   - ラジオボタンバリデーション（性別、口座種別、療養の現況）

7. **住所検索機能** (3471-3551行、3986-4122行)
   - ZipcoudAPI連携
   - 自動住所入力
   - エラーハンドリング

8. **医療機関検索** (3615-3724行、3768-3816行)
   - キーワード検索
   - 検索結果表示
   - 医療機関選択

9. **ファイルアップロード** (3553-3613行)
   - 診断書アップロード
   - その他書類アップロード
   - ファイルリスト表示

10. **フォーム送信** (3818-4297行)
    - 回覧依頼送信
    - 事業主フォーム送信
    - 医療機関フォーム送信
    - 申請送信

---

### ステップ2: HTMLファイルの更新

**ファイル**: `労災申請アシストサイト_8号申請画面.html`

#### 変更内容

##### 2.1 インラインCSS削除（18-1075行目）

**削除する部分**:
```html
<style>
    /* 1,056行のCSS */
</style>
```

**置き換え**:
```html
<link rel="stylesheet" href="css/design-system.css?v=20250131">
<link rel="stylesheet" href="css/common.css?v=20250131">
<link rel="stylesheet" href="css/pages/application-form.css?v=20250131">
```

##### 2.2 インラインJavaScript削除（1897-4298行目）

**削除する部分**:
```html
<script>
    // 2,400行のJavaScript
</script>
```

**置き換え**:
```html
<script src="js/common.js?v=20250131"></script>
<script src="js/pages/application-form.js?v=20250131"></script>
```

##### 2.3 メタタグの標準化

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="労災申請アシストサイト - 労働者災害補償保険の電子申請システム">
    <meta name="keywords" content="労災,申請,電子申請,労働者災害補償保険">
    <meta name="author" content="デジタル庁">
    <title>労災申請アシストサイト - 様式第8号（休業補償給付支給請求書）</title>

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="images/favicon.png">

    <!-- Google Fonts - Noto Sans JP -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/design-system.css?v=20250131">
    <link rel="stylesheet" href="css/common.css?v=20250131">
    <link rel="stylesheet" href="css/pages/application-form.css?v=20250131">
</head>
```

##### 2.4 ARIA属性の追加

**ヘッダーセクション**:
```html
<header class="header" role="banner">
    <div class="header-top" aria-label="サイトユーティリティ">
        <!-- ... -->
    </div>
    <div class="header-main">
        <div class="container">
            <h1 class="header-title" id="page-title">労災申請アシストサイト</h1>
            <p class="header-subtitle">様式第8号（休業補償給付支給請求書）</p>
        </div>
    </div>
</header>
```

**プログレスセクション**:
```html
<section class="progress-section" aria-labelledby="progress-title">
    <div class="container">
        <div class="progress-header">
            <h2 class="progress-title" id="progress-title">申請の進捗</h2>
            <div class="progress-counter" aria-live="polite">
                ステップ <span id="currentStep">1</span> / <span id="totalSteps">9</span>
            </div>
        </div>
        <div class="progress-bar" role="progressbar"
             aria-valuenow="11"
             aria-valuemin="0"
             aria-valuemax="100"
             aria-label="申請進捗">
            <div class="progress-bar-fill" id="progressBar" style="width: 11%;"></div>
        </div>
        <nav aria-label="申請ステップ">
            <div class="progress-steps" id="progressSteps"></div>
        </nav>
    </div>
</section>
```

**メインコンテンツ**:
```html
<main class="main-content" role="main" aria-labelledby="page-title">
    <div class="container">
        <!-- ステップ1: 労働者基本情報 -->
        <section id="step-1" class="step-content active" aria-labelledby="step-1-title">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title" id="step-1-title">ステップ1: 労働者基本情報</h2>
                    <p class="card-description">申請者の基本情報を入力してください</p>
                </div>
                <!-- ... -->
            </div>
        </section>
    </div>
</main>
```

**フォーム要素**:
```html
<div class="form-group">
    <label for="lastName" class="form-label form-label-required">姓</label>
    <input
        type="text"
        id="lastName"
        class="form-input"
        placeholder="例：山田"
        aria-required="true"
        aria-describedby="lastName-error"
        aria-invalid="false"
    >
    <div id="lastName-error" class="error-message" role="alert"></div>
</div>
```

---

### ステップ3: 他のHTMLファイルの標準化

#### 3.1 index.html（TOP画面）

**現状確認**:
```bash
grep -n "<meta" index.html
grep -n "stylesheet" index.html
grep -n "script src" index.html
```

**必要な更新**:
- メタタグの標準化
- CSS/JSバージョニング統一（`?v=20250131`）
- ARIA属性の追加

#### 3.2 労災申請アシストサイト_AIチャット.html

**特徴**:
- AIチャットボット機能
- メッセージ履歴表示
- クイックアクションボタン

**必要な更新**:
- `role="log"` for チャット履歴
- `aria-live="polite"` for 新規メッセージ
- フォーカス管理の改善

#### 3.3 労災申請アシストサイト_ログイン画面.html

**特徴**:
- QRコード認証
- カウントダウンタイマー

**必要な更新**:
- `role="timer"` for カウントダウン
- `aria-label` for QRコード画像
- キーボードナビゲーション改善

#### 3.4 労災申請アシストサイト_回覧完了画面.html

**特徴**:
- テーブル形式の状況表示
- 動的コンテンツ切り替え

**必要な更新**:
- `<table>` タグにアクセシビリティ属性
- `role="status"` for 動的コンテンツ
- `aria-live="polite"` for 更新通知

#### 3.5 労災申請アシストサイト_手続き一覧画面.html

**特徴**:
- 手続きカードリスト
- フィルター機能

**必要な更新**:
- `role="list"` and `role="listitem"`
- フィルターのキーボード操作改善
- `aria-expanded` for 折りたたみ要素

---

### ステップ4: CSS変数の統合

#### 4.1 現状分析

各ページのCSSファイルで重複している可能性のある変数:
- カラーパレット
- タイポグラフィ設定
- スペーシングシステム
- ブレークポイント

#### 4.2 統合先

**ファイル**: `css/design-system.css`

このファイルに以下を集約:

```css
/* ============================================
   デジタル庁デザインシステム β版 v2.8.0
   グローバルデザイントークン
============================================ */

:root {
    /* ============================================
       カラーパレット
    ============================================ */

    /* Blue (Primary) - デジタル庁準拠 */
    --color-blue-50: #EFF6FF;
    --color-blue-100: #DBEAFE;
    --color-blue-200: #BFDBFE;
    --color-blue-300: #93C5FD;
    --color-blue-400: #60A5FA;
    --color-blue-500: #3B82F6;
    --color-blue-600: #2563EB;
    --color-blue-700: #1D4ED8;
    --color-blue-800: #1E40AF;
    --color-blue-900: #1E3A8A;
    --color-blue-950: #172554;

    /* Gray (Solid Gray) - デジタル庁準拠 */
    --color-gray-50: #F9FAFB;
    --color-gray-100: #F3F4F6;
    --color-gray-200: #E5E7EB;
    --color-gray-300: #D1D5DB;
    --color-gray-400: #9CA3AF;
    --color-gray-500: #6B7280;
    --color-gray-600: #4B5563;
    --color-gray-700: #374151;
    --color-gray-800: #1F2937;
    --color-gray-900: #111827;
    --color-gray-950: #030712;

    /* Semantic Colors - デジタル庁準拠 */
    --color-error: #DC2626;
    --color-error-bg: #FEF2F2;
    --color-error-border: #FCA5A5;
    --color-success: #16A34A;
    --color-success-bg: #F0FDF4;
    --color-success-border: #86EFAC;
    --color-warning: #D97706;
    --color-warning-bg: #FEF3C7;
    --color-warning-border: #FCD34D;
    --color-info: #0891B2;
    --color-info-bg: #F0FDFA;
    --color-info-border: #67E8F9;

    /* Application Colors */
    --color-primary: #004C8C;
    --color-primary-hover: #003F73;
    --color-secondary: var(--color-blue-100);
    --color-tertiary: var(--color-gray-100);
    --color-background: #FFFFFF;
    --color-surface: var(--color-gray-50);
    --color-text: var(--color-gray-900);
    --color-text-secondary: var(--color-gray-600);
    --color-text-tertiary: var(--color-gray-500);
    --color-border: var(--color-gray-300);

    /* ============================================
       タイポグラフィ
    ============================================ */

    --font-family-base: 'Noto Sans JP', -apple-system, BlinkMacSystemFont,
                        'Helvetica Neue', 'ヒラギノ角ゴ ProN',
                        'Hiragino Kaku Gothic ProN', 'メイリオ', Meiryo, sans-serif;

    /* Font Sizes */
    --font-size-xs: 0.75rem;    /* 12px */
    --font-size-sm: 0.875rem;   /* 14px */
    --font-size-base: 1rem;     /* 16px */
    --font-size-lg: 1.125rem;   /* 18px */
    --font-size-xl: 1.25rem;    /* 20px */
    --font-size-2xl: 1.5rem;    /* 24px */
    --font-size-3xl: 1.875rem;  /* 30px */
    --font-size-4xl: 2.25rem;   /* 36px */

    /* Font Weights */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 700;

    /* Line Heights */
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;

    /* ============================================
       スペーシング（8pxベースシステム）
    ============================================ */

    --spacing-0: 0;
    --spacing-1: 0.25rem;  /* 4px */
    --spacing-2: 0.5rem;   /* 8px */
    --spacing-3: 0.75rem;  /* 12px */
    --spacing-4: 1rem;     /* 16px */
    --spacing-5: 1.25rem;  /* 20px */
    --spacing-6: 1.5rem;   /* 24px */
    --spacing-8: 2rem;     /* 32px */
    --spacing-10: 2.5rem;  /* 40px */
    --spacing-12: 3rem;    /* 48px */
    --spacing-16: 4rem;    /* 64px */

    /* ============================================
       Border Radius
    ============================================ */

    --radius-none: 0;
    --radius-sm: 0.125rem;   /* 2px */
    --radius-base: 0.25rem;  /* 4px */
    --radius-md: 0.375rem;   /* 6px */
    --radius-lg: 0.5rem;     /* 8px */
    --radius-xl: 0.75rem;    /* 12px */
    --radius-full: 9999px;

    /* ============================================
       Shadows
    ============================================ */

    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

    /* ============================================
       Z-index
    ============================================ */

    --z-index-dropdown: 1000;
    --z-index-sticky: 1020;
    --z-index-fixed: 1030;
    --z-index-modal-backdrop: 1040;
    --z-index-modal: 1050;
    --z-index-popover: 1060;
    --z-index-tooltip: 1070;

    /* ============================================
       Transitions
    ============================================ */

    --transition-fast: 150ms ease-in-out;
    --transition-base: 250ms ease-in-out;
    --transition-slow: 350ms ease-in-out;

    /* ============================================
       Breakpoints（メディアクエリ用）
    ============================================ */

    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;
}
```

---

## ✅ 品質チェックリスト

### コード品質
- [ ] すべてのインラインCSS/JSを外部ファイルに分離
- [ ] ファイルサイズの削減（目標：各HTMLファイル50KB以下）
- [ ] コードの重複を削除
- [ ] 一貫したインデント（4スペース）
- [ ] 明確なコメント（日本語）

### デザインシステム準拠
- [ ] デジタル庁デザインシステム β版 v2.8.0 準拠
- [ ] Noto Sans JPフォント使用
- [ ] 公式カラーパレット使用
- [ ] 8pxベーススペーシングシステム
- [ ] 公式UIコンポーネント使用

### アクセシビリティ
- [ ] ARIA属性の適切な使用
- [ ] セマンティックHTML
- [ ] キーボードナビゲーション対応
- [ ] スクリーンリーダー対応
- [ ] 色のコントラスト比準拠（WCAG AA）

### パフォーマンス
- [ ] CSSの最小化（minify）
- [ ] JavaScriptの最小化（minify）
- [ ] 画像の最適化
- [ ] ブラウザキャッシュ活用（バージョニング）

### ブラウザ互換性
- [ ] Chrome（最新版）
- [ ] Firefox（最新版）
- [ ] Safari（最新版）
- [ ] Edge（最新版）

---

## 🚀 実装スケジュール

### フェーズ1: JavaScript抽出（最優先）
**期間**: 1日
**タスク**:
1. Pythonスクリプトの実行
2. `js/pages/application-form.js`の作成
3. 動作確認

### フェーズ2: HTML更新
**期間**: 1日
**タスク**:
1. `労災申請アシストサイト_8号申請画面.html`の更新
2. インラインCSS/JS削除
3. 外部ファイルリンク追加
4. ARIA属性追加
5. 動作確認

### フェーズ3: 他ファイルの標準化
**期間**: 2日
**タスク**:
1. 各HTMLファイルのメタタグ標準化
2. CSS/JSバージョニング統一
3. ARIA属性追加
4. 動作確認

### フェーズ4: CSS統合
**期間**: 1日
**タスク**:
1. 重複CSS変数の特定
2. `design-system.css`への統合
3. 各ページCSSの調整
4. 動作確認

### フェーズ5: 最終チェック
**期間**: 1日
**タスク**:
1. 全画面の動作確認
2. アクセシビリティテスト
3. パフォーマンステスト
4. ブラウザ互換性テスト

**総期間**: 6日

---

## 📚 参考資料

### デジタル庁
- [デジタル庁デザインシステム β版 v2.8.0](https://design.digital.go.jp/dads/)
- [デジタル庁 イラスト・アイコン素材集](https://www.digital.go.jp/policies/servicedesign/designsystem/Illustration_Icons)

### アクセシビリティ
- [JIS X 8341-3:2016（ウェブアクセシビリティ）](https://waic.jp/docs/jis2016/)
- [WCAG 2.1（Web Content Accessibility Guidelines）](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

### Web標準
- [HTML Living Standard](https://html.spec.whatwg.org/multipage/)
- [MDN Web Docs](https://developer.mozilla.org/ja/)

---

## 📝 実装メモ

### JavaScript抽出時の注意点

1. **エンコーディング**: UTF-8を維持
2. **行末**: LFまたはCRLFを統一
3. **グローバル変数**: `let`で宣言されている変数を確認
4. **依存関係**: 外部ライブラリの依存なし（Vanilla JS）
5. **API呼び出し**: ZipcloudAPI使用（郵便番号検索）

### HTML更新時の注意点

1. **リンク順序**:
   ```html
   <!-- 必ずこの順序で読み込む -->
   <link rel="stylesheet" href="css/design-system.css?v=20250131">
   <link rel="stylesheet" href="css/common.css?v=20250131">
   <link rel="stylesheet" href="css/pages/application-form.css?v=20250131">
   ```

2. **JavaScript読み込み**:
   ```html
   <!-- bodyの閉じタグ直前 -->
   <script src="js/common.js?v=20250131"></script>
   <script src="js/pages/application-form.js?v=20250131"></script>
   ```

3. **バージョニング**: 変更時は必ずバージョン番号を更新

### テスト項目

1. **機能テスト**:
   - フォーム入力・バリデーション
   - ステップ遷移
   - 郵便番号検索
   - 医療機関検索
   - ファイルアップロード
   - LocalStorage保存・復元

2. **アクセシビリティテスト**:
   - キーボード操作
   - スクリーンリーダー（NVDA/JAWS）
   - フォーカス管理
   - ARIA属性の適切性

3. **パフォーマンステスト**:
   - ページ読み込み時間
   - JavaScript実行時間
   - メモリ使用量

---

## 🔒 バックアップ

リファクタリング前に必ずバックアップを取得:

```bash
# バックアップディレクトリ作成
mkdir -p backup/$(date +%Y%m%d)

# 全HTMLファイルのバックアップ
cp *.html backup/$(date +%Y%m%d)/

# 確認
ls -lh backup/$(date +%Y%m%d)/
```

---

## 🎉 完了基準

リファクタリングは以下の条件をすべて満たした時点で完了とする:

1. ✅ すべてのインラインCSS/JSが外部ファイルに分離されている
2. ✅ すべてのHTMLファイルが50KB以下になっている
3. ✅ デジタル庁デザインシステムに完全準拠している
4. ✅ すべての画面が正常に動作する
5. ✅ アクセシビリティチェックに合格する
6. ✅ 全ブラウザで動作確認済み
7. ✅ ドキュメントが最新状態に更新されている

---

**作成者**: Claude (Anthropic)
**バージョン**: 1.0
**最終更新**: 2025-10-30
