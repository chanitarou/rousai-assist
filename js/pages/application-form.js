/**
 * 労災申請アシストサイト - 8号申請画面 JavaScript
 *
 * このファイルは労災保険給付（様式第8号）の申請フォームの機能を提供します。
 * 多段階フォーム、リアルタイムバリデーション、自動保存、住所検索などの機能を含みます。
 *
 * @file application-form.js
 * @version 1.0.0
 * @requires js/common.js
 */

// グローバル変数
let currentStep = 1;
const totalSteps = 9;
let formData = {};

// モバイルデバイス判定（スマホ・タブレット対応）
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

// ステップ情報の定義
const steps = [
    { id: 1, label: '基本情報', role: 'worker' },
    { id: 2, label: '保険番号', role: 'worker' },
    { id: 3, label: '災害情報', role: 'worker' },
    { id: 4, label: '振込先', role: 'worker' },
    { id: 5, label: '添付書類', role: 'worker' },
    { id: 6, label: '事業主情報', role: 'employer' },
    { id: 7, label: '医療機関', role: 'medical' },
    { id: 8, label: '診断証明', role: 'medical' },
    { id: 9, label: '確認・提出', role: 'worker' }
];

// 労災保険指定医療機関データ（30件のサンプルデータ）
const medicalInstitutions = [
    {
        id: "0511757",
        name: "医療法人東京堂港町歯科クリニック",
        postalCode: "011-0946",
        address: "秋田市土崎港中央３丁目５－４０",
        phone: "018-857-1040",
        region: "秋田県",
        type: "歯科診療所"
    },
    {
        id: "0832081",
        name: "東京医科大学茨城医療センター",
        postalCode: "300-0395",
        address: "稲敷郡阿見町中央３－２０－１",
        phone: "029-887-1161",
        region: "茨城県",
        type: "総合病院"
    },
    {
        id: "1125354",
        name: "学校法人　ＳＢＣ東京医療大学附属　上青木整形外科",
        postalCode: "333-0845",
        address: "川口市上青木西４－１４－１２",
        phone: "048-264-3232",
        region: "埼玉県",
        type: "整形外科"
    },
    {
        id: "1165411",
        name: "医療法人財団　東京勤労者医療会　みさとメンタルクリニック",
        postalCode: "341-0038",
        address: "三郷市中央１－１６－１　みさと中央医療福祉ビル３Ｆ",
        phone: "048-953-6108",
        region: "埼玉県",
        type: "精神科診療所"
    },
    {
        id: "1165925",
        name: "医療法人財団東京勤労者医療会みさと協立病院",
        postalCode: "341-0016",
        address: "三郷市田中新田２７３－１",
        phone: "048-959-1811",
        region: "埼玉県",
        type: "総合病院"
    },
    {
        id: "1174762",
        name: "医療法人社団仁岳会西東京歯科医院飯能分院",
        postalCode: "357-0038",
        address: "飯能市仲町２－２馬場ビル１Ｆ",
        phone: "042-974-1033",
        region: "埼玉県",
        type: "歯科診療所"
    },
    {
        id: "1214063",
        name: "医療法人社団葵会東京ベイ先端医療幕張クリニック",
        postalCode: "261-0024",
        address: "千葉市美浜区豊砂１－１７",
        phone: "043-299-2000",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1214349",
        name: "医療法人社団クリノヴェイション東京ビジネスクリニック千葉エキナカ",
        postalCode: "260-0031",
        address: "千葉市中央区新千葉１－１－１ペリエ千葉エキナカ４階",
        phone: "043-215-8111",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1214659",
        name: "東京ビジネスクリニックファミリアペリエ千葉",
        postalCode: "260-0031",
        address: "千葉市中央区新千葉１－１－１ペリエ千葉６階",
        phone: "043-306-8675",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1220021",
        name: "学校法人東京歯科大学市川総合病院",
        postalCode: "272-0824",
        address: "市川市菅野５－１１－１３",
        phone: "047-322-0151",
        region: "千葉県",
        type: "総合病院"
    },
    {
        id: "1223771",
        name: "学校法人東京女子医科大学附属八千代医療センター",
        postalCode: "276-8524",
        address: "八千代市大和田新田４７７－９６",
        phone: "047-450-6000",
        region: "千葉県",
        type: "総合病院"
    },
    {
        id: "1223810",
        name: "医療法人社団保健会東京湾岸リハビリテーション病院",
        postalCode: "275-0026",
        address: "習志野市谷津４－１－１",
        phone: "047-453-9000",
        region: "千葉県",
        type: "リハビリテーション病院"
    },
    {
        id: "1224123",
        name: "東京ベイ・浦安市川医療センター",
        postalCode: "279-0001",
        address: "浦安市当代島３－４－３２",
        phone: "047-351-3101",
        region: "千葉県",
        type: "総合病院"
    },
    {
        id: "1224646",
        name: "医療法人社団志友会東京ベイサイドクリニック",
        postalCode: "273-0012",
        address: "船橋市浜町２－１－１ららぽーとＴ０ＫＹ０－ＢＡＹ西館３階",
        phone: "047-495-0013",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1225863",
        name: "学校法人　ＳＢＣ東京医療大学附属高洲整形外科",
        postalCode: "279-0023",
        address: "浦安市高洲２－４－１０インシップビル２階",
        phone: "047-380-5050",
        region: "千葉県",
        type: "整形外科"
    },
    {
        id: "1230476",
        name: "医療法人社団誠馨会　新東京クリニック",
        postalCode: "271-0077",
        address: "松戸市根本４７３－１",
        phone: "047-366-7000",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1230921",
        name: "医療法人杜団　誠馨会　新東京クリニック松飛台",
        postalCode: "270-2215",
        address: "松戸市串崎南町２７番地",
        phone: "047-384-3111",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1231103",
        name: "（医財）東京勤労者医療会東葛病院",
        postalCode: "270-0153",
        address: "流山市中１０２",
        phone: "04-7159-1011",
        region: "千葉県",
        type: "総合病院"
    },
    {
        id: "1231332",
        name: "学校法人慈恵大学東京慈恵会医科大学附属柏病院",
        postalCode: "277-8567",
        address: "柏市柏下１６３－１",
        phone: "04-7164-1111",
        region: "千葉県",
        type: "総合病院"
    },
    {
        id: "1231723",
        name: "医療法人財団東京勤労者医療会野田南部診療所",
        postalCode: "278-0022",
        address: "野田市山崎１７３７－２",
        phone: "04-7121-0171",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1231987",
        name: "医療法人財団東京勤労者医療会東葛病院付属診療所",
        postalCode: "270-0174",
        address: "流山市下花輪４０９－６",
        phone: "04-7158-7710",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1232428",
        name: "医療法人社団誠馨会　新東京ハートクリニック",
        postalCode: "271-0077",
        address: "松戸市根本４７４ー１",
        phone: "047-366-3333",
        region: "千葉県",
        type: "専門診療所"
    },
    {
        id: "1232941",
        name: "医療法人財団東京勤労者医療会東葛歯科",
        postalCode: "270-0174",
        address: "流山市下花輪４０９－６",
        phone: "04-7159-6775",
        region: "千葉県",
        type: "歯科診療所"
    },
    {
        id: "1233386",
        name: "医療法人財団東京勤労者医療会新松戸診療所",
        postalCode: "270-0034",
        address: "松戸市新松戸４－２",
        phone: "047-343-9271",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1233602",
        name: "医療法人社団誠馨会　新東京病院",
        postalCode: "270-2232",
        address: "松戸市和名ヶ谷１２７１番地",
        phone: "047-711-8700",
        region: "千葉県",
        type: "総合病院"
    },
    {
        id: "1233963",
        name: "医療法人財団東京勤労者医療会東葛病院付属流山セントラルパーク駅前診療所",
        postalCode: "270-0152",
        address: "流山市前平井１５５",
        phone: "04-7157-0100",
        region: "千葉県",
        type: "診療所"
    },
    {
        id: "1300016",
        name: "独立行政法人労働者健康安全機構東京労災病院",
        postalCode: "143-0013",
        address: "大田区大森南４－１３－２１",
        phone: "03-3742-7301",
        region: "東京都",
        type: "労災病院"
    },
    {
        id: "1301021",
        name: "医療法人社団　ＢＲＡＩＶＥ　東京ホームクリニック",
        postalCode: "160-0011",
        address: "新宿区若葉２丁目１２番地２　モンヴェール四ツ谷１０２",
        phone: "03-5990-2813",
        region: "東京都",
        type: "診療所"
    },
    {
        id: "1301179",
        name: "東京メディカルテラス",
        postalCode: "107-0061",
        address: "港区北青山２－１３－４　青山ＭＹビル４階",
        phone: "03-6721-1899",
        region: "東京都",
        type: "診療所"
    },
    {
        id: "1310054",
        name: "東京都神津島村国民健康保険直営診療所",
        postalCode: "100-0601",
        address: "東京都神津島村１００９番地１",
        phone: "04992-8-1121",
        region: "東京都",
        type: "公立診療所"
    }
];

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeProgress();
    loadFormData();
    setupAutoSave();
    setupRealtimeValidation();
    setupFileUpload();
});

// プログレスステップの初期化
function initializeProgress() {
    const progressSteps = document.getElementById('progressSteps');
    progressSteps.innerHTML = '';

    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'progress-step';
        stepDiv.id = `progress-${step.id}`;

        if (step.id === currentStep) {
            stepDiv.classList.add('active');
        } else if (step.id < currentStep) {
            stepDiv.classList.add('completed');
        }

        const indicator = document.createElement('div');
        indicator.className = 'progress-step-indicator';
        indicator.textContent = step.id;

        const label = document.createElement('div');
        label.className = 'progress-step-label';
        label.textContent = step.label;

        if (index < steps.length - 1) {
            const line = document.createElement('div');
            line.className = 'progress-step-line';
            stepDiv.appendChild(line);
        }

        stepDiv.appendChild(indicator);
        stepDiv.appendChild(label);
        progressSteps.appendChild(stepDiv);
    });

    updateProgress();
}

