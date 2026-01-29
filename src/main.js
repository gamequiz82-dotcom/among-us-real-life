import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAotL3T-CGSl4A5fOufUpdm-PLmRZf4uiE",
  authDomain: "rel-among-us.firebaseapp.com",
  projectId: "rel-among-us",
  databaseURL: "https://rel-among-us-default-rtdb.firebaseio.com", // تأكد من وجود هذا السطر
  storageBucket: "rel-among-us.firebasestorage.app",
  messagingSenderId: "496715666522",
  appId: "1:496715666522:web:4469732cd95f50a866b463"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// بيانات الطوابق والمهام
const floorTasks = [
    { floor: "الأرضي", task: "ترتيب أكياس الخبز" },
    { floor: "الثاني", task: "غسل الصحون بالمطبخ" },
    { floor: "الثالث", task: "تعطير غرفة الضيوف" },
    { floor: "الرابع", task: "تشغيل الغسالة" }
];

const btnJoin = document.getElementById('btn-join');
const usernameInput = document.getElementById('username');

btnJoin.onclick = () => {
    const name = usernameInput.value;
    if (!name) return alert("الرجاء كتابة اسمك");

    const isImposter = Math.random() < 0.25;
    showGame(name, isImposter);
};

function showGame(name, isImposter) {
    document.getElementById('screen-login').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');

    const card = document.getElementById('role-card');
    const title = document.getElementById('role-title');
    const list = document.getElementById('tasks-list');

    if (isImposter) {
        card.className = "card imposter";
        title.innerText = "أنت المحتال 😈";
        list.innerHTML = "<li>قم بتصفية الجميع وتخريب الطوابق!</li>";
    } else {
        card.className = "card crewmate";
        title.innerText = "أنت مسالم 😇";
        // توزيع مهمتين من طوابق مختلفة
        const myTasks = floorTasks.sort(() => 0.5 - Math.random()).slice(0, 2);
        list.innerHTML = "";
        myTasks.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="checkbox" class="task-check"> [${item.floor}] ${item.task}`;
            li.querySelector('input').onchange = (e) => {
                if(e.target.checked) updateProgress();
            };
            list.appendChild(li);
        });
    }
}

function updateProgress() {
    onValue(ref(db, 'game/score'), (snapshot) => {
        const score = snapshot.val() || 0;
        set(ref(db, 'game/score'), score + 1);
    }, { onlyOnce: true });
}

// تحديث شريط المهام للجميع لحظياً
onValue(ref(db, 'game/score'), (snapshot) => {
    const score = snapshot.val() || 0;
    const bar = document.getElementById('progress-bar');
    bar.style.width = Math.min((score / 10) * 100, 100) + "%";
});

document.getElementById('btn-report').onclick = () => {
    alert("📢 تم الإبلاغ! اجتمعوا في الطابق الثاني!");
    set(ref(db, 'game/alarm'), true);
    setTimeout(() => set(ref(db, 'game/alarm'), false), 3000);
};