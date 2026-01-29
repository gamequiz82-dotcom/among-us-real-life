import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

/**
 * دالة رسم الصفحة الرئيسية مع عداد اللاعبين
 * @param {HTMLElement} container - الحاوية الرئيسية
 * @param {Function} onJoinClick - وظيفة عند الضغط على انضمام
 */
export function renderHome(container, onJoinClick) {
    // 1. بناء واجهة الصفحة الرئيسية
    container.innerHTML = `
        <div class="container home-screen">
            <div class="logo-area">
                <h1 class="main-title">AMONG US</h1>
                <p class="sub-title">REAL LIFE EDITION</p>
            </div>
            
            <div class="status-badge">
                <span class="pulse-icon"></span>
                اللاعبون المتصلون الآن: <strong id="player-count">0</strong>
            </div>

            <div class="actions-area">
                <button class="btn-create" id="btn-create-room">
                    <span class="icon">🛠️</span> إنشاء غرفة جديدة
                </button>

                <button class="btn-join" id="btn-go-to-join">
                    <span class="icon">🚀</span> انضمام للعبة
                </button>
            </div>

            <div class="footer-note">
                <p>تأكد من اتصال الجميع بنفس قاعدة البيانات</p>
            </div>
        </div>
    `;

    // 2. تفعيل العداد اللحظي من Firebase
    const countElement = document.getElementById('player-count');
    const playersRef = ref(db, 'game/players');

    onValue(playersRef, (snapshot) => {
        if (snapshot.exists()) {
            const playersData = snapshot.val();
            // حساب عدد الأسماء الموجودة تحت فرع players
            const count = Object.keys(playersData).length;
            if (countElement) countElement.innerText = count;
        } else {
            if (countElement) countElement.innerText = "0";
        }
    });

    // 3. ربط الأحداث
    const joinBtn = document.getElementById('btn-go-to-join');
    if (joinBtn) {
        joinBtn.onclick = onJoinClick; 
    }
}