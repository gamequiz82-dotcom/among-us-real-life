import './style.css';
import { renderHome } from './homePage.jsx'; 
import { renderGamePage } from './gamePage.jsx';
import { ref, set, get, update } from "firebase/database";
import { db } from "./firebase";

const appDiv = document.getElementById('app');

/**
 * دالة لتوليد رمز غرفة عشوائي مكون من 5 محارف
 */
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // تجنب الأحرف المتشابهة مثل 0 و O
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * 1. تشغيل التطبيق وعرض الصفحة الرئيسية
 */
function startApp() {
    renderHome(appDiv, () => {
        // عند الضغط على "انضمام للعبة"
        renderJoinFlow();
    });

    // منطق زر "إنشاء غرفة جديدة"
    const createBtn = document.getElementById('btn-create-room');
    if (createBtn) {
        createBtn.onclick = async () => {
            const name = prompt("أدخل اسمك كمنشئ للغرفة:");
            if (!name) return;

            const newCode = generateRoomCode();
            
            // إنشاء الغرفة في Firebase
            await set(ref(db, `rooms/${newCode}`), {
                status: "waiting",
                score: 0,
                host: name,
                players: {
                    [name]: { name: name, role: "waiting" }
                }
            });

            alert(`تم إنشاء الغرفة! رمز الدخول هو: ${newCode}`);
            // الانتقال لصفحة اللعبة (صالة الانتظار) كمسؤول
            renderGamePage(appDiv, name, newCode, true); 
        };
    }
}

/**
 * 2. تدفق الانضمام لغرفة موجودة
 */
async function renderJoinFlow() {
    const code = prompt("أدخل رمز الغرفة (5 خانات):")?.toUpperCase();
    if (!code) return;

    // التحقق من وجود الغرفة في Firebase
    const roomSnap = await get(ref(db, `rooms/${code}`));
    
    if (roomSnap.exists()) {
        const name = prompt("أدخل اسمك المستعار للانضمام:");
        if (!name) return;

        // إضافة اللاعب للغرفة
        await set(ref(db, `rooms/${code}/players/${name}`), {
            name: name,
            role: "waiting"
        });

        // الانتقال لصفحة اللعبة (صالة الانتظار) كلاعب عادي
        renderGamePage(appDiv, name, code, false);
    } else {
        alert("عذراً، هذا الرمز غير موجود!");
    }
}

// تشغيل التطبيق
startApp();