// HTMLステップIDをプログレスバーステップIDにマッピング
function getProgressStep(htmlStep) {
    // HTML steps 1-8 map directly to progress steps 1-8
    if (htmlStep <= 8) return htmlStep;
    // HTML step 10 maps to progress step 9 (step-9 doesn't exist in HTML)
    if (htmlStep === 10) return 9;
    return htmlStep;
}

// プログレスバーの更新
function updateProgress() {
    const progressStep = getProgressStep(currentStep);
    const percentage = ((progressStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('currentStep').textContent = progressStep;
    document.getElementById('totalSteps').textContent = totalSteps;

    // プログレスステップの更新
    steps.forEach(step => {
        const indicator = document.getElementById(`progress-${step.id}`);
        if (indicator) {
            indicator.classList.remove('active', 'completed');
            if (step.id === progressStep) {
                indicator.classList.add('active');
            } else if (step.id < progressStep) {
                indicator.classList.add('completed');
            }
        }
    });
}

// バリデーションルール定義
const validationRules = {
    // ステップ1: 労働者基本情報
    lastName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【姓】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '姓'
    },
    firstName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【名】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '名'
    },
    lastNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【姓（フリガナ）】は全角カタカナで入力してください。例：ヤマダ',
        fieldName: '姓（フリガナ）'
    },
    firstNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【名（フリガナ）】は全角カタカナで入力してください。例：タロウ',
        fieldName: '名（フリガナ）'
    },
    birthDate: {
        required: true,
        validator: function(value) {
            if (!value) return false;
            const date = new Date(value);
            const today = new Date();
            const age = today.getFullYear() - date.getFullYear();
            return date < today && age >= 15 && age <= 100;
        },
        message: '【生年月日】を正しく入力してください。15歳以上100歳以下の日付を選択してください。',
        fieldName: '生年月日'
    },
    tel1: {
        required: true,
        pattern: /^[0-9]{2,5}$/,
        message: '【電話番号（1番目）】は2〜5桁の半角数字で入力してください。',
        fieldName: '電話番号（1番目）'
    },
    tel2: {
        required: true,
        pattern: /^[0-9]{1,4}$/,
        message: '【電話番号（2番目）】は1〜4桁の半角数字で入力してください。',
        fieldName: '電話番号（2番目）'
    },
    tel3: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【電話番号（3番目）】は4桁の半角数字で入力してください。',
        fieldName: '電話番号（3番目）'
    },
    postalCode1: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【郵便番号（前半）】は3桁の半角数字で入力してください。',
        fieldName: '郵便番号（前半）'
    },
    postalCode2: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【郵便番号（後半）】は4桁の半角数字で入力してください。',
        fieldName: '郵便番号（後半）'
    },
    address1: {
        required: true,
        minLength: 3,
        message: '【住所（都道府県・市区町村）】を入力してください。郵便番号検索ボタンで自動入力できます。',
        fieldName: '住所（都道府県・市区町村）'
    },
    address2: {
        required: true,
        minLength: 1,
        message: '【住所（番地・建物名等）】を入力してください。番地、建物名、部屋番号などを入力してください。',
        fieldName: '住所（番地・建物名等）'
    },

    // ステップ2: 労働保険番号・職種情報
    insuranceMain: {
        required: true,
        pattern: /^[0-9]{11}$/,
        message: '【労働保険番号（前半）】は11桁の数字で入力してください。',
        fieldName: '労働保険番号（前半11桁）'
    },
    insuranceBranch: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【労働保険番号（後半）】は3桁の数字で入力してください。',
        fieldName: '労働保険番号（後半3桁）'
    },
    occupation: {
        required: true,
        minLength: 2,
        message: '【職種】を入力してください。例：製造業、事務職、建設作業員',
        fieldName: '職種'
    },
    averageWage: {
        required: true,
        validator: function(value) {
            const num = parseFloat(value);
            return !isNaN(num) && num > 0 && num <= 1000000;
        },
        message: '【平均賃金（日額）】は1円以上100万円以下の数値で入力してください。',
        fieldName: '平均賃金（日額）'
    },

    // ステップ3: 災害情報
    injuryDate: {
        required: true,
        validator: function(value) {
            if (!value) return false;
            const date = new Date(value);
            const today = new Date();
            const threeYearsAgo = new Date();
            threeYearsAgo.setFullYear(today.getFullYear() - 3);
            return date >= threeYearsAgo && date <= today;
        },
        message: '【負傷または発病年月日】は過去3年以内の日付を入力してください。未来の日付は入力できません。',
        fieldName: '負傷または発病年月日'
    },
    injuryHour: {
        required: true,
        message: '【災害発生時刻（時）】を選択してください。',
        fieldName: '災害発生時刻（時）'
    },
    injuryMinute: {
        required: true,
        message: '【災害発生時刻（分）】を選択してください。',
        fieldName: '災害発生時刻（分）'
    },
    accidentLocation: {
        required: true,
        minLength: 3,
        message: '【災害発生場所】を具体的に入力してください。例：工場内第2作業場、事務所3階会議室',
        fieldName: '災害発生場所'
    },
    accidentDescription: {
        required: true,
        minLength: 20,
        message: '【災害発生状況】は20文字以上で詳しく記入してください。いつ、どこで、何をしている時に、どのような災害が発生したかを具体的に記入してください。',
        fieldName: '災害発生状況'
    },
    leaveStartDate: {
        required: true,
        validator: function(value) {
            if (!value) return false;
            const injuryDate = document.getElementById('injuryDate')?.value;
            if (!injuryDate) return true;
            return new Date(value) >= new Date(injuryDate);
        },
        message: '【休業開始日】は負傷または発病年月日以降の日付を入力してください。',
        fieldName: '休業開始日'
    },
    leaveEndDate: {
        required: true,
        validator: function(value) {
            if (!value) return false;
            const startDate = document.getElementById('leaveStartDate')?.value;
            if (!startDate) return true;
            return new Date(value) >= new Date(startDate);
        },
        message: '【休業終了日（予定）】は休業開始日以降の日付を入力してください。',
        fieldName: '休業終了日（予定）'
    },

    // ステップ4: 振込先情報
    bankName: {
        required: true,
        minLength: 2,
        message: '【金融機関名】を入力してください。例：三菱UFJ銀行、みずほ銀行',
        fieldName: '金融機関名'
    },
    branchName: {
        required: true,
        minLength: 2,
        message: '【支店名】を入力してください。例：本店、東京支店',
        fieldName: '支店名'
    },
    accountNumber: {
        required: true,
        pattern: /^[0-9]{1,8}$/,
        message: '【口座番号】は半角数字で1～8桁で入力してください。',
        fieldName: '口座番号'
    },
    accountHolderLastNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【口座名義人 姓（カナ）】は全角カタカナで入力してください。例：ヤマダ',
        fieldName: '口座名義人 姓（カナ）'
    },
    accountHolderFirstNameKana: {
        required: true,
        pattern: /^[\u30A0-\u30FF]+$/,
        message: '【口座名義人 名（カナ）】は全角カタカナで入力してください。例：タロウ',
        fieldName: '口座名義人 名（カナ）'
    },

    // 回覧依頼セクション
    employerEmail: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '【事業主メールアドレス】を正しい形式で入力してください。例：employer@example.com',
        fieldName: '事業主メールアドレス'
    },

    // ステップ6: 事業主情報
    businessPostalCode1: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【事業の所在地 郵便番号（前半）】は3桁の半角数字で入力してください。',
        fieldName: '事業の所在地 郵便番号（前半）'
    },
    businessPostalCode2: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【事業の所在地 郵便番号（後半）】は4桁の半角数字で入力してください。',
        fieldName: '事業の所在地 郵便番号（後半）'
    },
    businessAddress1: {
        required: true,
        minLength: 3,
        message: '【事業の所在地（都道府県・市区町村）】を入力してください。郵便番号検索ボタンで自動入力できます。',
        fieldName: '事業の所在地（都道府県・市区町村）'
    },
    businessAddress2: {
        required: true,
        minLength: 1,
        message: '【事業の所在地（番地・建物名等）】を入力してください。番地、建物名、部屋番号などを入力してください。',
        fieldName: '事業の所在地（番地・建物名等）'
    },

    // ステップ7: 医療機関情報
    hospitalPostalCode1: {
        required: true,
        pattern: /^[0-9]{3}$/,
        message: '【医療機関 郵便番号（前半）】は3桁の半角数字で入力してください。',
        fieldName: '医療機関 郵便番号（前半）'
    },
    hospitalPostalCode2: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【医療機関 郵便番号（後半）】は4桁の半角数字で入力してください。',
        fieldName: '医療機関 郵便番号（後半）'
    },
    hospitalAddress1: {
        required: true,
        minLength: 3,
        message: '【病院又は診療所の所在地（都道府県・市区町村）】を入力してください。郵便番号検索ボタンで自動入力できます。',
        fieldName: '病院又は診療所の所在地（都道府県・市区町村）'
    },
    hospitalAddress2: {
        required: true,
        minLength: 1,
        message: '【病院又は診療所の所在地（番地・建物名等）】を入力してください。番地、建物名、部屋番号などを入力してください。',
        fieldName: '病院又は診療所の所在地（番地・建物名等）'
    },
    medicalDate: {
        required: true,
        message: '【記入日】を入力してください。',
        fieldName: '記入日'
    },
    hospitalName: {
        required: true,
        minLength: 2,
        message: '【病院又は診療所の名称】を入力してください。例：〇〇病院、△△診療所',
        fieldName: '病院又は診療所の名称'
    },
    doctorLastName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【担当者 姓】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '担当者 姓'
    },
    doctorFirstName: {
        required: true,
        pattern: /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
        message: '【担当者 名】を正しく入力してください。漢字、ひらがな、カタカナのいずれかで入力してください。',
        fieldName: '担当者 名'
    },
    hospitalTel1: {
        required: true,
        pattern: /^[0-9]{2,5}$/,
        message: '【病院電話番号（1番目）】は2〜5桁の半角数字で入力してください。',
        fieldName: '病院電話番号（1番目）'
    },
    hospitalTel2: {
        required: true,
        pattern: /^[0-9]{1,4}$/,
        message: '【病院電話番号（2番目）】は1〜4桁の半角数字で入力してください。',
        fieldName: '病院電話番号（2番目）'
    },
    hospitalTel3: {
        required: true,
        pattern: /^[0-9]{4}$/,
        message: '【病院電話番号（3番目）】は4桁の半角数字で入力してください。',
        fieldName: '病院電話番号（3番目）'
    },

    // ステップ8: 診断証明
    injuryPart: {
        required: true,
        minLength: 2,
        message: '【傷病の部位及び傷病名】を入力してください。例：腰部打撲、右手首捻挫',
        fieldName: '傷病の部位及び傷病名'
    },
    treatmentStartDate: {
        required: true,
        message: '【療養開始日】を入力してください。',
        fieldName: '療養開始日'
    },
    treatmentEndDate: {
        required: true,
        message: '【療養終了日】を入力してください。',
        fieldName: '療養終了日'
    },
    treatmentDays: {
        required: true,
        validator: function(value) {
            const num = parseInt(value, 10);
            return !isNaN(num) && num > 0 && num <= 999;
        },
        message: '【診療実日数】は1〜999の数値で入力してください。',
        fieldName: '診療実日数'
    },
    treatmentStatus: {
        required: true,
        message: '【療養の現況】を選択してください。',
        fieldName: '療養の現況'
    }
};

