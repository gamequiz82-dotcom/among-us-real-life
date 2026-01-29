import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, update } from "firebase/database";

// إعدادات Firebase مع الرابط الصحيح الذي أرسلته
const firebaseConfig = {
    apiKey: "AIzaSyAotL3T-CGSl4A5fOufUpdm-PLmRZf4uiE",
    authDomain: "rel-among-us.firebaseapp.com",
    projectId: "rel-among-us",
    databaseURL: "https://rel-among-us-default-rtdb.firebaseio.com/",
    storageBucket: "rel-among-us.firebasestorage.app",
    messagingSenderId: "496715666522",
    appId: "1:496715666522:web:4469732cd95f50a866b463"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// قائمة مهام ضخمة ومتنوعة (أكثر من 20 مهمة)
const floorTasks = [
    // الطابق الأرضي
    { f: "الأرضي", t: "ترتيب أكياس الدقيق والخبز" },
    { f: "الأرضي", t: "مسح مدخل المنزل الرئيسي" },
    { f: "الأرضي", t: "التأكد من قفل النوافذ الأرضية" },
    { f: "الأرضي", t: "سقي النباتات عند المدخل" },
    { f: "الأرضي", t: "ترتيب الأحذية في الخزانة" },
    
    // الطابق الثاني (المطبخ وغرف النوم)
    { f: "الثاني", t: "غسل 5 أطباق في المطبخ" },
    { f: "الثاني", t: "تنظيف مائدة الطعام" },
    { f: "الثاني", t: "إخراج القمامة من المطبخ" },
    { f: "الثاني", t: "ترتيب وسائد الصالون" },
    { f: "الثاني", t: "تفريغ غسالة الأطباق" },
    { f: "الثاني", t: "ملء زجاجات الماء للثلاجة" },

    // الطابق الثالث (غرف الضيوف والجلوس)
    { f: "الثالث", t: "تعطير غرفة الضيوف" },
    { f: "الثالث", t: "تلميع مرآة الصالة" },
    { f: "الثالث", t: "ترتيب الكتب على الرف" },
    { f: "الثالث", t: "تعديل وضعية السجاد" },
    { f: "الثالث", t: "مسح الغبار عن التلفاز" },
    { f: "الثالث", t: "التخلص من الأوراق القديمة" },

    // الطابق الرابع (السطح والغسيل)
    { f: "الرابع", t: "وضع الملابس في الغسالة" },
    { f: "الرابع", t: "فرز الملابس الملونة" },
    { f: "الرابع", t: "تنظيف فلتر النشافة" },
    { f: "الرابع", t: "ترتيب صناديق التخزين" },
    { f: "الرابع", t: "مسح كراسي السطح" },
    { f: "الرابع", t: "التأكد من إغلاق باب السطح" }
];

// معالجة الضغطات باستخدام Event Delegation
document.addEventListener('click', (e) => {
    // زر الانضمام
    if (e.target && e.target.id === 'btn-join') {
        const name = document.getElementById('username').value.trim();
        if (!name) return alert("الرجاء إدخال الاسم!");
        
        // احتمال 20% أن يكون اللاعب محتالاً
        const isImposter = Math.random() < 0.20;
        setupGameUI(name, isImposter);
    }

    // زر الإبلاغ
    if (e.target && e.target.id === 'btn-report') {
        set(ref(db, 'game/alarm'), true);
        alert("📢 بلاااااغ! جثة مكتشفة! اجتمعوا فوراً للبحث عن المحتال!");
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
        list.innerHTML = "<li style='color: #ff4d4d; font-weight: bold;'>مهمتك: تخلص من الطاقم خفية وعطل مهامهم!</li>";
    } else {
        card.className = "card crewmate";
        title.innerText = "أنت مسالم 😇";
        
        // اختيار 4 مهام عشوائية تماماً من القائمة الطويلة
        const myTasks = [...floorTasks].sort(() => 0.5 - Math.random()).slice(0, 4);
        list.innerHTML = "";
        
        myTasks.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<input type="checkbox" class="task-check"> <span>[${item.f}] ${item.t}</span>`;
            
            li.querySelector('input').onchange = (ev) => {
                if (ev.target.checked) {
                    li.style.textDecoration = "line-through";
                    li.style.opacity = "0.6";
                    updateGlobalScore();
                }
            };
            list.appendChild(li);
        });
    }
}

function updateGlobalScore() {
    onValue(ref(db, 'game/score'), (snap) => {
        const currentScore = snap.val() || 0;
        set(ref(db, 'game/score'), currentScore + 1);
    }, { onlyOnce: true });
}

// الاستماع المباشر لتحديث شريط المهام عند الجميع
onValue(ref(db, 'game/score'), (snap) => {
    const score = snap.val() || 0;
    const bar = document.getElementById('progress-bar');
    if (bar) {
        // نعتبر أن الفوز يتطلب إنهاء 20 مهمة من مجموع مهام اللاعبين
        const winThreshold = 20; 
        const percent = Math.min((score / winThreshold) * 100, 100);
        bar.style.width = percent + "%";
    }
});

// مراقبة حالة الإنذار (تغيير الخلفية للأحمر)
onValue(ref(db, 'game/alarm'), (snap) => {
    if (snap.val() === true) {
        document.body.style.boxShadow = "inset 0 0 100px red";
        document.body.style.backgroundColor = "#330000";
        setTimeout(() => {
            document.body.style.boxShadow = "none";
            document.body.style.backgroundColor = "#0d1117";
        }, 3000);
    }
});