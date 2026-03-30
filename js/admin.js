import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBIO9an0ZFAMdvJNOuV_Mb6ulZzVego_N8",
    authDomain: "comentariosgeminis-coc.firebaseapp.com",
    projectId: "comentariosgeminis-coc",
    storageBucket: "comentariosgeminis-coc.firebasestorage.app",
    messagingSenderId: "227180378242",
    appId: "1:227180378242:web:7ab611322962fba91fdc9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const appId = 'genesis-coc';

const customMsg = document.getElementById('customMsg');

function showMsg(text, isError = false) {
    customMsg.innerText = text;
    customMsg.style.borderColor = isError ? '#b91c1c' : '#fcc200';
    customMsg.style.display = 'block';
    setTimeout(() => { customMsg.style.display = 'none'; }, 3000);
}

// Función para obtener la IP pública del usuario
async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) { return "IP-Oculta"; }
}

function createPlayerRow() {
    const div = document.createElement('div');
    div.className = "p-3 bg-white/80 rounded-xl border-2 border-amber-900/10 flex flex-col gap-2 relative mb-2";
    div.innerHTML = `
        <button class="absolute top-1 right-2 text-red-600 font-bold text-xs" onclick="this.parentElement.remove()">X</button>
        <div class="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Nombre" class="p-2 rounded border text-sm font-bold pName">
            <select class="p-2 rounded border font-bold text-xs pStatus">
                <option value="ascenso">🏆 Ascenso</option>
                <option value="penalizacion">💀 Penalización</option>
                <option value="degradacion">⏳ Degradación</option>
            </select>
        </div>
        <input type="text" placeholder="Motivo..." class="w-full p-2 rounded border text-[10px] pDesc">
    `;
    document.getElementById('playersList').appendChild(div);
}

// Inicialización de botones
document.getElementById('addPlayerBtn').onclick = createPlayerRow;
createPlayerRow(); // Crea la primera fila al cargar

document.getElementById('publishBtn').onclick = async () => {
    const type = document.getElementById('eventType').value;
    const date = document.getElementById('eventDate').value.trim();
    const title = document.getElementById('eventTitle').value.trim();
    const key = document.getElementById('masterKey').value.trim();

    if (!title || !date || !key) return showMsg("Rellena todos los campos", true);

    const players = [];
    document.querySelectorAll('#playersList > div').forEach(row => {
        const name = row.querySelector('.pName').value.trim();
        if (name) {
            players.push({
                name: name,
                statusType: row.querySelector('.pStatus').value,
                desc: row.querySelector('.pDesc').value.trim()
            });
        }
    });

    if (players.length === 0) return showMsg("Añade al menos un guerrero", true);

    const btn = document.getElementById('publishBtn');
    btn.disabled = true;
    btn.innerText = 'VALIDANDO...';

    // 1. CAPTURAR INFORMACIÓN TÉCNICA (TRAZABILIDAD)
    const ip = await getIP();
    const metadata = {
        ip: ip,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        intentKey: key, // Registramos la clave usada para pillar al impostor
        context: "Admin Panel"
    };

    try {
        await signInAnonymously(auth);

        // 2. REGISTRO DE ACTIVIDAD (SIEMPRE SE GUARDA, TENGA ÉXITO O NO)
        const logRef = collection(db, 'artifacts', appId, 'public', 'data', 'registro_actividad');
        await addDoc(logRef, metadata);

        // 3. PUBLICACIÓN DE LA BITÁCORA (SOLO SI LA CLAVE ES CORRECTA EN LAS REGLAS)
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'estatus_eventos');
        await addDoc(colRef, {
            type, date, title, players,
            createdAt: serverTimestamp(),
            clave_secreta: key,
            _trazabilidad: metadata
        });

        showMsg("¡Bitácora actualizada, Líder!");
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        console.error("Fallo de seguridad:", error);
        // El log ya se guardó antes del catch, así que ya tenemos su IP.
        showMsg("CLAVE INCORRECTA. Prueba otra vez.", true);
    } finally {
        btn.disabled = false;
        btn.innerText = 'Publicar Cambios';
    }
};