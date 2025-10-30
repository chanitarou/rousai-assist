/**
 * AIチャット画面固有のJavaScript
 */

// 拡張版知識ベース
const knowledgeBase = {
    '労災保険': {
        keywords: ['労災保険', '労災', 'ろうさい', '労働者災害補償保険', '労災制度'],
        answer: `<h4>労災保険（労働者災害補償保険）とは</h4>
労災保険は、労働者が業務上の事由または通勤によって負傷したり、病気になったり、障害が残ったり、死亡した場合に、被災労働者やその遺族に対して必要な保険給付を行う制度です。

<strong>主な特徴：</strong>
• 事業主が保険料を全額負担（労働者の負担なし）
• 原則として労働者を一人でも雇用していれば適用
• パートタイム労働者・アルバイトも対象
• 業務災害と通勤災害の両方をカバー

<strong>制度の目的：</strong>
労働者の安全と健康を守り、万が一の事故や病気の際に速やかに補償を受けられるようにするための重要な社会保険制度です。`,
        relatedLinks: [
            { title: '申請の流れ', description: '労災保険申請の手順を確認', icon: 'document' },
            { title: '給付の種類', description: '受けられる給付について', icon: 'money' }
        ]
    },
    '申請手順': {
        keywords: ['申請', '手続き', '流れ', 'プロセス', 'やり方', '方法', '手順', 'ステップ'],
        answer: `<h4>労災保険の申請手順</h4>

<strong>1. 事故発生時の対応</strong>
• 速やかに事業主に災害発生を報告
• 必要に応じて医療機関を受診
• 事故状況を記録（日時、場所、状況など）

<strong>2. 必要書類の準備</strong>
• 給付の種類に応じた請求書（様式）
• 医師の診断書・証明書
• 事業主の証明
• その他添付書類

<strong>3. 労災申請アシストサイトでの申請</strong>
① ログイン（デジタル庁認証アプリを使用）
② 「新規申請」を選択
③ 給付の種類を選択
④ 必要事項を入力（10ステップの入力フォーム）
⑤ 書類をアップロード
⑥ 事業主・医療機関に回覧（必要に応じて）
⑦ 内容確認後、提出

<strong>4. 審査・決定</strong>
• 労働基準監督署で審査
• 通常2週間〜1ヶ月程度
• 結果通知

<strong>5. 給付の受給</strong>
• 指定の口座に振込

<strong>ポイント：</strong>
労災申請アシストサイトでは自動保存機能があり、途中で保存して後から続きを入力できます。`,
        relatedLinks: [
            { title: '必要書類', description: '申請に必要な書類一覧', icon: 'document' },
            { title: '申請を始める', description: '今すぐ申請を開始', icon: 'application' }
        ]
    },
    // ... 他のナレッジベースは同様に定義（省略）
};

