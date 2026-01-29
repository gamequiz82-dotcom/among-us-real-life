import { ref, set, onValue, runTransaction, update } from "firebase/database";
import { db } from "./firebase"; 
import { floorTasks } from "./tasks";

/**
 * وظيفة رسم صفحة اللعبة وتوزيع الأدوار
 * @param {HTMLElement} container - الحاوية
 * @param {string} playerName - اسم اللاعب
 * @param {string} roomCode - رمز الغرفة (مثلاً: AB123)
 * @param {boolean} isHost - هل اللاعب هو منشئ الغرفة
 */
export function renderGamePage(container, playerName, roomCode, isHost) {
    // 1. واجهة صالة الانتظار (Lobby) قبل بدء اللعبة
    renderLobby(container, playerName, roomCode, isHost);
}

function renderLobby(container, playerName, roomCode, isHost) {
    const roomRef = ref(db, `rooms/${roomCode}`);

    onValue(roomRef, (snapshot) => {
        const roomData = snapshot.val();
        if (!roomData) return;

        // إذا بدأت اللعبة من قبل المضيف، ننتقل لشاشة البطاقات
        if (roomData.status === "started") {
            const myRole = roomData.players[playerName].role;
            renderActualGame(container, playerName, roomCode, myRole);
            return;
        }

        const players = Object.keys(roomData.players || {});
        
        container.innerHTML = `
            <div class="container lobby-screen">
                <h2>رمز الغرفة: <span class="room-code">${roomCode}</span></h2>
                <div class="players-list">
                    <h3>اللاعبون المتصلون (${players.length}):</h3>
                    <ul>${players.map(p => `<li>👤 ${p} ${p === playerName ? "(أنت)" : ""}</li>`).join('')}</ul>
                </div>
                ${isHost ? `<button id="btn-start-game" class="btn-main">ابدأ اللعبة 🚀</button>` : `<p>بانتظار المضيف لبدء اللعبة...</p>`}
            </div>
        `;

        if (isHost) {
            document.getElementById('btn-start-game').onclick = () => startGame(roomCode, players);
        }
    });
}

// توزيع الأدوار عشوائياً عند بدء اللعبة
function startGame(roomCode, players) {
    const imposterIndex = Math.floor(Math.random() * players.length);
    const updates = {};
    
    players.forEach((name, index) => {
        updates[`rooms/${roomCode}/players/${name}/role`] = (index === imposterIndex) ? 'imposter' : 'crewmate';
    });
    
    updates[`rooms/${roomCode}/status`] = "started";
    updates[`rooms/${roomCode}/score`] = 0;
    
    update(ref(db), updates);
}

function renderActualGame(container, playerName, roomCode, role) {
    const isImposter = (role === 'imposter');
    
    container.innerHTML = `
        <div id="screen-game" class="container">
            <div id="role-card" class="card ${isImposter ? 'imposter' : 'crewmate'}">
                <div class="card-header">
                    <h2>${isImposter ? 'أنت المحتال 😈' : 'أنت مسالم 😇'}</h2>
                </div>
                <div class="card-body">
                    <p>الغرفة: ${roomCode} | اللاعب: ${playerName}</p>
                    <div class="progress-container">
                        <span>تقدم مهام الغرفة:</span>
                        <div class="progress-bar-bg"><div id="room-progress" class="progress-fill"></div></div>
                    </div>
                    <ul id="tasks-list"></ul>
                </div>
                <button id="btn-report" class="report-btn">📢 REPORT</button>
            </div>
        </div>
    `;

    // تحديث العداد الخاص بهذه الغرفة فقط
    onValue(ref(db, `rooms/${roomCode}/score`), (snap) => {
        const score = snap.val() || 0;
        const percent = Math.min((score / 20) * 100, 100);
        document.getElementById('room-progress').style.width = percent + "%";
    });

    const list = document.getElementById('tasks-list');
    if (isImposter) {
        list.innerHTML = `<li>😈 تخلص من الجميع بصمت!</li>`;
    } else {
        const myTasks = [...floorTasks].sort(() => 0.5 - Math.random()).slice(0, 4);
        myTasks.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<label><input type="checkbox"> [${item.f}] ${item.t}</label>`;
            li.querySelector('input').onchange = (e) => {
                if (e.target.checked) {
                    e.target.disabled = true;
                    incrementRoomScore(roomCode); // زيادة العداد للغرفة
                }
            };
            list.appendChild(li);
        });
    }
}

function incrementRoomScore(roomCode) {
    runTransaction(ref(db, `rooms/${roomCode}/score`), (s) => (s || 0) + 1);
}