// 次のステップへ
function nextStep() {
    if (validateCurrentStep()) {
        saveCurrentStepData();

        // ステップ5の場合は回覧セクションを表示
        if (currentStep === 5) {
            showCirculationSection();
            window.scrollTo(0, 0);
            return;
        }

        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep++;

        if (currentStep <= totalSteps) {
            const nextStepElement = document.getElementById(`step-${currentStep}`);
            if (nextStepElement) {
                nextStepElement.classList.add('active');
            }
            updateProgress();
            window.scrollTo(0, 0);
        }
    }
}

// 次のステップへ（開発用：バリデーションスキップ）
function nextStepDev() {
    // 回覧セクションが表示されている場合
    const circulationSection = document.getElementById('circulation-section');
    if (circulationSection && circulationSection.classList.contains('active')) {
        // 回覧完了画面へ遷移
        window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        return;
    }

    // ステップ5の場合は回覧セクションを表示
    if (currentStep === 5) {
        showCirculationSection();
        window.scrollTo(0, 0);
        return;
    }

    // ステップ6（事業主情報）の場合は回覧完了画面へ遷移
    if (currentStep === 6) {
        localStorage.setItem('completedBy', 'employer');
        window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        return;
    }

    // ステップ8（診断証明）の場合は回覧完了画面へ遷移
    if (currentStep === 8) {
        localStorage.setItem('completedBy', 'medical');
        window.location.href = '労災申請アシストサイト_回覧完了画面.html';
        return;
    }

    document.getElementById(`step-${currentStep}`).classList.remove('active');
    currentStep++;

    if (currentStep <= totalSteps) {
        const nextStepElement = document.getElementById(`step-${currentStep}`);
        if (nextStepElement) {
            nextStepElement.classList.add('active');
        }
        updateProgress();
        window.scrollTo(0, 0);
    }
}

// 前のステップへ
function previousStep() {
    saveCurrentStepData();

    document.getElementById(`step-${currentStep}`).classList.remove('active');
    currentStep--;

    if (currentStep >= 1) {
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateProgress();
        window.scrollTo(0, 0);
    }
}

// バリデーション
function validateCurrentStep() {
    const stepElement = document.getElementById(`step-${currentStep}`);
    let isValid = true;

    // エラー状態をリセット
    stepElement.querySelectorAll('.form-input, .form-select').forEach(input => {
        input.classList.remove('error');
    });
    stepElement.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });

    // 郵便番号・電話番号の複合バリデーション（ステップ1の場合）
    if (currentStep === 1) {
        // 性別のバリデーション
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        const isGenderChecked = Array.from(genderRadios).some(radio => radio.checked);

        if (!isGenderChecked) {
            const genderError = document.getElementById('gender-error');
            if (genderError) {
                genderError.textContent = '【性別】を選択してください。';
                genderError.classList.add('show');
            }
            isValid = false;
        }

        // 郵便番号の複合バリデーション
        const postalFields = ['postalCode1', 'postalCode2'];
        let allPostalFieldsFilled = true;

        postalFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                allPostalFieldsFilled = false;
            }
        });

        if (!allPostalFieldsFilled) {
            postalFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    field.classList.add('error');
                }
            });

            const postalError = document.getElementById('postalCode-error');
            if (postalError) {
                postalError.textContent = '【郵便番号】は前半3桁、後半4桁で入力してください。例：123-4567';
                postalError.classList.add('show');
            }
            isValid = false;
        }

        // 電話番号の複合バリデーション
        const telFields = ['tel1', 'tel2', 'tel3'];
        let allTelFieldsFilled = true;

        telFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                allTelFieldsFilled = false;
            }
        });

        if (!allTelFieldsFilled) {
            telFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                const rule = validationRules[fieldId];
                if (rule && (!field || !field.value.trim())) {
                    if (field) field.classList.add('error');
                }
            });

            const telError = document.getElementById('tel-error');
            if (telError) {
                telError.textContent = '【電話番号】はすべての項目を入力してください。3つの入力欄すべてに入力してください。';
                telError.classList.add('show');
            }
            isValid = false;
        }
    }

    // 労働保険番号の複合バリデーション（ステップ2の場合）
    if (currentStep === 2) {
        const insuranceFields = ['insuranceMain', 'insuranceBranch'];
        let allInsuranceFieldsFilled = true;

        insuranceFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                allInsuranceFieldsFilled = false;
            }
        });

        if (!allInsuranceFieldsFilled) {
            insuranceFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                const rule = validationRules[fieldId];
                if (rule && (!field || !field.value.trim())) {
                    if (field) field.classList.add('error');
                }
            });

            const insuranceError = document.getElementById('insurance-error');
            if (insuranceError) {
                insuranceError.textContent = '【労働保険番号】はすべての項目を入力してください。前半11桁と後半3桁の両方を正しく入力してください。';
                insuranceError.classList.add('show');
            }
            isValid = false;
        }
    }

    // 災害発生時刻の複合バリデーション（ステップ3の場合）
    if (currentStep === 3) {
        const hour = document.getElementById('injuryHour');
        const minute = document.getElementById('injuryMinute');

        if ((!hour || !hour.value) || (!minute || !minute.value)) {
            if (hour && !hour.value) hour.classList.add('error');
            if (minute && !minute.value) minute.classList.add('error');

            const timeError = document.getElementById('injuryTime-error');
            if (timeError) {
                timeError.textContent = '【災害発生時刻】の時と分の両方を選択してください。';
                timeError.classList.add('show');
            }
            isValid = false;
        }
    }

    // 口座種別のバリデーション（ステップ4の場合）
    if (currentStep === 4) {
        const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
        const isAccountTypeChecked = Array.from(accountTypeRadios).some(radio => radio.checked);

        if (!isAccountTypeChecked) {
            const accountTypeError = document.getElementById('accountType-error');
            if (accountTypeError) {
                accountTypeError.textContent = '【口座種別】を選択してください。';
                accountTypeError.classList.add('show');
            }
            isValid = false;
        }
    }

    // 郵便番号・電話番号の複合バリデーション（ステップ7の場合）
    if (currentStep === 7) {
        // 郵便番号の複合バリデーション
        const postalFields = ['hospitalPostalCode1', 'hospitalPostalCode2'];
        let allPostalFieldsFilled = true;

        postalFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                allPostalFieldsFilled = false;
            }
        });

        if (!allPostalFieldsFilled) {
            postalFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    field.classList.add('error');
                }
            });

            const postalError = document.getElementById('hospitalPostalCode-error');
            if (postalError) {
                postalError.textContent = '【医療機関 郵便番号】は前半3桁、後半4桁で入力してください。例：123-4567';
                postalError.classList.add('show');
            }
            isValid = false;
        }

        // 電話番号の複合バリデーション
        const telFields = ['hospitalTel1', 'hospitalTel2', 'hospitalTel3'];
        let allTelFieldsFilled = true;

        telFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                allTelFieldsFilled = false;
            }
        });

        if (!allTelFieldsFilled) {
            telFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !field.value.trim()) {
                    field.classList.add('error');
                }
            });

            const telError = document.getElementById('hospitalTel-error');
            if (telError) {
                telError.textContent = '【電話番号】をすべて入力してください';
                telError.classList.add('show');
            }
            isValid = false;
        }
    }

    // フィールドのバリデーション
    stepElement.querySelectorAll('.form-label-required').forEach(label => {
        const formGroup = label.closest('.form-group');
        const input = formGroup.querySelector('.form-input:not([type="radio"]):not([type="checkbox"])');
        const selectInput = formGroup.querySelector('.form-select');
        const radioButtons = formGroup.querySelectorAll('.form-radio');
        const targetInput = input || selectInput;

        if (targetInput) {
            const fieldId = targetInput.id;
            const rule = validationRules[fieldId];

            if (rule) {
                let hasError = false;
                let errorMessage = '';

                if (rule.required && !targetInput.value.trim()) {
                    hasError = true;
                    errorMessage = rule.message;
                } else if (targetInput.value.trim()) {
                    if (rule.pattern && !rule.pattern.test(targetInput.value)) {
                        hasError = true;
                        errorMessage = rule.message;
                    } else if (rule.validator && !rule.validator(targetInput.value)) {
                        hasError = true;
                        errorMessage = rule.message;
                    } else if (rule.minLength && targetInput.value.length < rule.minLength) {
                        hasError = true;
                        errorMessage = rule.message;
                    }
                }

                if (hasError) {
                    isValid = false;
                    targetInput.classList.add('error');

                    const errorElement = document.getElementById(`${fieldId}-error`);
                    if (errorElement) {
                        errorElement.textContent = errorMessage;
                        errorElement.classList.add('show');
                    }
                }
            }
        } else if (radioButtons.length > 0) {
            // 既に専用バリデーションで処理されているラジオボタンはスキップ
            const firstRadio = radioButtons[0];
            const radioName = firstRadio ? firstRadio.name : '';
            const skipRadioNames = ['gender', 'accountType']; // 専用バリデーション済み

            if (!skipRadioNames.includes(radioName)) {
                const isChecked = Array.from(radioButtons).some(radio => radio.checked);
                if (!isChecked) {
                    isValid = false;
                    // ラベルテキストを取得してエラーメッセージを動的に生成
                    const labelText = label.textContent.trim();
                    const errorElement = formGroup.querySelector('.error-message');
                    if (errorElement) {
                        errorElement.textContent = `【${labelText}】を選択してください。`;
                        errorElement.classList.add('show');
                    }
                }
            }
        }
    });

    // 最初のエラーフィールドにスクロール（モバイルではフォーカスしない）
    if (!isValid) {
        setTimeout(() => {
            const firstErrorField = stepElement.querySelector('.form-input.error, .form-select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // スマホではキーボード自動表示を防ぐためフォーカスしない
                if (!isMobileDevice()) {
                    firstErrorField.focus();
                }
            }
        }, 100);
    }

    return isValid;
}