// メッセージを追加する関数
function addMessage(text, isUser = false, relatedLinks = []) {
    const messagesArea = document.getElementById('messagesArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;

    const now = new Date();
    const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    let relatedLinksHTML = '';
    if (relatedLinks && relatedLinks.length > 0) {
        relatedLinksHTML = '<div class="related-links">';
        relatedLinks.forEach(link => {
            relatedLinksHTML += `
                <a href="#" class="related-link-card" onclick="sendQuickQuestion('${link.title}'); return false;">
                    <div class="related-link-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 22H20V5.2L16.7 2H4V22ZM11.3 19.8L8.4 17.2L9.3 16.2L11.3 18L14.6 14.9L15.5 15.9L11.3 19.8ZM15.9 3.3L18.9 6.3H15.9V3.3ZM7 8.2H17V9.7H7V8.2ZM7 11.7H17V13.2H7V11.7Z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="related-link-text">
                        <div class="related-link-title">${link.title}</div>
                        <div class="related-link-description">${link.description}</div>
                    </div>
                </a>
            `;
        });
        relatedLinksHTML += '</div>';
    }

    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${isUser ?
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/></svg>' :
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 17.5C11.4 17.5 11 17.1 11 16.5C11 15.9 11.4 15.5 12 15.5C12.6 15.5 13 15.9 13 16.5C13 17.1 12.6 17.5 12 17.5ZM13.9 11.3C13.1 12 12.7 13 12.8 14H11.3C11.2 12.5 11.8 11.2 12.9 10.2C13.7 9.5 13.6 8.8 13.5 8.4C13 7 10.5 7.3 10.5 8.9H9C9 7.1 10.7 5.7 12.4 6C15.1 6.4 15.9 9.7 13.9 11.3Z" fill="white"/></svg>'
            }
        </div>
        <div class="message-wrapper">
            <div class="message-content">
                ${text.replace(/\n/g, '<br>')}
                ${relatedLinksHTML}
            </div>
            <div class="message-meta">
                <span>${timeString}</span>
            </div>
        </div>
    `;

    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // ウェルカムセクションとサジェスチョンを非表示
    if (messagesArea.children.length > 0) {
        const welcomeSection = document.getElementById('welcomeSection');
        const suggestionsSection = document.getElementById('suggestionsSection');
        if (welcomeSection) welcomeSection.style.display = 'none';
        if (suggestionsSection) suggestionsSection.style.display = 'none';
    }
}

// AIの応答を生成する関数
function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // キーワードマッチング
    for (const [key, data] of Object.entries(knowledgeBase)) {
        for (const keyword of data.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                return { answer: data.answer, relatedLinks: data.relatedLinks || [] };
            }
        }
    }

    // デフォルト応答
    return {
        answer: `ご質問ありがとうございます。以下のトピックについて詳しくお答えできます：

<strong>主要トピック：</strong>
• <strong>労災保険の制度</strong> - 制度の概要と特徴
• <strong>申請の流れと手順</strong> - 申請のステップバイステップガイド
• <strong>必要な書類</strong> - 給付別の必要書類一覧
• <strong>サイトの使い方</strong> - 労災申請アシストサイトの操作方法

具体的なご質問をお聞かせください。または、上部のクイックボタンからトピックをお選びいただけます。`,
        relatedLinks: []
    };
}

// メッセージを送信する関数
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message) return;

    // ユーザーメッセージを表示
    addMessage(message, true);
    input.value = '';
    input.style.height = 'auto';

    // 送信ボタンを無効化
    const sendButton = document.getElementById('sendButton');
    sendButton.disabled = true;

    // タイピングインジケータを表示
    const typingContainer = document.getElementById('typingContainer');
    if (typingContainer) typingContainer.style.display = 'flex';

    // メッセージエリアをスクロール
    const messagesArea = document.getElementById('messagesArea');
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // AI応答をシミュレート（1〜2.5秒の遅延）
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    // タイピングインジケータを非表示
    if (typingContainer) typingContainer.style.display = 'none';

    // AI応答を生成して表示
    const response = generateAIResponse(message);
    addMessage(response.answer, false, response.relatedLinks);

    // 送信ボタンを有効化
    sendButton.disabled = false;
    // input.focus(); // スマホでキーボードが自動表示されるのを防ぐため無効化
}

// クイック質問を送信
function sendQuickQuestion(question) {
    const input = document.getElementById('messageInput');
    input.value = question;
    sendMessage();
}

// チャットをクリア
function clearChat() {
    if (confirm('チャット履歴をクリアしますか？')) {
        const messagesArea = document.getElementById('messagesArea');
        messagesArea.innerHTML = '';
        const welcomeSection = document.getElementById('welcomeSection');
        const suggestionsSection = document.getElementById('suggestionsSection');
        if (welcomeSection) welcomeSection.style.display = 'block';
        if (suggestionsSection) suggestionsSection.style.display = 'block';
    }
}

// Enterキーで送信（Shift+Enterで改行）
document.getElementById('messageInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// テキストエリアの自動リサイズ
document.getElementById('messageInput')?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});
