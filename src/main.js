import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAotL3T-CGSl4A5fOufUpdm-PLmRZf4uiE",
    authDomain: "rel-among-us.firebaseapp.com",
    projectId: "rel-among-us",
    databaseURL: "https://rel-among-us-default-rtdb.firebaseio.com",
    storageBucket: "rel-among-us.firebasestorage.app",
    messagingSenderId: "496715666522",
    appId: "1:496715666522:web:4469732cd95f50a866b463"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// قائمة المهام
const floorTasks = [
    { f: "الأرضي", t: "جرد أدوات الخبز" },
    { f: "الثاني", t: "غسل الصحون" },
    { f: "الثالث", t: "تعطير الغرفة" },
    { f: "الرابع", t: "تشغيل الغسالة" }
];

// حل مشكلة onclick عبر مراقبة الوثيقة بالكامل
document.addEventListener('click', (e) => {
    // إذا ضغط المستخدم على زر الانضمام
    if (e.target && e.target.id === 'btn-join') {
        const name = document.getElementById('username').value.trim();
        if (!name) return alert("الرجاء إدخال الاسم!");
        const isImposter = Math.random() < 0.25;
        setupGameUI(name, isImposter);
    }

    // إذا ضغط المستخدم على زر الإبلاغ
    if (e.target && e.target.id === 'btn-report') {
        set(ref(db, 'game/alarm'), true);
        alert("📢 تم الإبلاغ! الجميع يتوجه للطابق الثالث!");
        setTimeout(() => set(ref(db, 'game/alarm'), false), 5000);
    }
});

function setupGameUI(name, isImposter) {
    document.getElementById('screen-login').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');

    const card = document.getElementById('role-card');
    const title = document.getElementById('role-title');
    const list = document.getElementById('tasks-list');

    if (isImposter) {
        card.className = "card imposter";
        title.innerText = "أنت المحتال 😈";
        list.innerHTML = "<li>تخلص من الجميع دون أن يراك أحد!</li>";
    } else {
        card.className = "card crewmate";
        title.innerText = "أنت مسالم 😇";
        const myTasks = floorTasks.sort(() => 0.5 - Math.random()).slice(0, 3);
        list.innerHTML = "";
        myTasks.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="checkbox" class="task-check"> [${item.f}] ${item.t}`;
            li.querySelector('input').onchange = (ev) => {
                if (ev.target.checked) {
                    onValue(ref(db, 'game/score'), (snap) => {
                        set(ref(db, 'game/score'), (snap.val() || 0) + 1);
                    }, { onlyOnce: true });
                }
            };
            list.appendChild(li);
        });
    }
}

// تحديث الشريط المباشر (يعمل دائماً في الخلفية)
onValue(ref(db, 'game/score'), (snap) => {
    const score = snap.val() || 0;
    const bar = document.getElementById('progress-bar');
    if (bar) bar.style.width = Math.min((score / 15) * 100, 100) + "%";
});