// フォームデータの保存
function saveCurrentStepData() {
    const stepElement = document.getElementById(`step-${currentStep}`);
    const inputs = stepElement.querySelectorAll('.form-input, .form-radio, .form-checkbox, .form-textarea');

    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.checked) {
                formData[input.name || input.id] = input.value;
            }
        } else {
            formData[input.id] = input.value;
        }
    });

    localStorage.setItem('rosaiFormData', JSON.stringify(formData));
}

// フォームデータの読み込み
function loadFormData() {
    const savedData = localStorage.getItem('rosaiFormData');
    if (savedData) {
        formData = JSON.parse(savedData);

        Object.keys(formData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'radio' || element.type === 'checkbox') {
                    element.checked = true;
                } else {
                    element.value = formData[key];
                }

                // address1が自動入力済みの場合は非活性化
                if (key === 'address1' && formData[key]) {
                    element.disabled = true;
                    element.style.backgroundColor = 'var(--color-gray-100)';
                    element.style.cursor = 'not-allowed';
                }
            }
        });
    }
}

// 自動保存の設定
function setupAutoSave() {
    setInterval(() => {
        saveCurrentStepData();
    }, 30000); // 30秒ごとに保存
}

// リアルタイムバリデーション
function setupRealtimeValidation() {
    document.querySelectorAll('.form-input, .form-select').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });

        input.addEventListener('change', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    // 労働保険番号の複合バリデーション用リアルタイムチェック
    const insuranceMain = document.getElementById('insuranceMain');
    const insuranceBranch = document.getElementById('insuranceBranch');
    const insuranceError = document.getElementById('insurance-error');

    function validateInsuranceFields(isBlurEvent = false) {
        const mainValue = insuranceMain ? insuranceMain.value.trim() : '';
        const branchValue = insuranceBranch ? insuranceBranch.value.trim() : '';

        // 両方のフィールドが正しく入力されているかチェック
        const mainValid = /^[0-9]{11}$/.test(mainValue);
        const branchValid = /^[0-9]{3}$/.test(branchValue);

        // 両方とも正しい場合
        if (mainValid && branchValid) {
            insuranceError.classList.remove('show');
            insuranceMain.classList.remove('error');
            insuranceBranch.classList.remove('error');
        }
        // blur時、またはすでにエラー表示中の場合にエラーをチェック
        else if (isBlurEvent || insuranceError.classList.contains('show')) {
            // いずれかのフィールドが空または不正な場合
            if (!mainValue || !branchValue || !mainValid || !branchValid) {
                insuranceError.textContent = '【労働保険番号】はすべての項目を入力してください。前半11桁と後半3桁の両方を正しく入力してください。';
                insuranceError.classList.add('show');
                if (!mainValue || !mainValid) insuranceMain.classList.add('error');
                if (!branchValue || !branchValid) insuranceBranch.classList.add('error');
            }
        }
    }

    if (insuranceMain && insuranceBranch) {
        insuranceMain.addEventListener('blur', () => validateInsuranceFields(true));
        insuranceBranch.addEventListener('blur', () => validateInsuranceFields(true));
        insuranceMain.addEventListener('input', () => validateInsuranceFields(false));
        insuranceBranch.addEventListener('input', () => validateInsuranceFields(false));
    }

    // 電話番号の複合バリデーション用リアルタイムチェック
    const tel1 = document.getElementById('tel1');
    const tel2 = document.getElementById('tel2');
    const tel3 = document.getElementById('tel3');
    const telError = document.getElementById('tel-error');

    function validateTelFields(isBlurEvent = false) {
        const tel1Value = tel1 ? tel1.value.trim() : '';
        const tel2Value = tel2 ? tel2.value.trim() : '';
        const tel3Value = tel3 ? tel3.value.trim() : '';

        // 3つのフィールドが正しく入力されているかチェック
        const tel1Valid = /^[0-9]{2,5}$/.test(tel1Value);
        const tel2Valid = /^[0-9]{1,4}$/.test(tel2Value);
        const tel3Valid = /^[0-9]{4}$/.test(tel3Value);

        // すべて正しい場合
        if (tel1Valid && tel2Valid && tel3Valid) {
            telError.classList.remove('show');
            tel1.classList.remove('error');
            tel2.classList.remove('error');
            tel3.classList.remove('error');
        }
        // blur時、またはすでにエラー表示中の場合にエラーをチェック
        else if (isBlurEvent || telError.classList.contains('show')) {
            // いずれかのフィールドが空または不正な場合
            if (!tel1Value || !tel2Value || !tel3Value || !tel1Valid || !tel2Valid || !tel3Valid) {
                telError.textContent = '【電話番号】はすべての項目を入力してください。3つの入力欄すべてに入力してください。';
                telError.classList.add('show');
                if (!tel1Value || !tel1Valid) tel1.classList.add('error');
                if (!tel2Value || !tel2Valid) tel2.classList.add('error');
                if (!tel3Value || !tel3Valid) tel3.classList.add('error');
            }
        }
    }

    if (tel1 && tel2 && tel3) {
        tel1.addEventListener('blur', () => validateTelFields(true));
        tel2.addEventListener('blur', () => validateTelFields(true));
        tel3.addEventListener('blur', () => validateTelFields(true));
        tel1.addEventListener('input', () => validateTelFields(false));
        tel2.addEventListener('input', () => validateTelFields(false));
        tel3.addEventListener('input', () => validateTelFields(false));
    }

    // 災害発生時刻の複合バリデーション用リアルタイムチェック
    const injuryHour = document.getElementById('injuryHour');
    const injuryMinute = document.getElementById('injuryMinute');
    const injuryTimeError = document.getElementById('injuryTime-error');

    function validateInjuryTimeFields(isBlurEvent = false) {
        const hourValue = injuryHour ? injuryHour.value : '';
        const minuteValue = injuryMinute ? injuryMinute.value : '';

        // 両方とも選択されている場合
        if (hourValue && minuteValue) {
            injuryTimeError.classList.remove('show');
            injuryHour.classList.remove('error');
            injuryMinute.classList.remove('error');
        }
        // blur/change時、またはすでにエラー表示中の場合にエラーをチェック
        else if (isBlurEvent || injuryTimeError.classList.contains('show')) {
            // いずれかのフィールドが未選択の場合
            if (!hourValue || !minuteValue) {
                injuryTimeError.textContent = '【災害発生時刻】の時と分の両方を選択してください。';
                injuryTimeError.classList.add('show');
                if (!hourValue) injuryHour.classList.add('error');
                if (!minuteValue) injuryMinute.classList.add('error');
            }
        }
    }

    if (injuryHour && injuryMinute) {
        injuryHour.addEventListener('blur', () => validateInjuryTimeFields(true));
        injuryMinute.addEventListener('blur', () => validateInjuryTimeFields(true));
        injuryHour.addEventListener('change', () => validateInjuryTimeFields(false));
        injuryMinute.addEventListener('change', () => validateInjuryTimeFields(false));
    }

    // 事業主電話番号の複合バリデーション用リアルタイムチェック
    const employerTel1 = document.getElementById('employerTel1');
    const employerTel2 = document.getElementById('employerTel2');
    const employerTel3 = document.getElementById('employerTel3');
    const employerTelError = document.getElementById('employerTel-error');

    function validateEmployerTelFields(isBlurEvent = false) {
        if (!employerTel1 || !employerTel2 || !employerTel3 || !employerTelError) return;

        const tel1Value = employerTel1.value.trim();
        const tel2Value = employerTel2.value.trim();
        const tel3Value = employerTel3.value.trim();

        const tel1Valid = /^[0-9]{2,5}$/.test(tel1Value);
        const tel2Valid = /^[0-9]{1,4}$/.test(tel2Value);
        const tel3Valid = /^[0-9]{4}$/.test(tel3Value);

        if (tel1Valid && tel2Valid && tel3Valid) {
            employerTelError.classList.remove('show');
            employerTel1.classList.remove('error');
            employerTel2.classList.remove('error');
            employerTel3.classList.remove('error');
        } else if (isBlurEvent || employerTelError.classList.contains('show')) {
            if (!tel1Value || !tel2Value || !tel3Value || !tel1Valid || !tel2Valid || !tel3Valid) {
                employerTelError.textContent = '【電話番号】をすべて入力してください';
                employerTelError.classList.add('show');
                if (!tel1Value || !tel1Valid) employerTel1.classList.add('error');
                if (!tel2Value || !tel2Valid) employerTel2.classList.add('error');
                if (!tel3Value || !tel3Valid) employerTel3.classList.add('error');
            }
        }
    }

    if (employerTel1 && employerTel2 && employerTel3) {
        employerTel1.addEventListener('blur', () => validateEmployerTelFields(true));
        employerTel2.addEventListener('blur', () => validateEmployerTelFields(true));
        employerTel3.addEventListener('blur', () => validateEmployerTelFields(true));
        employerTel1.addEventListener('input', () => validateEmployerTelFields(false));
        employerTel2.addEventListener('input', () => validateEmployerTelFields(false));
        employerTel3.addEventListener('input', () => validateEmployerTelFields(false));
    }

    // 医療機関電話番号の複合バリデーション用リアルタイムチェック
    const hospitalTel1 = document.getElementById('hospitalTel1');
    const hospitalTel2 = document.getElementById('hospitalTel2');
    const hospitalTel3 = document.getElementById('hospitalTel3');
    const hospitalTelError = document.getElementById('hospitalTel-error');

    function validateHospitalTelFields(isBlurEvent = false) {
        if (!hospitalTel1 || !hospitalTel2 || !hospitalTel3 || !hospitalTelError) return;

        const tel1Value = hospitalTel1.value.trim();
        const tel2Value = hospitalTel2.value.trim();
        const tel3Value = hospitalTel3.value.trim();

        const tel1Valid = /^[0-9]{2,5}$/.test(tel1Value);
        const tel2Valid = /^[0-9]{1,4}$/.test(tel2Value);
        const tel3Valid = /^[0-9]{4}$/.test(tel3Value);

        if (tel1Valid && tel2Valid && tel3Valid) {
            hospitalTelError.classList.remove('show');
            hospitalTel1.classList.remove('error');
            hospitalTel2.classList.remove('error');
            hospitalTel3.classList.remove('error');
        } else if (isBlurEvent || hospitalTelError.classList.contains('show')) {
            if (!tel1Value || !tel2Value || !tel3Value || !tel1Valid || !tel2Valid || !tel3Valid) {
                hospitalTelError.textContent = '【電話番号】をすべて入力してください';
                hospitalTelError.classList.add('show');
                if (!tel1Value || !tel1Valid) hospitalTel1.classList.add('error');
                if (!tel2Value || !tel2Valid) hospitalTel2.classList.add('error');
                if (!tel3Value || !tel3Valid) hospitalTel3.classList.add('error');
            }
        }
    }

    if (hospitalTel1 && hospitalTel2 && hospitalTel3) {
        hospitalTel1.addEventListener('blur', () => validateHospitalTelFields(true));
        hospitalTel2.addEventListener('blur', () => validateHospitalTelFields(true));
        hospitalTel3.addEventListener('blur', () => validateHospitalTelFields(true));
        hospitalTel1.addEventListener('input', () => validateHospitalTelFields(false));
        hospitalTel2.addEventListener('input', () => validateHospitalTelFields(false));
        hospitalTel3.addEventListener('input', () => validateHospitalTelFields(false));
    }

    // 郵便番号の複合バリデーション用リアルタイムチェック（ステップ1）
    const postalCode1 = document.getElementById('postalCode1');
    const postalCode2 = document.getElementById('postalCode2');
    const postalCodeError = document.getElementById('postalCode-error');

    function validatePostalCodeFields(isBlurEvent = false) {
        if (!postalCode1 || !postalCode2 || !postalCodeError) return;

        const code1Value = postalCode1.value.trim();
        const code2Value = postalCode2.value.trim();

        const code1Valid = /^[0-9]{3}$/.test(code1Value);
        const code2Valid = /^[0-9]{4}$/.test(code2Value);

        if (code1Valid && code2Valid) {
            postalCodeError.classList.remove('show');
            postalCode1.classList.remove('error');
            postalCode2.classList.remove('error');
        } else if (isBlurEvent || postalCodeError.classList.contains('show')) {
            if (!code1Value || !code2Value || !code1Valid || !code2Valid) {
                postalCodeError.textContent = '【郵便番号】は前半3桁、後半4桁で入力してください。例：123-4567';
                postalCodeError.classList.add('show');
                if (!code1Value || !code1Valid) postalCode1.classList.add('error');
                if (!code2Value || !code2Valid) postalCode2.classList.add('error');
            }
        }
    }

    if (postalCode1 && postalCode2) {
        postalCode1.addEventListener('blur', () => validatePostalCodeFields(true));
        postalCode2.addEventListener('blur', () => validatePostalCodeFields(true));
        postalCode1.addEventListener('input', () => validatePostalCodeFields(false));
        postalCode2.addEventListener('input', () => validatePostalCodeFields(false));
    }

    // 事業の所在地 郵便番号の複合バリデーション用リアルタイムチェック（ステップ6）
    const businessPostalCode1 = document.getElementById('businessPostalCode1');
    const businessPostalCode2 = document.getElementById('businessPostalCode2');
    const businessPostalCodeError = document.getElementById('businessPostalCode-error');

    function validateBusinessPostalCodeFields(isBlurEvent = false) {
        if (!businessPostalCode1 || !businessPostalCode2 || !businessPostalCodeError) return;

        const code1Value = businessPostalCode1.value.trim();
        const code2Value = businessPostalCode2.value.trim();

        const code1Valid = /^[0-9]{3}$/.test(code1Value);
        const code2Valid = /^[0-9]{4}$/.test(code2Value);

        if (code1Valid && code2Valid) {
            businessPostalCodeError.classList.remove('show');
            businessPostalCode1.classList.remove('error');
            businessPostalCode2.classList.remove('error');
        } else if (isBlurEvent || businessPostalCodeError.classList.contains('show')) {
            if (!code1Value || !code2Value || !code1Valid || !code2Valid) {
                businessPostalCodeError.textContent = '【事業の所在地 郵便番号】は前半3桁、後半4桁で入力してください。例：123-4567';
                businessPostalCodeError.classList.add('show');
                if (!code1Value || !code1Valid) businessPostalCode1.classList.add('error');
                if (!code2Value || !code2Valid) businessPostalCode2.classList.add('error');
            }
        }
    }

    if (businessPostalCode1 && businessPostalCode2) {
        businessPostalCode1.addEventListener('blur', () => validateBusinessPostalCodeFields(true));
        businessPostalCode2.addEventListener('blur', () => validateBusinessPostalCodeFields(true));
        businessPostalCode1.addEventListener('input', () => validateBusinessPostalCodeFields(false));
        businessPostalCode2.addEventListener('input', () => validateBusinessPostalCodeFields(false));
    }

    // 医療機関 郵便番号の複合バリデーション用リアルタイムチェック（ステップ7）
    const hospitalPostalCode1 = document.getElementById('hospitalPostalCode1');
    const hospitalPostalCode2 = document.getElementById('hospitalPostalCode2');
    const hospitalPostalCodeError = document.getElementById('hospitalPostalCode-error');

    function validateHospitalPostalCodeFields(isBlurEvent = false) {
        if (!hospitalPostalCode1 || !hospitalPostalCode2 || !hospitalPostalCodeError) return;

        const code1Value = hospitalPostalCode1.value.trim();
        const code2Value = hospitalPostalCode2.value.trim();

        const code1Valid = /^[0-9]{3}$/.test(code1Value);
        const code2Valid = /^[0-9]{4}$/.test(code2Value);

        if (code1Valid && code2Valid) {
            hospitalPostalCodeError.classList.remove('show');
            hospitalPostalCode1.classList.remove('error');
            hospitalPostalCode2.classList.remove('error');
        } else if (isBlurEvent || hospitalPostalCodeError.classList.contains('show')) {
            if (!code1Value || !code2Value || !code1Valid || !code2Valid) {
                hospitalPostalCodeError.textContent = '【医療機関 郵便番号】は前半3桁、後半4桁で入力してください。例：123-4567';
                hospitalPostalCodeError.classList.add('show');
                if (!code1Value || !code1Valid) hospitalPostalCode1.classList.add('error');
                if (!code2Value || !code2Valid) hospitalPostalCode2.classList.add('error');
            }
        }
    }

    if (hospitalPostalCode1 && hospitalPostalCode2) {
        hospitalPostalCode1.addEventListener('blur', () => validateHospitalPostalCodeFields(true));
        hospitalPostalCode2.addEventListener('blur', () => validateHospitalPostalCodeFields(true));
        hospitalPostalCode1.addEventListener('input', () => validateHospitalPostalCodeFields(false));
        hospitalPostalCode2.addEventListener('input', () => validateHospitalPostalCodeFields(false));
    }

    // 性別のラジオボタン用リアルタイムチェック
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const genderError = document.getElementById('gender-error');

    function validateGenderFields() {
        if (!genderRadios || genderRadios.length === 0 || !genderError) return;

        const isChecked = Array.from(genderRadios).some(radio => radio.checked);

        if (isChecked) {
            genderError.classList.remove('show');
            genderRadios.forEach(radio => radio.classList.remove('error'));
        } else if (genderError.classList.contains('show')) {
            // エラーが既に表示されている場合のみ、未選択状態でもエラーを維持
            genderError.textContent = '【性別】を選択してください。';
            genderError.classList.add('show');
        }
    }

    if (genderRadios && genderRadios.length > 0) {
        genderRadios.forEach(radio => {
            radio.addEventListener('change', validateGenderFields);
        });
    }

    // 口座種別のラジオボタン用リアルタイムチェック
    const accountTypeRadios = document.querySelectorAll('input[name="accountType"]');
    const accountTypeError = document.getElementById('accountType-error');

    function validateAccountTypeFields() {
        if (!accountTypeRadios || accountTypeRadios.length === 0 || !accountTypeError) return;

        const isChecked = Array.from(accountTypeRadios).some(radio => radio.checked);

        if (isChecked) {
            accountTypeError.classList.remove('show');
            accountTypeRadios.forEach(radio => radio.classList.remove('error'));
        } else if (accountTypeError.classList.contains('show')) {
            accountTypeError.textContent = '【口座種別】を選択してください。';
            accountTypeError.classList.add('show');
        }
    }

    if (accountTypeRadios && accountTypeRadios.length > 0) {
        accountTypeRadios.forEach(radio => {
            radio.addEventListener('change', validateAccountTypeFields);
        });
    }

    // 療養の現況のラジオボタン用リアルタイムチェック
    const treatmentStatusRadios = document.querySelectorAll('input[name="treatmentStatus"]');
    const treatmentStatusError = document.getElementById('treatmentStatus-error');

    function validateTreatmentStatusFields() {
        if (!treatmentStatusRadios || treatmentStatusRadios.length === 0 || !treatmentStatusError) return;

        const isChecked = Array.from(treatmentStatusRadios).some(radio => radio.checked);

        if (isChecked) {
            treatmentStatusError.classList.remove('show');
            treatmentStatusRadios.forEach(radio => radio.classList.remove('error'));
        } else if (treatmentStatusError.classList.contains('show')) {
            treatmentStatusError.textContent = '【療養の現況】を選択してください。';
            treatmentStatusError.classList.add('show');
        }
    }

    if (treatmentStatusRadios && treatmentStatusRadios.length > 0) {
        treatmentStatusRadios.forEach(radio => {
            radio.addEventListener('change', validateTreatmentStatusFields);
        });
    }
}

