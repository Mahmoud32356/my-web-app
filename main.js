// رابط مدونتك
const BLOG_URL = 'https://almadaah2026.blogspot.com';

// ⚠️ معرفات إعلانات AdMob (قم بالتبديل بين الاختبار والحقيقي عند النشر)
const IS_TESTING = true; // اجعلها false عند إصدار النسخة النهائية للإنتاج

const AD_UNITS = {
    banner: IS_TESTING ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-7293684166978355/6626274599',
    interstitial: IS_TESTING ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-7293684166978355/5050680493',
    appOpen: IS_TESTING ? 'ca-app-pub-3940256099942544/9257390415' : 'ca-app-pub-7293684166978355/5313192926'
};

let pageNavCount = 0;
let interstitialAd = null;

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    checkConnectionAndLoad();
    initAdMob();
    setupBackButton();
}

// التحقق من الاتصال بالإنترنت وتحميل الموقع
function checkConnectionAndLoad() {
    const offlineScreen = document.getElementById('offline-screen');
    const webFrame = document.getElementById('web-frame');
    const statusText = document.getElementById('status-text');

    if (navigator.connection.type !== Connection.NONE && navigator.onLine) {
        statusText.innerText = "جاري التحميل...";
        webFrame.src = BLOG_URL;
        
        webFrame.onload = function() {
            offlineScreen.style.display = 'none';
            webFrame.style.display = 'block';
        };
    } else {
        webFrame.style.display = 'none';
        offlineScreen.style.display = 'flex';
        statusText.innerText = "لا يوجد اتصال بالإنترنت. يرجى التحقق من الشبكة.";
    }
}

// تهيئة إعلانات AdMob
async function initAdMob() {
    if (typeof admob === 'undefined') return;

    try {
        await admob.start();

        // 1. عرض إعلان البنر في الأسفل
        const banner = new admob.BannerAd({
            adUnitId: AD_UNITS.banner,
            position: 'bottom'
        });
        await banner.show();

        // 2. تحضير الإعلان البيني في الخلفية
        loadInterstitial();

        // 3. عرض إعلان التجميع/الفتح App Open
        const appOpen = new admob.AppOpenAd({
            adUnitId: AD_UNITS.appOpen
        });
        await appOpen.load();
        await appOpen.show();

    } catch (error) {
        console.error("خطأ في تحميل الإعلانات:", error);
    }
}

// تحميل الإعلان البيني
async function loadInterstitial() {
    if (typeof admob === 'undefined') return;
    try {
        interstitialAd = new admob.InterstitialAd({
            adUnitId: AD_UNITS.interstitial
        });
        await interstitialAd.load();
    } catch (e) {
        console.log("فشل تحميل الإعلان البيني");
    }
}

// عرض الإعلان البيني كل 4 تنقلات
function handleInterstitialTrigger() {
    pageNavCount++;
    if (pageNavCount >= 4) {
        if (interstitialAd) {
            interstitialAd.show().then(() => {
                pageNavCount = 0;
                loadInterstitial(); // تحضير الإعلان للمرة القادمة
            });
        }
    }
}

// تخصيص زر العودة للرجوع داخل صفحات المدونة بدل الخروج المفاجئ
function setupBackButton() {
    document.addEventListener("backbutton", function (e) {
        const webFrame = document.getElementById('web-frame');
        try {
            if (webFrame.contentWindow.history.length > 1) {
                webFrame.contentWindow.history.back();
                handleInterstitialTrigger();
            } else {
                navigator.app.exitApp();
            }
        } catch (err) {
            navigator.app.exitApp();
        }
    }, false);
}
