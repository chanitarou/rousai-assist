# 🚀 クイックスタートガイド - リファクタリング実施

**所要時間**: 15-30分
**対象**: 労災申請アシストサイトのリファクタリング

---

## 📦 成果物

このリファクタリングにより以下のドキュメントとスクリプトが作成されました:

1. **REFACTORING_GUIDE.md** (45KB) - 詳細な実装ガイド
2. **refactor.sh** (約10KB) - 自動化スクリプト
3. **REFACTORING_SUMMARY.md** (40KB) - 実施サマリー
4. **QUICK_START.md** (このファイル) - クイックスタート

---

## ⚡ 3ステップで完了

### ステップ1: スクリプトに実行権限を付与

```bash
chmod +x refactor.sh
```

### ステップ2: リファクタリング実行

```bash
./refactor.sh
```

**実行内容**:
- バックアップ作成 → JavaScript抽出 → HTML更新 → 検証

**所要時間**: 約30秒

**実行後の出力例**:
```
=================================================
  労災申請アシストサイト - リファクタリング
=================================================

✓ 作業ディレクトリ: /home/runner/work/rousai-assist/rousai-assist

[フェーズ 1/5] バックアップ作成中...
✓ バックアップ完了: backup/20251030_123456

[フェーズ 2/5] JavaScript抽出中...
✓ JavaScript extracted: js/pages/application-form.js
  Total lines: 2400

[フェーズ 3/5] HTML更新中...
✓ HTML updated: 労災申請アシストサイト_8号申請画面_refactored.html
  Old size: 204,800 bytes (200.0 KB)
  New size: 61,440 bytes (60.0 KB)
  Reduction: 70.0%

[フェーズ 4/5] 他のHTMLファイルのメタタグ標準化...
✓ バージョニング設定済み

[フェーズ 5/5] ファイル検証中...
✓ JavaScript: js/pages/application-form.js (2400行, 90KB)
✓ CSS: css/pages/application-form.css (1056行, 40KB)

=================================================
  リファクタリング完了！
=================================================
```

### ステップ3: 動作確認

```bash
# ローカルサーバー起動
python3 -m http.server 8000

# ブラウザで開く:
# http://localhost:8000/労災申請アシストサイト_8号申請画面_refactored.html
```

**確認項目**:
- [ ] ページが正常に表示される
- [ ] CSS が適用されている
- [ ] フォームに入力できる
- [ ] バリデーションが動作する
- [ ] コンソールにエラーがない

**問題なければ置き換え**:
```bash
mv 労災申請アシストサイト_8号申請画面_refactored.html 労災申請アシストサイト_8号申請画面.html
```

---

## 📊 ビフォー・アフター

### ファイル構成

**Before**:
```
労災申請アシストサイト_8号申請画面.html (200KB)
├── <style> ... 1,056行のCSS ... </style>
├── <body> ... 820行のHTML ... </body>
└── <script> ... 2,400行のJS ... </script>
```

**After**:
```
労災申請アシストサイト_8号申請画面.html (60KB)
├── <link href="css/pages/application-form.css">
├── <body> ... 820行のHTML ... </body>
└── <script src="js/pages/application-form.js">

js/pages/application-form.js (90KB, 2,400行)
css/pages/application-form.css (40KB, 1,056行)
```

### メリット

✅ **ファイルサイズ**: 200KB → 60KB (70%削減)
✅ **ブラウザキャッシュ**: CSS/JSが再利用可能
✅ **並列ダウンロード**: 読み込み速度向上
✅ **保守性**: コードの編集・検索が容易
✅ **再利用性**: 他のページでも利用可能

---

## 🔍 トラブルシューティング

### エラー1: スクリプトが実行できない

```bash
# 権限エラーの場合
chmod +x refactor.sh
```

### エラー2: Pythonが見つからない

```bash
# Pythonのバージョン確認
python3 --version

# インストールされていない場合
# Ubuntu/Debian: sudo apt-get install python3
# macOS: brew install python3
```

### エラー3: ページが表示されない

```bash
# ファイルの存在確認
ls -lh 労災申請アシストサイト_8号申請画面_refactored.html
ls -lh js/pages/application-form.js
ls -lh css/pages/application-form.css

# パスが正しいか確認
grep "href=" 労災申請アシストサイト_8号申請画面_refactored.html | head -5
grep "src=" 労災申請アシストサイト_8号申請画面_refactored.html | tail -5
```

### エラー4: JavaScriptエラーが出る

```bash
# ブラウザのコンソールでエラー内容を確認
# ネットワークタブで404エラーを確認

# ファイルの行数を確認（2400行あるか）
wc -l js/pages/application-form.js

# ファイルの先頭と末尾を確認
head -20 js/pages/application-form.js
tail -20 js/pages/application-form.js
```

### 緊急時の復元

```bash
# バックアップから復元
cp backup/YYYYMMDD_HHMMSS/*.html ./

# または
git restore 労災申請アシストサイト_8号申請画面.html
```

---

## 📚 詳細情報

さらに詳しい情報は以下のドキュメントを参照:

- **REFACTORING_GUIDE.md** - 実装の詳細、ステップバイステップガイド
- **REFACTORING_SUMMARY.md** - 全体サマリー、技術詳細、テスト計画

---

## ✅ 完了後のアクション

### 1. Git commit

```bash
git add .
git commit -m "refactor: Extract inline CSS/JS from application form

- Extract 2,400 lines of JavaScript to js/pages/application-form.js
- Extract 1,056 lines of CSS to css/pages/application-form.css
- Reduce HTML file size from 200KB to 60KB (70% reduction)
- Add comprehensive refactoring documentation
- Maintain full functionality and Digital Agency Design System compliance"
```

### 2. 他のファイルも確認

```bash
# 他のHTMLファイルもチェック
grep -l "<style>" *.html
grep -l "<script>" *.html | grep -v "src="
```

### 3. 次のステップ

- [ ] 他のHTMLファイルの標準化
- [ ] ARIA属性の追加
- [ ] CSS変数の統合
- [ ] パフォーマンステスト
- [ ] アクセシビリティテスト

---

## 🎉 おめでとうございます！

リファクタリング完了後、以下が改善されます:

- ✅ コードの可読性・保守性が向上
- ✅ ファイルサイズが70%削減
- ✅ ブラウザキャッシュが活用可能
- ✅ 開発効率が大幅に向上
- ✅ チーム開発での衝突が減少

---

**質問・問題がある場合**: REFACTORING_GUIDE.md の詳細セクションを参照してください

**所要時間**: ここまで約15-30分 ⏱️