// 個別フィールドのバリデーション
function validateField(input) {
    const fieldId = input.id;
    const rule = validationRules[fieldId];

    if (!rule) return true;

    let isValid = true;
    let errorMessage = '';

    // 空欄チェック
    if (rule.required && !input.value.trim()) {
        isValid = false;
        errorMessage = rule.message;
    }
    // 値が入力されている場合のチェック
    else if (input.value.trim()) {
        if (rule.pattern && !rule.pattern.test(input.value)) {
            isValid = false;
            errorMessage = rule.message;
        } else if (rule.validator && !rule.validator(input.value)) {
            isValid = false;
            errorMessage = rule.message;
        } else if (rule.minLength && input.value.length < rule.minLength) {
            isValid = false;
            errorMessage = rule.message;
        }
    }

    const errorElement = document.getElementById(`${fieldId}-error`);
    if (!isValid) {
        input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    } else {
        input.classList.remove('error');
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    return isValid;
}

// 住所検索
async function searchAddress() {
    const postalCode1Input = document.getElementById('postalCode1');
    const postalCode2Input = document.getElementById('postalCode2');
    const address1Input = document.getElementById('address1');

    const postalCode1 = postalCode1Input.value.replace(/[^0-9]/g, '');
    const postalCode2 = postalCode2Input.value.replace(/[^0-9]/g, '');
    const postalCode = postalCode1 + postalCode2;
    const postalCodeError = document.getElementById('postalCode-error');

    if (!postalCode1 || !postalCode2) {
        if (postalCodeError) {
            postalCodeError.textContent = '【郵便番号】を入力してください。';
            postalCodeError.classList.add('show');
        }
        if (!postalCode1) postalCode1Input.classList.add('error');
        if (!postalCode2) postalCode2Input.classList.add('error');
        return;
    }

    if (postalCode.length !== 7) {
        if (postalCodeError) {
            postalCodeError.textContent = '【郵便番号】は7桁で入力してください（3桁-4桁）。';
            postalCodeError.classList.add('show');
        }
        postalCode1Input.classList.add('error');
        postalCode2Input.classList.add('error');
        return;
    }

    try {
        // zipcloud APIを使用して住所を取得
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
        const data = await response.json();

        if (data.status === 200 && data.results && data.results.length > 0) {
            const result = data.results[0];
            const autoAddress = result.address1 + result.address2 + result.address3;
            address1Input.value = autoAddress;

            // 自動入力後は非活性化
            address1Input.disabled = true;
            address1Input.style.backgroundColor = 'var(--color-gray-100)';
            address1Input.style.cursor = 'not-allowed';

            // エラー表示をクリア
            address1Input.classList.remove('error');
            postalCode1Input.classList.remove('error');
            postalCode2Input.classList.remove('error');
            if (postalCodeError) {
                postalCodeError.classList.remove('show');
            }
            const address1Error = document.getElementById('address1-error');
            if (address1Error) {
                address1Error.classList.remove('show');
            }

            // 下段（番地等）の入力欄にフォーカス（モバイルではフォーカスしない）
            const address2Input = document.getElementById('address2');
            if (address2Input && !isMobileDevice()) {
                address2Input.focus();
            }
        } else {
            if (postalCodeError) {
                postalCodeError.textContent = '【郵便番号】該当する住所が見つかりませんでした。郵便番号を確認してください。';
                postalCodeError.classList.add('show');
            }
            postalCode1Input.classList.add('error');
            postalCode2Input.classList.add('error');
        }
    } catch (error) {
        console.error('住所検索エラー:', error);
        if (postalCodeError) {
            postalCodeError.textContent = '【郵便番号】住所検索中にエラーが発生しました。しばらく経ってから再度お試しください。';
            postalCodeError.classList.add('show');
        }
        postalCode1Input.classList.add('error');
        postalCode2Input.classList.add('error');
    }
}

// ファイルアップロード処理
function setupFileUpload() {
    // 診断書のファイル選択
    const medicalCertificate = document.getElementById('medicalCertificate');
    if (medicalCertificate) {
        medicalCertificate.addEventListener('change', function(e) {
            displayFileList(e.target.files, 'medicalCertificateList');
        });
    }

    // その他書類のファイル選択
    const otherDocuments = document.getElementById('otherDocuments');
    if (otherDocuments) {
        otherDocuments.addEventListener('change', function(e) {
            displayFileList(e.target.files, 'otherDocumentsList');
        });
    }
}

// ファイルリスト表示
function displayFileList(files, listId) {
    const listElement = document.getElementById(listId);
    if (!listElement) return;

    listElement.innerHTML = '';

    Array.from(files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';

        const fileName = document.createElement('div');
        fileName.className = 'file-item-name';
        fileName.innerHTML = `
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
            </svg>
            <span>${file.name} (${formatFileSize(file.size)})</span>
        `;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-item-remove';
        removeBtn.textContent = '削除';
        removeBtn.type = 'button';
        removeBtn.onclick = function() {
            fileItem.remove();
        };

        fileItem.appendChild(fileName);
        fileItem.appendChild(removeBtn);
        listElement.appendChild(fileItem);
    });
}

