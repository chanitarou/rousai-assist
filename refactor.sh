#!/bin/bash
# ==================================================
# 労災申請アシストサイト - リファクタリングスクリプト
# Version: 1.0.0
# Date: 2025-10-30
# ==================================================

set -e  # エラーが発生したら終了

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=================================================${NC}"
echo -e "${BLUE}  労災申請アシストサイト - リファクタリング${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# 現在のディレクトリを確認
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "${GREEN}✓${NC} 作業ディレクトリ: $SCRIPT_DIR"
echo ""

# ==================================================
# フェーズ 1: バックアップ作成
# ==================================================
echo -e "${YELLOW}[フェーズ 1/5]${NC} バックアップ作成中..."

BACKUP_DIR="backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# HTMLファイルのバックアップ
cp *.html "$BACKUP_DIR/" 2>/dev/null || true

echo -e "${GREEN}✓${NC} バックアップ完了: $BACKUP_DIR"
echo ""

# ==================================================
# フェーズ 2: JavaScript抽出
# ==================================================
echo -e "${YELLOW}[フェーズ 2/5]${NC} JavaScript抽出中..."

HTML_FILE="労災申請アシストサイト_8号申請画面.html"
JS_OUTPUT="js/pages/application-form.js"

if [ ! -f "$HTML_FILE" ]; then
    echo -e "${RED}✗${NC} エラー: $HTML_FILE が見つかりません"
    exit 1
fi

# Pythonスクリプトを使用してJavaScriptを抽出
python3 << 'PYTHON_SCRIPT'
import sys

input_file = '労災申請アシストサイト_8号申請画面.html'
output_file = 'js/pages/application-form.js'

try:
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

   機能概要:
   - 多段階フォーム制御（9ステップ）
   - リアルタイムバリデーション
   - 郵便番号検索（ZipcloudAPI連携）
   - 医療機関検索
   - ファイルアップロード
   - LocalStorage自動保存
   - 回覧ワークフロー管理
============================================ */

