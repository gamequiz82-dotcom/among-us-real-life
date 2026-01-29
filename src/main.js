import './style.css';
import { renderHome } from './homePage.jsx'; 
import { renderGamePage } from './gamePage.jsx';
import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";

const appDiv = document.getElementById('app');

// 1. الوظيفة الأساسية لتشغيل التطبيق (تبدأ بصفحة الهوم)
function startApp() {
    renderHome(appDiv, () => {
        // عند الضغط على "انضمام لغرفة" يتم استدعاء صفحة تسجيل الاسم
        renderLogin();
    });

    // ربط منطق "إنشاء غرفة" ليكون متاحاً في صفحة الهوم
    const createBtn = document.getElementById('btn-create-room');
    if (createBtn) {
        createBtn.onclick = () => {
            if (confirm("هل تريد تصفير بيانات اللعبة وبدء غرفة جديدة؟")) {
                // تصفير النقاط وحالة الإنذار في Firebase
                set(ref(db, 'game'), { 
                    score: 0, 
                    alarm: false,
                    state: "waiting" 
                });
                alert("تم إنشاء غرفة جديدة بنجاح!");
            }
        };
    }
}

// 2. صفحة تسجيل الاسم (تظهر بعد اختيار "انضمام")
function renderLogin() {
    appDiv.innerHTML = `
        <div id="screen-login" class="container">
            <h1>تسجيل الدخول</h1>
            <input type="text" id="username" placeholder="ادخل اسمك المستعار...">
            <button id="btn-join" class="btn-main">دخول اللعبة</button>
            <button id="btn-back" style="background:none; color:gray; border:none; margin-top:15px; cursor:pointer;">🏠 العودة للرئيسية</button>
        </div>
    `;

    // عند الضغط على دخول، ننتقل لصفحة اللعبة (توزيع البطاقة)
    document.getElementById('btn-join').onclick = () => {
        const name = document.getElementById('username').value.trim();
        if (name) {
            renderGamePage(appDiv, name);
        } else {
            alert("يرجى إدخال اسمك أولاً!");
        }
    };

    // زر العودة للهوم
    document.getElementById('btn-back').onclick = startApp;
}

// 3. مراقبة شريط المهام والإنذار بشكل دائم لضمان التحديث اللحظي
onValue(ref(db, 'game/score'), (snap) => {
    const bar = document.getElementById('progress-bar');
    if (bar) {
        const score = snap.val() || 0;
        const percent = Math.min((score / 20) * 100, 100);
        bar.style.width = percent + "%";
    }
});

// بدء التطبيق عند تحميل الصفحة
startApp();