// ファイルサイズのフォーマット
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 医療機関検索機能
function searchMedicalInstitutions(query) {
    if (!query || query.trim() === '') {
        return [];
    }

    const searchTerm = query.toLowerCase().trim();
    return medicalInstitutions.filter(institution => {
        return institution.name.toLowerCase().includes(searchTerm) ||
               institution.address.toLowerCase().includes(searchTerm) ||
               institution.region.toLowerCase().includes(searchTerm) ||
               institution.type.toLowerCase().includes(searchTerm);
    });
}

// 検索結果を表示
function displayMedicalResults(results) {
    const resultsContainer = document.getElementById('medicalResults');

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--color-text-secondary);">検索結果が見つかりませんでした</div>';
        resultsContainer.style.display = 'block';
        return;
    }

    resultsContainer.innerHTML = results.map(institution => `
        <div class="medical-result-item" data-id="${institution.id}" data-name="${institution.name}">
            <div class="medical-result-name">${institution.name}</div>
            <div class="medical-result-info">
                〒${institution.postalCode} ${institution.address}<br>
                TEL: ${institution.phone} | ${institution.type}
            </div>
            <div class="medical-result-id">指定番号: ${institution.id}</div>
        </div>
    `).join('');

    resultsContainer.style.display = 'block';

    // 各結果項目にクリックイベントを追加
    resultsContainer.querySelectorAll('.medical-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');

            // 選択状態を更新
            resultsContainer.querySelectorAll('.medical-result-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');

            // 隠しフィールドに値を設定
            document.getElementById('selectedMedicalId').value = id;
            document.getElementById('selectedMedicalName').value = name;

            // 検索入力欄に選択した医療機関名を表示
            const medicalSearchField = document.getElementById('medicalSearch');
            medicalSearchField.value = name;

            // 検索フィールドを非活性化
            medicalSearchField.disabled = true;
            medicalSearchField.style.backgroundColor = 'var(--color-gray-100)';
            medicalSearchField.style.cursor = 'not-allowed';

            // 検索ボタンを非表示、クリアボタンを表示
            document.getElementById('medicalSearchBtn').style.display = 'none';
            document.getElementById('medicalClearBtn').style.display = 'inline-flex';

            // エラー表示をクリア
            medicalSearchField.classList.remove('error');
            const errorElement = document.getElementById('medicalSearch-error');
            if (errorElement) {
                errorElement.classList.remove('show');
            }

            // 結果リストを非表示
            setTimeout(() => {
                resultsContainer.style.display = 'none';
            }, 200);
        });
    });
}

