import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, increment, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBftM-l57eOALuvDuYq_n4qyAq_3ccwbOY",
  authDomain: "afiliadoai-208b7.firebaseapp.com",
  databaseURL: "https://afiliadoai-208b7-default-rtdb.firebaseio.com",
  projectId: "afiliadoai-208b7",
  storageBucket: "afiliadoai-208b7.firebasestorage.app",
  messagingSenderId: "307487016083",
  appId: "1:307487016083:web:6b5db01196fa65a21e3966"
};

const app  = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

// ─── AUTH: login anônimo automático ──────────────────────────
export async function loginAnonimo() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) { resolve(user); }
      else {
        const cred = await signInAnonymously(auth);
        resolve(cred.user);
      }
    });
  });
}

// ─── REGISTRAR CLIQUE ────────────────────────────────────────
export async function registrarClique(productId, productName, affiliateLink) {
  try {
    await addDoc(collection(db, "cliques"), {
      productId,
      productName,
      affiliateLink,
      timestamp: new Date(),
      data: new Date().toLocaleDateString("pt-BR")
    });
  } catch(e) { console.error("Erro clique:", e); }
}

// ─── REGISTRAR VENDA ─────────────────────────────────────────
export async function registrarVenda(productId, productName, commission) {
  try {
    await addDoc(collection(db, "vendas"), {
      productId,
      productName,
      commission: parseFloat(commission) || 0,
      timestamp: new Date(),
      data: new Date().toLocaleDateString("pt-BR")
    });
  } catch(e) { console.error("Erro venda:", e); }
}

// ─── SALVAR PRODUTO ──────────────────────────────────────────
export async function salvarProduto(produto) {
  try {
    return await addDoc(collection(db, "produtos"), {
      ...produto,
      criadoEm: new Date()
    });
  } catch(e) { console.error("Erro salvar produto:", e); }
}

// ─── GET STATS REAIS ─────────────────────────────────────────
export async function getStats() {
  try {
    const [cliquesSnap, vendasSnap] = await Promise.all([
      getDocs(collection(db, "cliques")),
      getDocs(collection(db, "vendas"))
    ]);
    const vendas = vendasSnap.docs.map(d => d.data());
    const totalComissao = vendas.reduce((acc, v) => acc + (v.commission || 0), 0);
    return {
      totalCliques:  cliquesSnap.size,
      totalVendas:   vendasSnap.size,
      totalComissao: totalComissao.toFixed(2),
    };
  } catch(e) {
    return { totalCliques: 0, totalVendas: 0, totalComissao: "0.00" };
  }
}

// ─── LISTEN TEMPO REAL ───────────────────────────────────────
export function onStatsChange(callback) {
  const unsub = onSnapshot(collection(db, "vendas"), () => {
    getStats().then(callback);
  });
  return unsub;
}
