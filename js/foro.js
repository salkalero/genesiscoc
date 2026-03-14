import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// CONFIGURACIÓN DE TU FIREBASE (Sustituye con tus datos reales si son distintos)
const firebaseConfig = {
    apiKey: "AIzaSyBIO9an0ZFAMdvJNOuV_Mb6ulZzVego_N8",
    authDomain: "comentariosgeminis-coc.firebaseapp.com",
    projectId: "comentariosgeminis-coc",
    storageBucket: "comentariosgeminis-coc.firebasestorage.app",
    messagingSenderId: "227180378242",
    appId: "1:227180378242:web:7ab611322962fba91fdc9b"
};

const CLAVE_CLAN = "Genesis_2026_Elite"; // DEBE coincidir con la de las reglas

const loader = document.getElementById('loader');
const commentsContainer = document.getElementById('commentsContainer');
const sendBtn = document.getElementById('sendBtn');
const userNameInput = document.getElementById('userName');
const commentTextInput = document.getElementById('commentText');

let db, auth, currentUser;
const appId = 'genesis-coc'; 

const init = async () => {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        await signInAnonymously(auth);

        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                if (loader) loader.style.display = 'none';
                setupCommentsListener();
            }
        });

        setupForm();
    } catch (err) {
        console.error("Fallo al iniciar el clan:", err);
    }
};

function setupCommentsListener() {
    const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'debate');

    onSnapshot(colRef, (snapshot) => {
        const comments = [];
        snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() }));
        
        comments.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        commentsContainer.innerHTML = '';
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="text-white/60 text-center italic py-10">El foro está despejado.</p>';
        } else {
            comments.forEach(c => {
                const date = c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleDateString() : '...';
                const div = document.createElement('div');
                div.className = 'comment-bubble p-4 mb-4';
                div.innerHTML = `
                    <div class="flex justify-between items-start mb-2 border-b border-amber-900/10 pb-1">
                        <span class="font-black text-amber-900 uppercase text-xs italic">${c.author || 'Aldeano'}</span>
                        <span class="text-[10px] text-amber-800/60 font-bold">${date}</span>
                    </div>
                    <p class="text-amber-950 font-medium leading-tight text-sm">${c.text || ''}</p>
                `;
                commentsContainer.appendChild(div);
            });
        }
    });
}

function setupForm() {
    sendBtn.onclick = async () => {
        const author = userNameInput.value.trim();
        const text = commentTextInput.value.trim();

        if (!author || !text) return;

        sendBtn.disabled = true;
        sendBtn.innerText = 'ENVIANDO...';

        try {
            const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'debate');
            await addDoc(colRef, {
                author: author,
                text: text,
                createdAt: serverTimestamp(),
                userId: currentUser.uid,
                clave_secreta: CLAVE_CLAN // LA LLAVE QUE ABRE LAS REGLAS
            });
            commentTextInput.value = '';
        } catch (error) {
            console.error("Error de permisos:", error);
            alert("Acceso denegado. Solo la versión oficial del clan puede publicar.");
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerText = 'Publicar Comentario';
        }
    };
}

init();