// 医療機関選択をクリア
function clearMedicalSelection() {
    const medicalSearchField = document.getElementById('medicalSearch');

    // 検索フィールドをクリア
    medicalSearchField.value = '';

    // 隠しフィールドをクリア
    document.getElementById('selectedMedicalId').value = '';
    document.getElementById('selectedMedicalName').value = '';

    // 検索フィールドを活性化
    medicalSearchField.disabled = false;
    medicalSearchField.style.backgroundColor = '';
    medicalSearchField.style.cursor = '';

    // 検索ボタンを表示、クリアボタンを非表示
    document.getElementById('medicalSearchBtn').style.display = 'inline-flex';
    document.getElementById('medicalClearBtn').style.display = 'none';

    // エラー表示をクリア
    medicalSearchField.classList.remove('error');
    const errorElement = document.getElementById('medicalSearch-error');
    if (errorElement) {
        errorElement.classList.remove('show');
    }

    // 検索フィールドにフォーカス（モバイルではフォーカスしない）
    if (!isMobileDevice()) {
        medicalSearchField.focus();
    }
}

// 回覧セクションを表示
function showCirculationSection() {
    document.getElementById('step-5').classList.remove('active');
    document.getElementById('circulation-section').style.display = 'block';
    document.getElementById('circulation-section').classList.add('active');

    // 医療機関検索のイベントリスナーを設定
    setupMedicalSearchListeners();

    // 回覧セクションのフィールドにリアルタイムバリデーションを設定
    setupCirculationValidation();
}

// 回覧セクションのリアルタイムバリデーション設定
function setupCirculationValidation() {
    const circulationSection = document.getElementById('circulation-section');
    if (!circulationSection) return;

    circulationSection.querySelectorAll('.form-input').forEach(input => {
        if (input.dataset.validationSetup) return; // 既に設定済みの場合はスキップ

        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });

        input.dataset.validationSetup = 'true'; // 設定済みフラグ
    });
}

// 回覧セクションを非表示
function hideCirculationSection() {
    document.getElementById('circulation-section').classList.remove('active');
    document.getElementById('circulation-section').style.display = 'none';
    document.getElementById('step-5').classList.add('active');
}

// 医療機関検索のイベントリスナー設定
function setupMedicalSearchListeners() {
    const searchBtn = document.getElementById('medicalSearchBtn');
    const clearBtn = document.getElementById('medicalClearBtn');
    const searchInput = document.getElementById('medicalSearch');
    const resultsContainer = document.getElementById('medicalResults');

    // 検索ボタンのイベント
    if (searchBtn && !searchBtn.dataset.listenerAdded) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value;
            const results = searchMedicalInstitutions(query);
            displayMedicalResults(results);
        });
        searchBtn.dataset.listenerAdded = 'true';
    }

    // クリアボタンのイベント
    if (clearBtn && !clearBtn.dataset.listenerAdded) {
        clearBtn.addEventListener('click', function() {
            clearMedicalSelection();
        });
        clearBtn.dataset.listenerAdded = 'true';
    }

    // 検索入力欄でEnterキーを押した時の処理
    if (searchInput && !searchInput.dataset.listenerAdded) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!searchInput.disabled) {
                    searchBtn.click();
                }
            }
        });
        searchInput.dataset.listenerAdded = 'true';
    }

    // 検索入力欄以外をクリックした時に結果を非表示
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.medical-search-container');

        if (searchContainer && resultsContainer &&
            !searchContainer.contains(e.target) &&
            !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

// 回覧依頼を送信
function submitCirculation() {
    const circulationSection = document.getElementById('circulation-section');
    let isValid = true;

    // エラー状態をリセット
    circulationSection.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
    });
    circulationSection.querySelectorAll('.error-message').forEach(msg => {
        msg.classList.remove('show');
    });

    // 事業主メールアドレスのバリデーション
    const employerEmailField = document.getElementById('employerEmail');
    const employerEmail = employerEmailField.value;
    const employerEmailRule = validationRules['employerEmail'];

    if (employerEmailRule) {
        let hasError = false;
        let errorMessage = '';

        if (employerEmailRule.required && !employerEmail.trim()) {
            hasError = true;
            errorMessage = employerEmailRule.message;
        } else if (employerEmail.trim()) {
            if (employerEmailRule.pattern && !employerEmailRule.pattern.test(employerEmail)) {
                hasError = true;
                errorMessage = employerEmailRule.message;
            }
        }

        if (hasError) {
            isValid = false;
            employerEmailField.classList.add('error');

            const errorElement = document.getElementById('employerEmail-error');
            if (errorElement) {
                errorElement.textContent = errorMessage;
                errorElement.classList.add('show');
            }
        }
    }

    // 医療機関選択のバリデーション
    const selectedMedicalId = document.getElementById('selectedMedicalId').value;
    const selectedMedicalName = document.getElementById('selectedMedicalName').value;
    const medicalSearchField = document.getElementById('medicalSearch');

    if (!selectedMedicalName) {
        isValid = false;
        medicalSearchField.classList.add('error');

        const errorElement = document.getElementById('medicalSearch-error');
        if (errorElement) {
            errorElement.textContent = '【労災保険指定医療機関】を検索して選択してください。検索ボタンを押して一覧から選択してください。';
            errorElement.classList.add('show');
        }
    }

    // 最初のエラーフィールドにスクロール（モバイルではフォーカスしない）
    if (!isValid) {
        setTimeout(() => {
            const firstErrorField = circulationSection.querySelector('.form-input.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                // スマホではキーボード自動表示を防ぐためフォーカスしない
                if (!isMobileDevice()) {
                    firstErrorField.focus();
                }
            }
        }, 100);
        return;
    }

    // ローディング表示
    document.getElementById('loading').classList.add('active');

    // 2秒後に回覧完了画面へ遷移
    setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
        window.location.href = '労災申請アシストサイト_回覧完了画面.html';
    }, 2000);
}

// 申請の送信
function submitApplication() {
    const finalConfirm = document.getElementById('finalConfirm');
    const finalConfirmError = document.getElementById('finalConfirm-error');

    if (!finalConfirm.checked) {
        if (finalConfirmError) {
            finalConfirmError.textContent = '【確認事項】上記の内容で間違いないことを確認し、チェックを入れてください。';
            finalConfirmError.classList.add('show');
        }
        finalConfirm.classList.add('error');
        return;
    }

    // エラー表示をクリア
    if (finalConfirmError) {
        finalConfirmError.classList.remove('show');
    }
    finalConfirm.classList.remove('error');

    document.getElementById('loading').classList.add('active');

    setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
        localStorage.removeItem('rosaiFormData');

        // 回覧完了画面へ遷移
        window.location.href = '労災申請アシストサイト_回覧完了画面.html';
    }, 2000);
}

// ログアウト
function logout() {
    if (confirm('ログアウトしますか？')) {
        localStorage.clear();
        window.location.href = '#';
    }
}

// 開発用：事業主モードに遷移
function goToEmployerMode() {
    // 現在のステップを非表示
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });

    // 回覧セクションも非表示
    const circulationSection = document.getElementById('circulation-section');
    if (circulationSection) {
        circulationSection.classList.remove('active');
    }

    // ステップ6（事業主情報）を表示
    document.getElementById('step-6').classList.add('active');
    currentStep = 6;
    updateProgress();

    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 開発用：医療機関モードに遷移
function goToMedicalMode() {
    // 現在のステップを非表示
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });

    // 回覧セクションも非表示
    const circulationSection = document.getElementById('circulation-section');
    if (circulationSection) {
        circulationSection.classList.remove('active');
    }

    // ステップ7（医療機関情報）を表示
    document.getElementById('step-7').classList.add('active');
    currentStep = 7;
    updateProgress();

    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 事業所住所検索
async function searchBusinessAddress() {
    const postalCode1Input = document.getElementById('businessPostalCode1');
    const postalCode2Input = document.getElementById('businessPostalCode2');
    const address1Input = document.getElementById('businessAddress1');

    const postalCode1 = postalCode1Input.value.replace(/[^0-9]/g, '');
    const postalCode2 = postalCode2Input.value.replace(/[^0-9]/g, '');
    const postalCode = postalCode1 + postalCode2;
    const postalCodeError = document.getElementById('businessPostalCode-error');

    if (!postalCode1 || !postalCode2) {
        if (postalCodeError) {
            postalCodeError.textContent = '【事業の所在地 郵便番号】を入力してください。';
            postalCodeError.classList.add('show');
        }
        if (!postalCode1) postalCode1Input.classList.add('error');
        if (!postalCode2) postalCode2Input.classList.add('error');
        return;
    }

    if (postalCode.length !== 7) {
        if (postalCodeError) {
            postalCodeError.textContent = '【事業の所在地 郵便番号】は7桁で入力してください（3桁-4桁）。';
            postalCodeError.classList.add('show');
        }
        postalCode1Input.classList.add('error');
        postalCode2Input.classList.add('error');
        return;
    }

    try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
        const data = await response.json();

        if (data.status === 200 && data.results) {
            const result = data.results[0];
            const autoAddress = result.address1 + result.address2 + result.address3;
            address1Input.value = autoAddress;
            address1Input.disabled = true;
            address1Input.style.backgroundColor = 'var(--color-gray-100)';
            address1Input.style.cursor = 'not-allowed';
            address1Input.classList.remove('error');
            postalCode1Input.classList.remove('error');
            postalCode2Input.classList.remove('error');
            if (postalCodeError) {
                postalCodeError.classList.remove('show');
            }
            const errorElement = document.getElementById('businessAddress1-error');
            if (errorElement) errorElement.classList.remove('show');
        } else {
            if (postalCodeError) {
                postalCodeError.textContent = '【事業の所在地 郵便番号】該当する住所が見つかりませんでした。郵便番号を確認してください。';
                postalCodeError.classList.add('show');
            }
            postalCode1Input.classList.add('error');
            postalCode2Input.classList.add('error');
        }
    } catch (error) {
        console.error('住所検索エラー:', error);
        if (postalCodeError) {
            postalCodeError.textContent = '【事業の所在地 郵便番号】住所検索中にエラーが発生しました。しばらく経ってから再度お試しください。';
            postalCodeError.classList.add('show');
        }
        postalCode1Input.classList.add('error');
        postalCode2Input.classList.add('error');
    }
}

