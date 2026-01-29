import { ref, set, onValue, runTransaction } from "firebase/database";
import { db } from "./firebase"; 
import { floorTasks } from "./tasks";

/**
 * وظيفة رسم صفحة اللعبة وتوزيع الأدوار والمهام
 */
export function renderGamePage(container, playerName) {
    // تحديد الدور عشوائياً لكل لاعب (20% محتال)
    const isImposter = Math.random() < 0.20;

    // 1. بناء واجهة البطاقة والمهام
    container.innerHTML = `
        <div id="screen-game" class="container">
            <div id="role-card" class="card ${isImposter ? 'imposter' : 'crewmate'}">
                <div class="card-header">
                    <h2 id="role-title">${isImposter ? 'أنت المحتال 😈' : 'أنت مسالم 😇'}</h2>
                </div>
                <div class="card-body">
                    <p class="player-label">اللاعب: <strong>${playerName}</strong></p>
                    
                    <div class="progress-container">
                        <span>إجمالي مهام الطاقم:</span>
                        <div class="progress-bar-bg">
                            <div id="global-progress-fill" class="progress-fill"></div>
                        </div>
                    </div>

                    <div id="tasks-section" class="tasks-box">
                        <h3>مهامك الشخصية:</h3>
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
    const progressFill = document.getElementById('global-progress-fill');

    // 2. مراقبة العداد العالمي وتحديث الشريط عند الجميع
    onValue(ref(db, 'game/score'), (snap) => {
        const totalScore = snap.val() || 0;
        const winTarget = 20; // الهدف الكلي لجميع اللاعبين
        const percentage = Math.min((totalScore / winTarget) * 100, 100);
        if (progressFill) {
            progressFill.style.width = percentage + "%";
        }
    });

    // 3. توزيع المهام بناءً على الدور
    if (isImposter) {
        list.innerHTML = `<li class="imposter-task">😈 تخلص من الطاقم خفية وعطل مهامهم!</li>`;
    } else {
        // اختيار 4 مهام عشوائية للمسالم
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
            
            const checkbox = li.querySelector('input');
            checkbox.onchange = (ev) => {
                if (ev.target.checked) {
                    li.classList.add('completed');
                    checkbox.disabled = true; 
                    incrementGlobalScore(); // زيادة العداد عند الجميع
                }
            };
            list.appendChild(li);
        });
    }

    // 4. منطق زر الإبلاغ
    document.getElementById('btn-report').onclick = () => {
        set(ref(db, 'game/alarm'), true);
        alert("📢 بلاااااغ! جثة مكتشفة!");
        setTimeout(() => set(ref(db, 'game/alarm'), false), 5000);
    };
}

/**
 * دالة زيادة العداد العالمي في Firebase بطريقة آمنة
 */
function incrementGlobalScore() {
    const scoreRef = ref(db, 'game/score');
    // نستخدم Transaction لضمان عدم حدوث تداخل إذا أنهى شخصان مهمة في نفس الثانية
    runTransaction(scoreRef, (currentScore) => {
        return (currentScore || 0) + 1;
    });
}