"""

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(header + js_content)

    print(f"✓ JavaScript extracted: {output_file}")
    print(f"  Total lines: {len(js_content.splitlines())}")
    sys.exit(0)

except Exception as e:
    print(f"✗ Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} JavaScript抽出完了: $JS_OUTPUT"
else
    echo -e "${RED}✗${NC} JavaScript抽出失敗"
    exit 1
fi
echo ""

# ==================================================
# フェーズ 3: HTML更新
# ==================================================
echo -e "${YELLOW}[フェーズ 3/5]${NC} HTML更新中..."

# Pythonスクリプトを使用してHTMLを更新
python3 << 'PYTHON_SCRIPT'
import sys
import re

input_file = '労災申請アシストサイト_8号申請画面.html'
output_file = '労災申請アシストサイト_8号申請画面_refactored.html'

try:
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = f.readlines()

    # インラインCSSを削除して外部リンクに置き換え
    # 行18-1075を削除
    new_lines = lines[:17]  # 1-17行目まで保持

    # 外部CSSリンクを追加
    new_lines.append('    <!-- Stylesheets -->\n')
    new_lines.append('    <link rel="stylesheet" href="css/design-system.css?v=20250131">\n')
    new_lines.append('    <link rel="stylesheet" href="css/common.css?v=20250131">\n')
    new_lines.append('    <link rel="stylesheet" href="css/pages/application-form.css?v=20250131">\n')

    # 1076-1896行目（HTMLコンテンツ）を追加
    new_lines.extend(lines[1075:1896])

    # インラインJavaScriptを削除して外部スクリプトに置き換え
    # 行1897-4298をスキップ

    # bodyの閉じタグ前に外部JSを追加
    new_lines.append('    <!-- Scripts -->\n')
    new_lines.append('    <script src="js/common.js?v=20250131"></script>\n')
    new_lines.append('    <script src="js/pages/application-form.js?v=20250131"></script>\n')

    # 4299行目以降（残りのHTML）を追加
    if len(lines) > 4298:
        new_lines.extend(lines[4298:])

    # ファイル書き込み
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

    # ファイルサイズ比較
    import os
    old_size = os.path.getsize(input_file)
    new_size = os.path.getsize(output_file)
    reduction = ((old_size - new_size) / old_size) * 100

    print(f"✓ HTML updated: {output_file}")
    print(f"  Old size: {old_size:,} bytes ({old_size/1024:.1f} KB)")
    print(f"  New size: {new_size:,} bytes ({new_size/1024:.1f} KB)")
    print(f"  Reduction: {reduction:.1f}%")
    sys.exit(0)

except Exception as e:
    print(f"✗ Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} HTML更新完了"

    # オリジナルファイルをバックアップして新しいファイルで置き換え
    # （安全のため、まずはリファクタリング版を別名で保存）
    echo -e "${BLUE}ℹ${NC} リファクタリング版: 労災申請アシストサイト_8号申請画面_refactored.html"
    echo -e "${BLUE}ℹ${NC} 動作確認後、元のファイルを置き換えてください"
else
    echo -e "${RED}✗${NC} HTML更新失敗"
    exit 1
fi
echo ""

# ==================================================
# フェーズ 4: メタタグ標準化（他のHTMLファイル）
# ==================================================
echo -e "${YELLOW}[フェーズ 4/5]${NC} 他のHTMLファイルのメタタグ標準化..."

# この部分は手動レビューが必要なため、チェックのみ実施
HTML_FILES=(
    "index.html"
    "労災申請アシストサイト_AIチャット.html"
    "労災申請アシストサイト_ログイン画面.html"
    "労災申請アシストサイト_回覧完了画面.html"
    "労災申請アシストサイト_手続き一覧画面.html"
)

echo "以下のファイルのメタタグとバージョニングを確認してください:"
for file in "${HTML_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  - ${BLUE}$file${NC}"

        # CSS/JSのバージョンをチェック
        has_versioning=$(grep -c "?v=" "$file" || true)
        if [ $has_versioning -eq 0 ]; then
            echo -e "    ${YELLOW}⚠${NC} バージョニング未設定"
        else
            echo -e "    ${GREEN}✓${NC} バージョニング設定済み ($has_versioning 箇所)"
        fi
    fi
done
echo ""

# ==================================================
# フェーズ 5: 検証
# ==================================================
echo -e "${YELLOW}[フェーズ 5/5]${NC} ファイル検証中..."

# JSファイルの存在確認
if [ -f "$JS_OUTPUT" ]; then
    JS_LINES=$(wc -l < "$JS_OUTPUT")
    JS_SIZE=$(stat -f%z "$JS_OUTPUT" 2>/dev/null || stat -c%s "$JS_OUTPUT" 2>/dev/null)
    echo -e "${GREEN}✓${NC} JavaScript: $JS_OUTPUT"
    echo -e "  行数: $JS_LINES"
    echo -e "  サイズ: $((JS_SIZE/1024)) KB"
else
    echo -e "${RED}✗${NC} JavaScript file not found: $JS_OUTPUT"
fi

# CSSファイルの存在確認
CSS_FILE="css/pages/application-form.css"
if [ -f "$CSS_FILE" ]; then
    CSS_LINES=$(wc -l < "$CSS_FILE")
    CSS_SIZE=$(stat -f%z "$CSS_FILE" 2>/dev/null || stat -c%s "$CSS_FILE" 2>/dev/null)
    echo -e "${GREEN}✓${NC} CSS: $CSS_FILE"
    echo -e "  行数: $CSS_LINES"
    echo -e "  サイズ: $((CSS_SIZE/1024)) KB"
else
    echo -e "${YELLOW}⚠${NC} CSS file not found: $CSS_FILE"
fi

echo ""

# ==================================================
# 完了
# ==================================================
echo -e "${GREEN}=================================================${NC}"
echo -e "${GREEN}  リファクタリング完了！${NC}"
echo -e "${GREEN}=================================================${NC}"
echo ""
echo -e "${BLUE}次のステップ:${NC}"
echo ""
echo -e "1. ${YELLOW}動作確認${NC}"
echo -e "   ブラウザで 労災申請アシストサイト_8号申請画面_refactored.html を開いて動作を確認"
echo ""
echo -e "2. ${YELLOW}デベロッパーツールでチェック${NC}"
echo -e "   - コンソールエラーがないか確認"
echo -e "   - CSS/JSが正しく読み込まれているか確認"
echo -e "   - ネットワークタブで404エラーがないか確認"
echo ""
echo -e "3. ${YELLOW}機能テスト${NC}"
echo -e "   - フォーム入力・バリデーション"
echo -e "   - ステップ遷移"
echo -e "   - 郵便番号検索"
echo -e "   - ファイルアップロード"
echo ""
echo -e "4. ${YELLOW}問題がなければファイル置き換え${NC}"
echo -e "   mv 労災申請アシストサイト_8号申請画面_refactored.html 労災申請アシストサイト_8号申請画面.html"
echo ""
echo -e "5. ${YELLOW}Git commit${NC}"
echo -e "   git add ."
echo -e "   git commit -m \"Refactor: Extract inline CSS/JS to external files\""
echo ""
echo -e "${BLUE}詳細なガイド:${NC} REFACTORING_GUIDE.md を参照してください"
echo ""