// 病院住所検索
async function searchHospitalAddress() {
    const postalCode1Input = document.getElementById('hospitalPostalCode1');
    const postalCode2Input = document.getElementById('hospitalPostalCode2');
    const address1Input = document.getElementById('hospitalAddress1');

    const postalCode1 = postalCode1Input.value.replace(/[^0-9]/g, '');
    const postalCode2 = postalCode2Input.value.replace(/[^0-9]/g, '');
    const postalCode = postalCode1 + postalCode2;
    const postalCodeError = document.getElementById('hospitalPostalCode-error');

    if (!postalCode1 || !postalCode2) {
        if (postalCodeError) {
            postalCodeError.textContent = '【医療機関 郵便番号】を入力してください。';
            postalCodeError.classList.add('show');
        }
        if (!postalCode1) postalCode1Input.classList.add('error');
        if (!postalCode2) postalCode2Input.classList.add('error');
        return;
    }

    if (postalCode.length !== 7) {
        if (postalCodeError) {
            postalCodeError.textContent = '【医療機関 郵便番号】は7桁で入力してください（3桁-4桁）。';
            postalCodeError.classList.add('show');
        }
        postalCode1Input.classList.add('error');
        postalCode2Input.classList.add('error');
        return;
    }

    try {
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
        const data = await response.json();

        if (data.status === 200 && data.results) {
            const result = data.results[0];
            const autoAddress = result.address1 + result.address2 + result.address3;
            address1Input.value = autoAddress;
            address1Input.disabled = true;
            address1Input.style.backgroundColor = 'var(--color-gray-100)';
            address1Input.style.cursor = 'not-allowed';
            address1Input.classList.remove('error');
            postalCode1Input.classList.remove('error');
            postalCode2Input.classList.remove('error');
            if (postalCodeError) {
                postalCodeError.classList.remove('show');
            }
            const errorElement = document.getElementById('hospitalAddress1-error');
            if (errorElement) errorElement.classList.remove('show');
        } else {
            if (postalCodeError) {
                postalCodeError.textContent = '【医療機関 郵便番号】該当する住所が見つかりませんでした。郵便番号を確認してください。';
                postalCodeError.classList.add('show');
            }
            postalCode1Input.classList.add('error');
            postalCode2Input.classList.add('error');
        }
    } catch (error) {
        console.error('住所検索エラー:', error);
        if (postalCodeError) {
            postalCodeError.textContent = '【医療機関 郵便番号】住所検索中にエラーが発生しました。しばらく経ってから再度お試しください。';
            postalCodeError.classList.add('show');
        }
        postalCode1Input.classList.add('error');
        postalCode2Input.classList.add('error');
    }
}

// 事業主フォーム送信
function submitEmployerForm() {

    // バリデーション
    const employerDate = document.getElementById('employerDate').value;
    const businessName = document.getElementById('businessName').value;
    const businessPostalCode1 = document.getElementById('businessPostalCode1').value;
    const businessPostalCode2 = document.getElementById('businessPostalCode2').value;
    const businessAddress1 = document.getElementById('businessAddress1').value;
    const businessAddress2 = document.getElementById('businessAddress2').value;
    const employerPosition = document.getElementById('employerPosition').value;
    const employerLastName = document.getElementById('employerLastName').value;
    const employerFirstName = document.getElementById('employerFirstName').value;
    const employerTel1 = document.getElementById('employerTel1').value;
    const employerTel2 = document.getElementById('employerTel2').value;
    const employerTel3 = document.getElementById('employerTel3').value;

    // エラーメッセージをクリア
    document.querySelectorAll('#step-6 .error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('#step-6 .form-input').forEach(el => el.classList.remove('error'));

    let hasError = false;

    if (!employerDate) {
        hasError = true;
        document.getElementById('employerDate').classList.add('error');
        document.getElementById('employerDate-error').textContent = '【記入日】を入力してください';
        document.getElementById('employerDate-error').classList.add('show');
    }

    if (!businessName) {
        hasError = true;
        document.getElementById('businessName').classList.add('error');
        document.getElementById('businessName-error').textContent = '【事業の名称】を入力してください';
        document.getElementById('businessName-error').classList.add('show');
    }

    if (!businessPostalCode1 || !businessPostalCode2) {
        hasError = true;
        if (!businessPostalCode1) document.getElementById('businessPostalCode1').classList.add('error');
        if (!businessPostalCode2) document.getElementById('businessPostalCode2').classList.add('error');
        document.getElementById('businessPostalCode-error').textContent = '【郵便番号】を入力してください';
        document.getElementById('businessPostalCode-error').classList.add('show');
    }

    if (!businessAddress1) {
        hasError = true;
        document.getElementById('businessAddress1').classList.add('error');
        document.getElementById('businessAddress1-error').textContent = '【事業の所在地（都道府県・市区町村）】を入力してください';
        document.getElementById('businessAddress1-error').classList.add('show');
    }

    if (!businessAddress2) {
        hasError = true;
        document.getElementById('businessAddress2').classList.add('error');
        document.getElementById('businessAddress2-error').textContent = '【事業の所在地（番地・建物名等）】を入力してください';
        document.getElementById('businessAddress2-error').classList.add('show');
    }

    if (!employerPosition || !employerLastName || !employerFirstName) {
        hasError = true;
        if (!employerPosition) {
            document.getElementById('employerPosition').classList.add('error');
            document.getElementById('employerPosition-error').textContent = '【役職】を入力してください';
            document.getElementById('employerPosition-error').classList.add('show');
        }
        if (!employerLastName) {
            document.getElementById('employerLastName').classList.add('error');
            document.getElementById('employerLastName-error').textContent = '【姓】を入力してください';
            document.getElementById('employerLastName-error').classList.add('show');
        }
        if (!employerFirstName) {
            document.getElementById('employerFirstName').classList.add('error');
            document.getElementById('employerFirstName-error').textContent = '【名】を入力してください';
            document.getElementById('employerFirstName-error').classList.add('show');
        }
    }

    if (!employerTel1 || !employerTel2 || !employerTel3) {
        hasError = true;
        if (!employerTel1) document.getElementById('employerTel1').classList.add('error');
        if (!employerTel2) document.getElementById('employerTel2').classList.add('error');
        if (!employerTel3) document.getElementById('employerTel3').classList.add('error');
        document.getElementById('employerTel-error').textContent = '【電話番号】をすべて入力してください';
        document.getElementById('employerTel-error').classList.add('show');
    }

    if (hasError) {
        setTimeout(() => {
            const firstErrorField = document.querySelector('#step-6 .form-input.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // スマホではキーボード自動表示を防ぐためフォーカスしない
                if (!isMobileDevice()) {
                    firstErrorField.focus();
                }
            }
        }, 100);
        return;
    }

    // 成功時は回覧完了画面に遷移
    localStorage.setItem('completedBy', 'employer');
    window.location.href = '労災申請アシストサイト_回覧完了画面.html';
}

// 医療機関フォーム送信
function submitMedicalForm() {
    // バリデーション
    const injuryPart = document.getElementById('injuryPart').value;
    const treatmentStartDate = document.getElementById('treatmentStartDate').value;
    const treatmentEndDate = document.getElementById('treatmentEndDate').value;
    const treatmentDays = document.getElementById('treatmentDays').value;

    // ラジオボタンから療養の現況を取得
    const treatmentStatusRadios = document.querySelectorAll('input[name="treatmentStatus"]');
    const treatmentStatus = Array.from(treatmentStatusRadios).find(radio => radio.checked)?.value || '';

    // エラーメッセージをクリア
    document.querySelectorAll('#step-8 .error-message').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('#step-8 .form-input, #step-8 .form-select, #step-8 .form-radio').forEach(el => el.classList.remove('error'));

    let hasError = false;

    if (!injuryPart) {
        hasError = true;
        document.getElementById('injuryPart').classList.add('error');
        document.getElementById('injuryPart-error').textContent = '【傷病の部位及び傷病名】を入力してください';
        document.getElementById('injuryPart-error').classList.add('show');
    }

    if (!treatmentStartDate) {
        hasError = true;
        document.getElementById('treatmentStartDate').classList.add('error');
        document.getElementById('treatmentStartDate-error').textContent = '【開始日】を入力してください';
        document.getElementById('treatmentStartDate-error').classList.add('show');
    }

    if (!treatmentEndDate) {
        hasError = true;
        document.getElementById('treatmentEndDate').classList.add('error');
        document.getElementById('treatmentEndDate-error').textContent = '【終了日】を入力してください';
        document.getElementById('treatmentEndDate-error').classList.add('show');
    }

    if (!treatmentDays) {
        hasError = true;
        document.getElementById('treatmentDays').classList.add('error');
        document.getElementById('treatmentDays-error').textContent = '【診療実日数】を入力してください';
        document.getElementById('treatmentDays-error').classList.add('show');
    }

    if (!treatmentStatus) {
        hasError = true;
        // ラジオボタン全体にエラーを表示
        treatmentStatusRadios.forEach(radio => {
            radio.classList.add('error');
        });
        document.getElementById('treatmentStatus-error').textContent = '【療養の現況】を選択してください';
        document.getElementById('treatmentStatus-error').classList.add('show');
    }

    if (hasError) {
        setTimeout(() => {
            const firstErrorField = document.querySelector('#step-8 .form-input.error, #step-8 .form-select.error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // スマホではキーボード自動表示を防ぐためフォーカスしない
                if (!isMobileDevice()) {
                    firstErrorField.focus();
                }
            }
        }, 100);
        return;
    }

    // 成功時は回覧完了画面に遷移
    localStorage.setItem('completedBy', 'medical');
    window.location.href = '労災申請アシストサイト_回覧完了画面.html';
}
