/**
 * ファイルアップロード管理クラス
 *
 * ファイルの選択、表示、削除などの
 * ファイルアップロード関連の機能を提供します。
 *
 * @class FileUploadManager
 * @module core/FileUploadManager
 * @version 1.0.0
 */

export class FileUploadManager {
    /**
     * ファイルアップロードのセットアップ
     * @param {string} inputId - ファイル入力要素のID
     * @param {string} listId - ファイルリスト表示要素のID
     *
     * @example
     * FileUploadManager.setupFileUpload('diagnosisFile', 'diagnosisFileList');
     */
    static setupFileUpload(inputId, listId) {
        const fileInput = document.getElementById(inputId);
        if (!fileInput) {
            console.warn(
                `FileUploadManager: ファイル入力要素が見つかりません (id: ${inputId})`
            );
            return;
        }

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            FileUploadManager.displayFileList(files, listId, inputId);
        });
    }

    /**
     * 選択されたファイルのリストを表示
     * @param {File[]} files - ファイルの配列
     * @param {string} listId - 表示先要素のID
     * @param {string} inputId - ファイル入力要素のID（削除時に使用）
     *
     * @example
     * FileUploadManager.displayFileList(filesArray, 'diagnosisFileList', 'diagnosisFile');
     */
    static displayFileList(files, listId, inputId = '') {
        const listElement = document.getElementById(listId);
        if (!listElement) {
            console.warn(
                `FileUploadManager: ファイルリスト要素が見つかりません (id: ${listId})`
            );
            return;
        }

        listElement.innerHTML = '';

        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                border: 1px solid #D1D5DB;
                border-radius: 4px;
                margin-bottom: 8px;
            `;

            const fileInfo = document.createElement('div');
            fileInfo.style.flex = '1';
            fileInfo.innerHTML = `
                <span class="file-name" style="font-weight: 500;">${file.name}</span>
                <span class="file-size" style="color: #6B7280; margin-left: 12px;">${FileUploadManager.formatFileSize(file.size)}</span>
            `;

            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn-remove';
            removeButton.textContent = '削除';
            removeButton.style.cssText = `
                padding: 4px 12px;
                background: #DC2626;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            removeButton.addEventListener('click', () => {
                FileUploadManager.removeFile(listId, inputId, index);
            });

            fileItem.appendChild(fileInfo);
            fileItem.appendChild(removeButton);
            listElement.appendChild(fileItem);
        });
    }

    /**
     * ファイルサイズをフォーマット
     * @param {number} bytes - バイト数
     * @returns {string} フォーマットされたサイズ（例: "1.5 MB"）
     *
     * @example
     * FileUploadManager.formatFileSize(1536000); // => "1.46 MB"
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
        );
    }

    /**
     * ファイルリストから指定されたファイルを削除
     * @param {string} listId - ファイルリストのID
     * @param {string} inputId - ファイル入力要素のID
     * @param {number} index - 削除するファイルのインデックス
     *
     * @example
     * FileUploadManager.removeFile('diagnosisFileList', 'diagnosisFile', 0);
     */
    static removeFile(listId, inputId, index) {
        const fileInput = document.getElementById(inputId);
        if (!fileInput) {
            console.warn(
                `FileUploadManager: ファイル入力要素が見つかりません (id: ${inputId})`
            );
            return;
        }

        // FileListは読み取り専用なので、DataTransferを使って新しいFileListを作成
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);

        files.forEach((file, i) => {
            if (i !== index) {
                dt.items.add(file);
            }
        });

        fileInput.files = dt.files;

        // リストの再表示
        FileUploadManager.displayFileList(
            Array.from(dt.files),
            listId,
            inputId
        );
    }

    /**
     * すべてのファイルアップロード要素を初期化
     * 申請フォーム用にプリセットされたファイルアップロード要素を初期化します
     *
     * @example
     * FileUploadManager.initializeFileUploads();
     */
    static initializeFileUploads() {
        // 診断書ファイル
        FileUploadManager.setupFileUpload(
            'diagnosisFile',
            'diagnosisFileList'
        );

        // その他ファイル
        FileUploadManager.setupFileUpload('otherFile', 'otherFileList');
    }
}
