import { ref, set, onValue } from "firebase/database";
import { db } from "./firebase"; 
import { floorTasks } from "./tasks";

/**
 * وظيفة رسم صفحة اللعبة وتوزيع الأدوار
 * @param {HTMLElement} container - العنصر الذي سيتم رسم الصفحة بداخله
 * @param {string} playerName - اسم اللاعب
 */
export function renderGamePage(container, playerName) {
    // تحديد الدور (20% محتال)
    const isImposter = Math.random() < 0.20;

    // 1. بناء هيكل الواجهة (HTML)
    container.innerHTML = `
        <div id="screen-game" class="container">
            <div id="role-card" class="card ${isImposter ? 'imposter' : 'crewmate'}">
                <div class="card-header">
                    <h2 id="role-title">${isImposter ? 'أنت المحتال 😈' : 'أنت مسالم 😇'}</h2>
                </div>
                <div class="card-body">
                    <p class="player-label">اللاعب: <strong>${playerName}</strong></p>
                    <div id="tasks-section" class="tasks-box">
                        <h3>قائمة المهام المطلوبة:</h3>
                        <ul id="tasks-list"></ul>
                    </div>
                </div>
                <div class="card-footer">
                    <button id="btn-report" class="report-btn">📢 إبلاغ (REPORT)</button>
                </div>
            </div>
        </div>
    `;

    const list = document.getElementById('tasks-list');

    // 2. توزيع المهام بناءً على الدور
    if (isImposter) {
        // واجهة المحتال
        list.innerHTML = `
            <li class="imposter-task">😈 تخلص من أفراد الطاقم بصمت.</li>
            <li class="imposter-task">😈 قم بتخريب الأجهزة في الطوابق.</li>
            <li class="imposter-task">😈 تظاهر بأنك تقوم بالمهام العادية.</li>
        `;
    } else {
        // واجهة المسالم (توزيع 4 مهام عشوائية)
        const myTasks = [...floorTasks].sort(() => 0.5 - Math.random()).slice(0, 4);
        
        myTasks.forEach(item => {
            const li = document.createElement('li');
            li.className = "task-item";
            li.innerHTML = `
                <label>
                    <input type="checkbox" class="task-check"> 
                    <span>[${item.f}] ${item.t}</span>
                </label>
            `;
            
            // مستمع الحدث عند إكمال المهمة
            const checkbox = li.querySelector('input');
            checkbox.onchange = (ev) => {
                if (ev.target.checked) {
                    li.classList.add('completed');
                    checkbox.disabled = true; // منع إلغاء المهمة بعد إكمالها
                    updateGlobalScore();
                }
            };
            list.appendChild(li);
        });
    }

    // 3. منطق زر الإبلاغ (Report)
    const reportBtn = document.getElementById('btn-report');
    if (reportBtn) {
        reportBtn.onclick = () => {
            set(ref(db, 'game/alarm'), true);
            alert("📢 تم الإرسال! اجتمعوا الآن لمناقشة من هو المحتال!");
            // إغلاق الإنذار تلقائياً بعد 5 ثوانٍ
            setTimeout(() => set(ref(db, 'game/alarm'), false), 5000);
        };
    }
}

/**
 * تحديث النقاط الكلية في قاعدة البيانات
 */
function updateGlobalScore() {
    const scoreRef = ref(db, 'game/score');
    // استخدام onlyOnce لضمان عدم حدوث Loop (حلقة مفرغة) عند التحديث
    onValue(scoreRef, (snap) => {
        const currentScore = snap.val() || 0;
        set(scoreRef, currentScore + 1);
    }, { onlyOnce: true });
}