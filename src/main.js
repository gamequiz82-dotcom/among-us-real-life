import './style.css';
import { renderGamePage } from './gamePage';
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

const appDiv = document.getElementById('app');

// رسم صفحة الدخول أولاً
function renderLogin() {
    appDiv.innerHTML = `
        <div id="screen-login" class="container">
            <h1>AMONG US</h1>
            <input type="text" id="username" placeholder="ادخل اسمك المستعار...">
            <button id="btn-join" class="btn-main">انضمام للطاقم</button>
        </div>
    `;

    document.getElementById('btn-join').onclick = () => {
        const name = document.getElementById('username').value.trim();
        if (name) renderGamePage(appDiv, name);
        else alert("أدخل اسمك!");
    };
}

// مراقبة شريط المهام والإنذار بشكل دائم
onValue(ref(db, 'game/score'), (snap) => {
    const bar = document.getElementById('progress-bar');
    if (bar) {
        const percent = Math.min(((snap.val() || 0) / 20) * 100, 100);
        bar.style.width = percent + "%";
    }
});

renderLogin();