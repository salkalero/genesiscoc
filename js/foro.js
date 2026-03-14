import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/**
 * CONFIGURACIÓN PARA GITHUB PAGES
 */
const firebaseConfigManual = {
    apiKey: "AIzaSyBIO9an0ZFAMdvJNOuV_Mb6ulZzVego_N8",
    authDomain: "comentariosgeminis-coc.firebaseapp.com",
    projectId: "comentariosgeminis-coc",
    storageBucket: "comentariosgeminis-coc.firebasestorage.app",
    messagingSenderId: "227180378242",
    appId: "1:227180378242:web:7ab611322962fba91fdc9b"
};

// Elementos del DOM
const loader = document.getElementById('loader');
const loaderContent = document.getElementById('loaderContent');
const commentsContainer = document.getElementById('commentsContainer');
const sendBtn = document.getElementById('sendBtn');
const userNameInput = document.getElementById('userName');
const commentTextInput = document.getElementById('commentText');

let currentUser = null;
let db = null;
let appId = null;

/**
 * Función de reintento con retroceso exponencial
 */
async function withRetry(fn, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try { return await fn(); }
        catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
}

/**
 * Inicialización principal
 */
const init = async () => {
    try {
        // 1. Decidir qué configuración usar (Prioriza la del sistema IA si existe)
        let config = null;
        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
            config = typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config;
        } else {
            config = firebaseConfigManual;
        }

        if (!config || !config.apiKey) throw new Error("Configuración de Firebase no válida.");

        const app = initializeApp(config);
        const auth = getAuth(app);
        db = getFirestore(app);
        
        // Identificador de la aplicación
        appId = typeof __app_id !== 'undefined' ? __app_id : 'genesis-coc-prod';

        // 2. Autenticación antes de empezar (Regla 3)
        await withRetry(async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        });

        // 3. Listener de estado de Auth
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            if (user) {
                if (loader) loader.style.display = 'none';
                setupCommentsListener();
            }
        });

        setupForm();

    } catch (err) {
        console.error("Error en init:", err);
        if (loaderContent) {
            loaderContent.innerHTML = `
                <div class="bg-red-900/80 p-6 rounded-2xl border-2 border-red-500 shadow-2xl max-w-sm mx-auto">
                    <p class="text-white font-bold mb-2 uppercase">Error de Conexión</p>
                    <p class="text-white/70 text-xs mb-4">${err.message}</p>
                    <button onclick="location.reload()" class="w-full bg-white text-red-700 py-2 rounded-lg font-black text-sm uppercase">Reintentar Búsqueda</button>
                </div>`;
            loaderContent.classList.remove('animate-pulse');
        }
    }
};

function setupCommentsListener() {
    if (!currentUser || !db) return;

    // Ruta estricta según Regla 1
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'debate');

    onSnapshot(colRef, (snapshot) => {
        const comments = [];
        snapshot.forEach(doc => {
            comments.push({ id: doc.id, ...doc.data() });
        });

        // Ordenar en memoria (Regla 2: Sin queries complejas)
        comments.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        renderComments(comments);
    }, (err) => {
        console.error("Error Firestore:", err);
    });
}

function renderComments(comments) {
    if (!commentsContainer) return;
    commentsContainer.innerHTML = '';

    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p class="text-white/60 text-center italic py-10">El clan está en silencio... ¡Sé el primero en hablar!</p>';
        return;
    }

    comments.forEach(c => {
        const date = c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : 'Enviando...';
        const div = document.createElement('div');
        div.className = 'comment-bubble p-4 mb-4';
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2 border-b border-amber-900/10 pb-1">
                <span class="font-black text-amber-900 uppercase text-xs italic tracking-tight">${c.author || 'Aldeano'}</span>
                <span class="text-[10px] text-amber-800/60 font-bold">${date}</span>
            </div>
            <p class="text-amber-950 font-medium leading-tight text-sm">${c.text || ''}</p>
        `;
        commentsContainer.appendChild(div);
    });
}

function setupForm() {
    if (!sendBtn) return;

    sendBtn.onclick = async () => {
        if (!currentUser || !db) return;

        const author = userNameInput.value.trim();
        const text = commentTextInput.value.trim();

        if (!author || !text) return;

        sendBtn.disabled = true;
        const originalText = sendBtn.innerText;
        sendBtn.innerText = 'ENVIANDO...';

        try {
            const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'debate');
            await addDoc(colRef, {
                author: author,
                text: text,
                createdAt: serverTimestamp(),
                userId: currentUser.uid
            });
            commentTextInput.value = '';
        } catch (error) {
            console.error("Error al publicar:", error);
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerText = originalText;
        }
    };
}

init();