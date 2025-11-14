/**
 * FileUploadManagerモジュールのテスト
 * @jest-environment jsdom
 */

import { FileUploadManager } from '../js/core/FileUploadManager.js';

describe('FileUploadManager', () => {
    describe('formatFileSize', () => {
        test('0バイトの場合', () => {
            expect(FileUploadManager.formatFileSize(0)).toBe('0 Bytes');
        });

        test('バイト単位', () => {
            expect(FileUploadManager.formatFileSize(500)).toBe('500 Bytes');
        });

        test('KB単位', () => {
            expect(FileUploadManager.formatFileSize(1024)).toBe('1 KB');
            expect(FileUploadManager.formatFileSize(1536)).toBe('1.5 KB');
        });

        test('MB単位', () => {
            expect(FileUploadManager.formatFileSize(1048576)).toBe('1 MB');
            expect(FileUploadManager.formatFileSize(1572864)).toBe('1.5 MB');
        });

        test('GB単位', () => {
            expect(FileUploadManager.formatFileSize(1073741824)).toBe('1 GB');
        });

        test('小数点以下2桁まで', () => {
            expect(FileUploadManager.formatFileSize(1536000)).toBe('1.46 MB');
        });
    });

    describe('setupFileUpload', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <input type="file" id="testFile" />
                <div id="testFileList"></div>
            `;
        });

        test('ファイル入力要素にイベントリスナーが追加される', () => {
            const fileInput = document.getElementById('testFile');
            const addEventListener = jest.spyOn(fileInput, 'addEventListener');

            FileUploadManager.setupFileUpload('testFile', 'testFileList');

            expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        });

        test('要素が見つからない場合は警告のみ', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            FileUploadManager.setupFileUpload('nonexistent', 'testFileList');
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('displayFileList', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <div id="testFileList"></div>
            `;
        });

        test('ファイルリストが正しく表示される', () => {
            const mockFiles = [
                { name: 'test1.pdf', size: 1024 },
                { name: 'test2.jpg', size: 2048 }
            ];

            FileUploadManager.displayFileList(mockFiles, 'testFileList', 'testFile');

            const listElement = document.getElementById('testFileList');
            expect(listElement.children.length).toBe(2);
            expect(listElement.textContent).toContain('test1.pdf');
            expect(listElement.textContent).toContain('test2.jpg');
            expect(listElement.textContent).toContain('1 KB');
            expect(listElement.textContent).toContain('2 KB');
        });

        test('空のファイルリストの場合は要素がクリアされる', () => {
            FileUploadManager.displayFileList([], 'testFileList', 'testFile');

            const listElement = document.getElementById('testFileList');
            expect(listElement.innerHTML).toBe('');
        });

        test('削除ボタンがレンダリングされる', () => {
            const mockFiles = [{ name: 'test.pdf', size: 1024 }];

            FileUploadManager.displayFileList(mockFiles, 'testFileList', 'testFile');

            const listElement = document.getElementById('testFileList');
            const removeButton = listElement.querySelector('button.btn-remove');
            expect(removeButton).not.toBeNull();
            expect(removeButton.textContent).toBe('削除');
        });

        test('要素が見つからない場合は警告のみ', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const mockFiles = [{ name: 'test.pdf', size: 1024 }];

            FileUploadManager.displayFileList(mockFiles, 'nonexistent', 'testFile');

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('removeFile', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <input type="file" id="testFile" />
                <div id="testFileList"></div>
            `;
        });

        test('ファイルが正しく削除される', () => {
            const fileInput = document.getElementById('testFile');

            // DataTransferを使って模擬ファイルを作成
            const dt = new DataTransfer();
            const file1 = new File(['content1'], 'test1.pdf', { type: 'application/pdf' });
            const file2 = new File(['content2'], 'test2.jpg', { type: 'image/jpeg' });
            dt.items.add(file1);
            dt.items.add(file2);
            fileInput.files = dt.files;

            // 最初のファイルを削除
            FileUploadManager.removeFile('testFileList', 'testFile', 0);

            // 残りのファイルは1つだけ
            expect(fileInput.files.length).toBe(1);
            expect(fileInput.files[0].name).toBe('test2.jpg');
        });

        test('要素が見つからない場合は警告のみ', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            FileUploadManager.removeFile('testFileList', 'nonexistent', 0);

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('initializeFileUploads', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <input type="file" id="diagnosisFile" />
                <div id="diagnosisFileList"></div>
                <input type="file" id="otherFile" />
                <div id="otherFileList"></div>
            `;
        });

        test('すべてのファイルアップロード要素が初期化される', () => {
            const diagnosisInput = document.getElementById('diagnosisFile');
            const otherInput = document.getElementById('otherFile');

            const addEventListenerSpy1 = jest.spyOn(diagnosisInput, 'addEventListener');
            const addEventListenerSpy2 = jest.spyOn(otherInput, 'addEventListener');

            FileUploadManager.initializeFileUploads();

            expect(addEventListenerSpy1).toHaveBeenCalledWith('change', expect.any(Function));
            expect(addEventListenerSpy2).toHaveBeenCalledWith('change', expect.any(Function));
        });
    });
});
