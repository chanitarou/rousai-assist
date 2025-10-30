/**
 * 回覧完了画面固有のJavaScript
 */

// ページ読み込み時に完了者に応じて表示を更新
document.addEventListener('DOMContentLoaded', function() {
    const completedBy = localStorage.getItem('completedBy');

    if (completedBy === 'employer') {
        // 事業主が入力完了した場合
        updateStatusTable([
            { role: '被災労働者（申請者）', name: '山田 **', status: 'completed', date: '2025年11月20日 10:30' },
            { role: '事業主', name: '****株式会社', status: 'completed', date: '2025年11月20日 14:15 入力完了' },
            { role: '医療機関', name: '****総合病院', status: 'pending', date: '2025年11月20日 10:35 回覧依頼送信' }
        ]);
        const statusTitle = document.querySelector('.status-title');
        const statusMessage = document.querySelector('.status-message');
        if (statusTitle) statusTitle.textContent = '事業主による入力が完了しました';
        if (statusMessage) {
            statusMessage.innerHTML = '事業主による証明が完了しました。<br>医療機関の入力完了後、労働基準監督署へ提出できます。';
        }

        // 回覧依頼の注意事項を事業主用に更新
        const noticeList = document.querySelector('.notice-box ul');
        if (noticeList) {
            noticeList.innerHTML = `
                <li>事業主による証明が完了しました</li>
                <li>医療機関の入力が完了すると、メールで通知されます</li>
                <li>医療機関の入力完了後、労働基準監督署へ提出できます</li>
            `;
        }
    } else if (completedBy === 'medical') {
        // 医療機関が入力完了した場合
        updateStatusTable([
            { role: '被災労働者（申請者）', name: '山田 **', status: 'completed', date: '2025年11月20日 10:30' },
            { role: '事業主', name: '****株式会社', status: 'pending', date: '2025年11月20日 10:35 回覧依頼送信' },
            { role: '医療機関', name: '****総合病院', status: 'completed', date: '2025年11月20日 16:45 入力完了' }
        ]);
        const statusTitle = document.querySelector('.status-title');
        const statusMessage = document.querySelector('.status-message');
        if (statusTitle) statusTitle.textContent = '医療機関による入力が完了しました';
        if (statusMessage) {
            statusMessage.innerHTML = '医療機関による診断証明が完了しました。<br>事業主の入力完了後、労働基準監督署へ提出できます。';
        }

        // 回覧依頼の注意事項を医療機関用に更新
        const noticeList = document.querySelector('.notice-box ul');
        if (noticeList) {
            noticeList.innerHTML = `
                <li>医療機関による診断証明が完了しました</li>
                <li>事業主の入力が完了すると、メールで通知されます</li>
                <li>事業主の入力完了後、労働基準監督署へ提出できます</li>
            `;
        }
    }

    // localStorage をクリア（次回表示時のため）
    localStorage.removeItem('completedBy');
});

// ステータステーブルを更新
function updateStatusTable(data) {
    const tbody = document.querySelector('.status-table tbody');
    if (tbody) {
        tbody.innerHTML = data.map(item => `
            <tr>
                <td>${item.role}</td>
                <td>${item.name}</td>
                <td><span class="status-badge ${item.status}">${item.status === 'completed' ? '入力完了' : '回覧中'}</span></td>
                <td>${item.date}</td>
            </tr>
        `).join('');
    }
}

// 最新状況を確認
function checkStatus() {
    alert('最新の状況を取得しました。\n現在、事業主と医療機関が入力中です。');
}

// 申請内容を編集
function editApplication() {
    if (confirm('申請内容を編集しますか？\n※既に回覧済みの内容は変更できません。')) {
        window.location.href = '労災アシスト申請画面モック_ver0.04.html';
    }
}
