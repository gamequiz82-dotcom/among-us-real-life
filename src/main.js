import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";

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

// قائمة المهام حسب طوابق منزلك
const floorTasks = [
    { f: "الأرضي", t: "جرد أدوات الخبز" },
    { f: "الأرضي", t: "ترتيب أكياس الدقيق" },
    { f: "الثاني", t: "غسل الصحون (المطبخ)" },
    { f: "الثاني", t: "ترتيب غرف النوم" },
    { f: "الثالث", t: "تنظيف طاولة الضيوف" },
    { f: "الثالث", t: "تعطير غرفة الضيافة" },
    { f: "الرابع", t: "بدء دورة الغسيل" },
    { f: "الرابع", t: "فرز خردة السطح" }
];

document.addEventListener('DOMContentLoaded', () => {
    const btnJoin = document.getElementById('btn-join');
    const usernameInput = document.getElementById('username');
    const btnReport = document.getElementById('btn-report');

    btnJoin.onclick = () => {
        const name = usernameInput.value.trim();
        if (!name) return alert("الرجاء إدخال الاسم!");

        // اختيار الدور (25% احتمال محتال)
        const isImposter = Math.random() < 0.25;
        setupGameUI(name, isImposter);
    };

    function setupGameUI(name, isImposter) {
        document.getElementById('screen-login').classList.add('hidden');
        document.getElementById('screen-game').classList.remove('hidden');

        const card = document.getElementById('role-card');
        const title = document.getElementById('role-title');
        const list = document.getElementById('tasks-list');

        if (isImposter) {
            card.className = "card imposter";
            title.innerText = "أنت المحتال 😈";
            list.innerHTML = "<li>تسلل بين الطوابق وقم بتصفية الجميع بصمت!</li>";
        } else {
            card.className = "card crewmate";
            title.innerText = "أنت مسالم 😇";
            
            // اختيار 3 مهام عشوائية من طوابق مختلفة
            const myTasks = floorTasks.sort(() => 0.5 - Math.random()).slice(0, 3);
            list.innerHTML = "";
            myTasks.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<input type="checkbox" class="task-check"> [${item.f}] ${item.t}`;
                li.querySelector('input').onchange = (e) => {
                    if (e.target.checked) incrementGlobalScore();
                };
                list.appendChild(li);
            });
        }
    }

    function incrementGlobalScore() {
        onValue(ref(db, 'game/score'), (snap) => {
            const current = snap.val() || 0;
            set(ref(db, 'game/score'), current + 1);
        }, { onlyOnce: true });
    }

    // تحديث الشريط المباشر لجميع اللاعبين
    onValue(ref(db, 'game/score'), (snap) => {
        const score = snap.val() || 0;
        const totalTasksToWin = 15; // عدد المهام الكلي للفوز
        const percent = Math.min((score / totalTasksToWin) * 100, 100);
        document.getElementById('progress-bar').style.width = percent + "%";
        if (percent >= 100) alert("فاز الطاقم! تم إنجاز كافة المهام!");
    });

    btnReport.onclick = () => {
        set(ref(db, 'game/alarm'), true);
        alert("📢 تم الإبلاغ! الجميع يتوجه للطابق الثالث الآن!");
        setTimeout(() => set(ref(db, 'game/alarm'), false), 5000);
    };

    // مراقبة الإنذار (تغيير لون الخلفية عند الجميع)
    onValue(ref(db, 'game/alarm'), (snap) => {
        if (snap.val() === true) {
            document.body.style.backgroundColor = "#ff0000";
            setTimeout(() => document.body.style.backgroundColor = "#0d1117", 2000);
        }
    });
});